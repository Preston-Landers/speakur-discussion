/**
 * @license
 * Copyright (c) 2015 Preston Landers. All rights reserved.
 * This code may only be used under the BSD style license found at http://speakur.github.io/LICENSE.txt
 * The complete set of authors may be found at http://speakur.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://speakur.github.io/CONTRIBUTORS.txt
 *
 */
(function () {
    'use strict';

    Polymer({
        editing: null,
        posts: null,
        commentText: null,

        // current text editing buffer
        newText: '',

        // periodically update preview buffer - a 'live' update is very, very slow...
        previewText: '',

        // original post text before editing (if any)
        originalEditText: null,

        ready: function () {
            _.merge(this.computed, this.base_computed);  // TODO: see comment in speakur-base
        },

        cancelTitle: function(lc) {
            if (this.topLevelComment) return this.$$('Clear Text', lc);
            return this.$$('Hide Text', lc);
        },

        domReady: function () {
            // this.updatePreviewText();
            var that = this;
            var commentText = jQuery(this.$.commentText);
            // var oldVal = '';

            // Using a regular Polymer value binding on a textarea seems to produce
            // extremely slow performance as polymer goes nuts observing its changes
            // Doing it this way seems a lot faster...
            commentText.on("keyup", function () {
                var currVal = commentText.val();
                that.newText = currVal;

                // rate-limit these updates to preview for performance...
                that.job('update-preview-text', function () {
                    that.previewText = currVal;
                }, 100);

            });
        },


        // when post we're editing has changed, reset the saved original text
        editPostChanged: function () {
            if (this.editing) {
                // If editing, load the current text into the editing buffer.
                this.originalEditText = this.posts[this.editing].text;
                this.resetEditText();
            }
        },

        // restore the original text
        resetEditText: function () {
            if (this.originalEditText) {
                this.setNewText(this.originalEditText);
            }
        },

        // Save changes to the post.
        saveEdit: function () {

            var editingPost = this.editPost;
            var oldText = {
                text: editingPost.text
            };
            if (editingPost.lastModified) {
                oldText.timestamp = editingPost.lastModified;
            } else if (editingPost.timestamp) {
                oldText.timestamp = editingPost.timestamp;
            }
            if (!editingPost.oldTextList) {
                editingPost.oldTextList = [];
            }
            var author = this.getAuthor();

            editingPost.oldTextList.push(oldText);
            editingPost.oldTextList = this.maybeTrimOldPostVersions(editingPost.oldTextList);

            editingPost.text = this.newText;
            editingPost.lastModified = new Date().getTime();

            // rewrite the author record w/ current vals but only if we're the original author
            // ie. not an admin/moderator
            if (editingPost.author.uid === author.uid) {
                editingPost.author = author;
            }

            // this.log("Save EDIT");

            // write it
            this.posts[this.editing] = editingPost;

            this.toast(this.$$('changes_saved'));
            this.fire('submitted-edit', editingPost);
        },

        maybeTrimOldPostVersions: function (oldTextList) {
            if (oldTextList.length > this.globals.maxPostRevisionsKeep) {
                //
                var killnum = oldTextList.length - this.globals.maxPostRevisionsKeep;
                this.log("Getting rid of " + killnum + " old versions!");
                return _.slice(oldTextList, killnum-1);
            }
            return oldTextList;
        },

        submit: function () {
            var that = this;
            var is_anon = this.globals.profile ? false : true ;

            if (!this.threadId) {
                this.errorToast("Internal error: no threadId available.");
                return false;
            }
            if (!this.newText.length) {
                this.errorToast(this.$$('pls_write_something'));
                return false;
            }

            if (is_anon && !this.globals.allowAnonymous) {
                this.toast(this.$$('logged_in_to_post'));
                this.fire('loginButtonPressed');
                return false;
            }


            var author = this.getAuthor();

            // insert own upvote?
            var post = {
                threadId: this.threadId,
                replyTo: this.replyTo,
                // replies: [],
                text: this.newText,
                author: author,
                timestamp: new Date().getTime()
            };
            var postRef = this.$.posts.push(post);
            var post_id = postRef.key();
            this.log("Created post: " + post_id);


            // tell the vote element where to put the vote
            this.postId = post_id;

            this.setNewText();
            post['postId'] = post_id;

            this.toast(this.$$('post_saved'));
            this.fire('submitted-post', post);

            // if logged in, record an upboat for yourself
            if (!is_anon) {
                this.async(function () {
                    that.$.vote.changeVoteStatus(true);
                }, null, 100);
            }

        },

        getAuthor: function () {
            var author;
            if (this.globals.profile) {
                author = {
                    uid: this.globals.profile.uid,
                    username: this.globals.profile.username,
                    picture_link: this.globals.profile.picture_link,
                    md5_hash: this.globals.profile.md5_hash
                };
            } else {
                author = _.clone(this.globals.anon_author, true);

                // record IP & approx. location of anonymous authors
                if (this.globals.geodata) {
                    author['geo'] = _.clone(this.globals.geodata, true);
                }
            }
            return author;
        },

        cancel: function () {
            if (!this.newText.length) {
                // this.errorToast("There is nothing to cancel.");
                return false;
            }
            if (this.editing) {
                this.fire('cancel-edit');
            } else {
                this.fire('cancel-post');
            }

            if (this.threadId == this.replyTo) {
                this.log("canceled top level post");
                this.setNewText();
            }

            //// this would delete the text...
            // this.newText = '';

        },

        editingHelp: function () {
            this.fire('not-yet-implemented');
        },


        // reset the textarea to either the given value or blank
        setNewText: function (val) {
            if (!val) val = '';
            this.newText = val;
            jQuery(this.$.commentText).val(val);
        },

        focus: function () {
            this.$.commentText.focus();
        },

        computed: {
            topLevelComment: "threadId == replyTo",
            "lc": "globals.currentLocale ? globals.currentLocale : 'en'",
            "anon_name": "'Anonymous' | $$(globals.currentLocale ? globals.currentLocale : 'en')"
        }
    });

})();
