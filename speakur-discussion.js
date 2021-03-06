/**
 * @license
 * Copyright (c) 2015 Preston Landers. All rights reserved.
 * This code may only be used under the BSD style license found at http://Preston-Landers.github.io/speakur-discussion/LICENSE.txt
 * The complete set of authors may be found at http://Preston-Landers.github.io/speakur-discussion/AUTHORS.txt
 * The complete set of contributors may be found at http://Preston-Landers.github.io/speakur-discussion/CONTRIBUTORS.txt
 *
 */
(function (document) {
    'use strict';

    Polymer({
        /**
         * The `xtitle` attribute determines the title of the discussion. Defaults to the containing
         * page's title. This really only sets the default/initial title for the thread - you can
         * also change the thread title directly in the FB database.
         *
         * Note that I can't name this title due to it being a built in HTML attribute apparently...?
         *
         * @attribute xtitle
         * @type string
         * @default window.document.title
         */
        xtitle: window.document.title,

        /**
         * The `href` attribute determines the "target" of the discussion. Defaults to the containing page's location.
         * Changing the `href` will automatically switch the view to a different discussion thread.
         *
         * `href` is a very important concept for `Speakur-discussion`. It is the official unique name of the
         * discussion. It defaults to the window location URL, but this is *not* necessarily the correct value.
         * For instance, your site may have many different views (at different URLs) of an abstract data object
         * like a 'Project' that has a canonical URL. If you want to attach the discussion to the 'Project'
         * no matter what its current view, then set the href to the canonical URL of the project, such as:
         * `site.example.com/projects/HappyFunProject`
         *
         * Note that URLs that only differ by protocol and case sensitivity will be treated the same in terms
         * of which threadId they map to. The href is normalized and turned into a threadId by the following rules:
         *
         *   * lowercased
         *   * protocol is removed, if any  (such as `http://` or `https://`)
         *   * port is NOT removed by normalization, nor are query parameters
         *   * md5 hash of normalized version is used as threadId
         *
         * @attribute href
         * @type string
         * @default window.location.href
         */
        href: window.location.href,

        /**
         * The `theme` attribute determines the style or look and feel of the discussion box.
         * Setting the attribute only affects users who are not logged in, otherwise it
         * uses the theme setting from the user profile.
         *
         * Currently available themes are:
         *      speakur-theme-grey
         *      speakur-theme-blue
         *      speakur-theme-red
         *
         * @attribute theme
         * @type string
         * @default {a default theme}
         */
        theme: 'speakur-theme-grey',

        /**
         * Determines whether the comment box is open (expanded) by default.
         *
         * @attribute initiallyOpen
         * @type boolean
         * @default false
         */
        initiallyOpen: false,

        /**
         * The `moderators` attribute determines the users who are allowed to moderate this forum. The users are
         * represented as Firebase User IDs, comma separated.
         *
         * (TODO: non functional!)
         *
         * @attribute moderators
         * @type string
         * @default (None)
         */
        moderators: '',

        /**
         * Whether to allow anonymous comments.  Anon comments have their IP address recorded but that's it.
         *
         * @attribute allowAnonymous
         * @type boolean
         * @default false
         */
        allowAnonymous: false,

        /**
         * Record the IP address of anonymous commenters.
         *
         * @attribute recordIP
         * @type boolean
         * @default true
         */
        recordIP: true,

        loadIP: function (e, detail, sender) {
            var geodata = detail[1][0];

            // remove some keys we don't care about/want
            delete geodata['zip_code'];
            delete geodata['time_zone'];
            delete geodata['country_name'];

            this.globals.geodata = geodata;
            // console.log("found ip:", geodata);
        },

        /**
         * The `firebaseLocation` attribute determines the source database URL for the comments. A default
         * database will be used if none is provided.  If using the public (default) Speakur firebase then
         * you must incorporate your domain name in the `href` field.
         *
         * @attribute firebaseLocation
         * @type string
         * @default (a suitable default is provided)
         */
        firebaseLocation: 'https://speakur-demo.firebaseio.com',

        /**
         * the threadId this discussion is participating in. This is automatically derived from
         * `href` and should not be set directly.
         *
         * @property threadId
         * @type string
         */
        threadId: null,

        /**
         * the amount of time in MS to animate the opening or closing of the discussion widget.
         *
         * @property openAnimMS
         * @type int
         * @default 400
         */
        openAnimMS: 400,

        /**
         * maximum width in pixels the comment area will occupy when open
         *
         * @property maxWidth
         * @type int
         * @default 1100
         */
        maxWidth: 1100,

        /**
         * This is true when the discussion widget is closed (collapsed). Use the
         * `toggle` method to change the state.
         *
         * @property closed
         * @type boolean
         * @default true
         */
        closed: true,

        // thread: null,

        // Used in a few places to link to the software
        speakurSoftwareLink: 'https://github.com/Preston-Landers/speakur-discussion',

        /**
         * The `global-tick` event is fired on a regular schedule
         * so that the globals.updateTick can be put in expressions to have
         * something that regularly changes (forcing re-eval)
         *
         * @event global-tick
         */
        globalTick: function () {
            this.globals.updateTick = new Date();
            this.job('global-tick', function () {
                this.fire('global-tick');
            }, 20000);
        },

        ready: function () {
            // Ready is a lifecycle callback.
            // You can do setup work in here.
            // More info: http://www.polymer-project.org/docs/polymer/polymer.html#lifecyclemethods
            // this.title = 'ok?';

            this.globals.anon_author = {
                uid: 'anon',
                username: 'Anonymous'  // this may not get displayed anywhere...
            };

            // Set up a function to allow you to generate a 'current author' record from anywhere
            // Not sure this is the ideal place for this.
            var this_globals = this.globals;
            this.globals.getAuthor = function () {
                var author;
                if (this_globals.profile) {
                    author = {
                        uid: this_globals.profile.uid,
                        username: this_globals.profile.username,
                        picture_link: this_globals.profile.picture_link,
                        md5_hash: this_globals.profile.md5_hash
                    };
                } else {
                    author = _.clone(this_globals.anon_author, true);

                    // record IP & approx. location of anonymous authors
                    if (this_globals.geodata) {
                        author['geo'] = _.clone(this_globals.geodata, true);
                    }
                }
                return author;
            };


            // maximum number of old post revisions to keep
            this.globals.maxPostRevisionsKeep = 5;

            this.globals.isAdmin = false;

            this.globals.allowAnonymous = this.allowAnonymous;

            // A few layout changes depend on this flag for small screen (e.g. phone) devices
            this.globals.smallScreen = (window.innerWidth <= 800);

            // Start the 'global tick' which is updated every X seconds
            // to be used in expressions like globals.updateTick to give them an 'expiration time'
            this.fire('global-tick');

            // This is probably global to the page, isn't it??
            marked.setOptions({
                gfm: true,   // github flavored markdown?
                tables: true,
                breaks: false,  // ?
                pedantic: false,
                sanitize: true,
                smartLists: true,
                silent: false,
                // highlight: true, // null
                smartypants: true  // auto smart quotes, ellipses, etc?
            });


            this.setThreadIdFromHref();

            if (this.initiallyOpen) {
                this.toggle();
            }
        },

        nyiClick: function() {
            this.errorLog("Not yet implemented.");
            this.toast(this.$$('not_yet_implemented'));
        },

        handleToastEvent: function (e, detail, sender) {
            var msg = detail;
            var toastElem = 'speakur-toast';
            var toast = this.$[toastElem];
            if (!toast) {
                this.errorLog(toastElem + " element is missing?");
                e.stopPropagation();
                return;
            }
            toast.text=msg;
            toast.show();
            e.stopPropagation();
        },


        toggle: function () {
            // toggle w/ animation the inner content
            var animDuration = this.openAnimMS; // ms
            this.$.mainCollapse.duration = animDuration * 0.001;  // convert to seconds
            this.$.mainCollapse.toggle();

            // animate the overall container width as well.
            var container = this.$['speakur-container'];
            var direction = this.closed ? 'normal' : 'reverse';
            var player = container.animate([
                    {'max-width': '400px'},
                    {'max-width': this.maxWidth.toString() + 'px'}
                ],
                {
                    fill: 'both',
                    duration: animDuration,
                    direction: direction
                });

            // this.log("Speakur discussion toggled.");
        },

        // called when the above toggle is finished.
        openStatusChanged: function (e) {
            // We don't care if a child element doesn't swallow this (core-collapse-open) somewhere
            // because we only respond if we know it's coming from "our" mainCollapse
            if (e.path[0] === this.$.mainCollapse) {
                this.closed = !this.closed;
            }
        },

        search: function () {
            this.log("Search clicked.");
            this.nyiClick();
        },

        menu: function () {
            this.log("Menu clicked.");
            this.nyiClick();
        },

        reportProblem: function () {
            this.log("Report Problem clicked.");
            this.nyiClick();
        },

        setThreadIdFromHref: function () {
            // Normalize: everything to lower case
            var href = this.href.toLowerCase();
            // normalize: remove protocol.
            href = href.replace(/^.*?:\/\//, "");

            // Other possible normalizations:
            // Remove port?
            // Enforce domain name requirement?
            // Remove query params?
            // once we do this it's hard to undo as any changes to normalization will orphan threads

            // digest it
            var threadId = md5(href);
            console.log("href ", href, " -> md5: ", threadId);
            // set it.
            this.threadId = threadId;
        },

        hrefChanged: function () {
            this.setThreadIdFromHref();
        },

        threadKeysChanged: function (oldValue, newValue) {
            this.log("Thread keys changed: ", newValue.length);
            // this.numComments = newValue.length;
        },

        login: function () {
            // this.log('LOGIN!');
            this.$.speakurLoginDialog.toggle();
        },

        logout: function () {
            this.$.baseLogin.logout();
            this.doLogout();
        },

        onLogin: function (e) {
            this.globals.isAdmin = false; // profile will update this
            this.globals.currentUser = this.user;

            // Look for both Google and FB info
            // this.$.speakurProfile.uid = this.user.uid;

            // Note: this method is called twice, seems to be a bug in Firebase-element
            // work around it with an async job.

            var that = this;
            this.job('fire-speakur-user-login', function () {
                // allow other sub-elements to respond to this
                that.fire('speakur-user-login', this.user);
            }, 200);

            // this.log("onLogin complete", this.user);
            e.stopPropagation();
        },

        doLogout: function () {
            this.globals.isAdmin = false;

            // allow other sub-elements to respond to this
            // in particular, the profile.
            this.log("Firing user-logout");
            this.fire('speakur-user-logout');
        },

        onLoginError: function (err) {
            this.globals.isAdmin = false;
            this.doLogout();
            this.log('An error occurred.');
            // Show some kind of error dialog / message?
        },

        respondToThemeEvent: function (e, detail, sender) {
            // there's no validation or anything here
            var newTheme = detail.theme;
            // console.log("Theme switching to ", newTheme);
            this.theme = newTheme;
        },

        currentLocale: 'en',
        localeChanged: function (e, details, sender) {
            // this.log("locale changed event", details, sender);

            // Tells the i18next element to change locales
            this.currentLocale = details.newLocale;
            e.stopPropagation();
        },

        editProfileButtonPressed: function () {
            this.$.profileEditDialog.toggle();
        },

        domReady: function () {
            var that = this;
            var $body = jQuery("body");

            // This is a fix for the fact that you can't seem to have multiple <core-overlay>
            // elements b/c they have the same z-index
            // https://github.com/Polymer/paper-dialog/issues/50#issuecomment-76563028
            $body.on('core-overlay-open', function(e) {
                var zi = 1000;
                jQuery("core-overlay-layer").each(function (ei, elem) {
                    elem.style.zIndex = zi--;
                });
            });

            // This locale change event occurs in an overlay, so we must attach the watcher to the body
            // probably a way to do this without converting jQuery event to this other format?
            $body.on("speakur-locale-change", function(e) {
                that.localeChanged(e.originalEvent, e.originalEvent.detail, e.originalEvent.path[0]);
            });
            $body.on("speakur-theme-change", function(e) {
                that.respondToThemeEvent(e.originalEvent, e.originalEvent.detail, e.originalEvent.path[0]);
            });
        },

        observe: {
            // '$.dbThread.location': 'fbLocationChanged',
            thread: 'threadChanged',
            '$.threadView.postIds': 'threadKeysChanged'
        },

        eventDelegates: {
            'core-collapse-open': 'openStatusChanged',
            'loginButtonPressed': 'login',
            'logoutButtonPressed': 'logout',
            'editProfileButtonPressed': 'editProfileButtonPressed',
            'not-yet-implemented': 'nyiClick',
            'toast': 'handleToastEvent',
            'global-tick': 'globalTick',
            'speakur-locale-change': 'localeChanged',
            'speakur-theme-change': 'respondToThemeEvent'
        }

    });

    PolymerExpressions.prototype.formatTimestampFromAgo = function (value, lc) {
        // TODO: what if there's some other component on the page that defines a global filter of same name?
        if (!value) {
            return "(unknown)";
        }
        if (lc) {
            return moment(value).locale(lc).fromNow();
        }
        return moment(value).fromNow();
    };

    PolymerExpressions.prototype.formatTimestamp = function (value, lc) {
        if (!value) {
            return "(unknown)";
        }
        var format = "dddd, MMMM Do YYYY, h:mm:ss a Z";
        if (lc) {
            return moment(value).locale(lc).format(format);
        }
        return moment(value).format(format);
    };

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
