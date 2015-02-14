/**
 * Created by Preston on 2/1/2015.
 */

(function (document) {
    'use strict';

    Polymer({
        /**
         * The `xtitle` attribute determines the title of the discussion. Defaults to the containing
         * page's title.
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
         * Available themes are: default (TODO)
         *
         * @attribute theme
         * @type string
         * @default {a default theme}
         */
        theme: 'default',

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
         * The `firebaseLocation` attribute determines the source database URL for the comments. A default
         * database will be used if none is provided.  If using the public (default) Speakur firebase then
         * you must incorporate your domain name in the `href` field.
         *
         * @attribute firebaseLocation
         * @type string
         * @default (a suitable default is provided)
         */
        firebaseLocation: 'https://speakur.firebaseio.com',

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

        thread: null,

        // you can reference globals.updateTick in an expression to have something
        // that will change on a regular schedule (currently every 20 seconds)
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
                username: 'Anonymous'
            };

            // maximum number of old post revisions to keep
            this.globals.maxPostRevisionsKeep = 5;

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

        /**
         * The `sayHello` method will return a greeting.
         *
         * @method sayHello
         * @param {String} greeting Pass in a specific greeting.
         * @return {String} Returns a string greeting.
         */
        sayHello: function (greeting) {
            var response = greeting || 'Hello World!';
            return 'speakur-discussion says, ' + response;
        },

        nyiClick: function() {
            this.$['nyi-toast'].show();
        },

        /**
         * The `speakur-discussion-lasers-success` event is fired whenever we
         * call fireLasers.
         *
         * @event speakur-discussion-lasers-success
         * @param {Object} detail
         *   @param {string} detail.sound An amazing sound.
         */

        /**
         * The `fireLasers` method will fire the lasers. At least
         * it will dispatch an event that claims lasers were fired :)
         *
         * @method fireLasers
         */
        fireLasers: function () {
            this.fire('speakur-discussion-lasers-success', {sound: 'Pew pew pew!'});
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

            // console.log("Speakur discussion toggled.");
        },

        // called when the above toggle is finished.
        openStatusChanged: function (event, value) {
            // console.log("opened -> ", event, value);
            this.closed = !this.closed;
        },

        search: function () {
            console.log("Search clicked.");
            this.nyiClick();
        },

        menu: function () {
            console.log("Menu clicked.");
            this.nyiClick();
        },

        reportProblem: function () {
            console.log("Report Problem clicked.");
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
            console.log("href " + href + " -> md5: " + threadId);
            // set it.
            this.threadId = threadId;
        },

        hrefChanged: function () {
            this.setThreadIdFromHref();
        },

        threadIdChanged: function (oldValue, newValue) {
            console.log("Thread ID was changed from " + oldValue + " to ->" + newValue);
        },

        threadChanged: function () {
            console.log("Thread changed. ", this.$.dbThread.location, " thread ID: ", this.threadId);
            if (this.threadId && !this.thread) {
                // Create a default thread description.
                var new_thread = {
                    href: this.href,
                    threadId: this.threadId,
                    title: this.xtitle,
                    created: new Date().getTime(),
                    allowAnonymous: false,
                    titlePost: false,   // a stickied comment that stays at the top
                    text: null,
                    theme: this.theme,
                    moderators: this.moderators,

                    // TODO: fix owners!
                    owner: {
                        uid: 'anonymous',
                        username: 'Anonymous'
                    }
                };
                this.thread = new_thread;
                console.log("Created new thread for " + this.href + " -> " + this.thread);
            } else {
                console.log("this.thread -> ", this.thread);
            }

        },

        threadKeysChanged: function (oldValue, newValue) {
            console.log("Thread keys changed: ", newValue.length);
            // this.numComments = newValue.length;
        },

        login: function () {
            console.log('LOGIN!');
            this.$.speakurLoginDialog.toggle();
        },

        logout: function () {
            this.$.baseLogin.logout();
            this.doLogout();
        },

        onLogin: function (e) {
            this.globals.currentUser = this.user;

            // Look for both Google and FB info
            this.$.speakurProfile.uid = this.user.uid;

            // allow other sub-elements to respond to this
            this.fire('speakur-user-login', this.user);

            console.log("onLogin complete", this.user);
            e.stopPropagation();
        },

        doLogout: function () {
            // allow other sub-elements to respond to this
            // in particular, the profile.
            console.log("Firing user-logout");
            this.fire('speakur-user-logout');
        },

        onLoginError: function (err) {
            this.doLogout();
            console.log('An error occurred.');
            // Show some kind of error dialog / message?
        },

        threadLocation: function (firebaseLocation, threadId) {
            if (!firebaseLocation) { return ''; }
            if (!threadId) { return ''; }
            return firebaseLocation + "/threads/" + threadId;
        },

        postsLocation: function (firebaseLocation, threadId) {
            if (!firebaseLocation) { return ''; }
            if (!threadId) { return ''; }
            return firebaseLocation + "/posts/" + threadId;
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
            'not-yet-implemented': 'nyiClick',
            'global-tick': 'globalTick'
        }

    });

    PolymerExpressions.prototype.formatTimestampFromAgo = function (value) {
        // TODO: what if there's some other component on the page that defines a global filter of same name?
        if (!value) {
            return "(unknown)";
        }
        return moment(value).fromNow();
    };

    PolymerExpressions.prototype.formatTimestamp = function (value) {
        if (!value) {
            return "(unknown)";
        }
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss a Z");
    };

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
