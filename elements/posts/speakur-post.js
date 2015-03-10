/**
 * @license
 * Copyright (c) 2015 Preston Landers. All rights reserved.
 * This code may only be used under the BSD style license found at http://Preston-Landers.github.io/speakur-discussion/LICENSE.txt
 * The complete set of authors may be found at http://Preston-Landers.github.io/speakur-discussion/AUTHORS.txt
 * The complete set of contributors may be found at http://Preston-Landers.github.io/speakur-discussion/CONTRIBUTORS.txt
 *
 */
(function () {
    'use strict';

    Polymer({
        indentWidth: 54,
        threadId: null,
        parentId: null,
        postId: null,
        previewing: false,
        previewText: null,
        editId: null,
        showingEdit: false,
        showingReply: false,
        isCollapsed: false,

        numRepliesToMe: function () {
            var numReplies = 0;
            if (this.$.replySet.posts && this.$.replySet.postIds) {
                numReplies = this.$.replySet.postIds.length;
            }
            return numReplies;
        },

        /**
         * Delete a post
         */
        deletePost: function (e, detail, sender) {
            // Need to stop the event b/c we're only deleting this, not all parent posts!
            e.stopPropagation();

            this.log("Requesting delete post: ", detail);

            var numReplies = this.numRepliesToMe();

            var deleted_by_uid = null;
            if (this.globals.profile) {
                deleted_by_uid = this.globals.profile.uid;
            }

            if (numReplies > 0) {
                this.log("Post has ", numReplies, " direct replies.");
                // Just mark it as deleted and clear its text and author.
                // This will allow replies under it to persist.
                // In the future we might allow recursive deleting under some circumstances.
                this.post.deleted = true;
                this.post.delete_time = new Date().getTime();
                this.post.deleted_by = deleted_by_uid;
                this.post.text = '';
                this.post.author = {
                    uid: '_del'
                };
            } else {
                this.log("Post has no replies; deleting.");
                var post_copy = _.clone(this.post);
                this.$.postDB.remove("/");
                this.fire('post-deleted', post_copy);

            }
            this.toast(this.$$('post_deleted'));

        },

        hilight: function (event, detail, sender) {
            detail.code = hljs.highlightAuto(detail.code).value;
        },

        replyToPost: function (e) {
            var that = this;
            // Need to stop the event b/c we're only replying to this, not all parent posts.
            e.stopPropagation();

            if (!this.globals.profile && !this.globals.allowAnonymous) {
                this.toast(this.$$('logged_in_to_post'));
                this.fire('loginButtonPressed');
                return false;
            }

            this.showingReply = !this.showingReply;
            this.async(function () {
                that.$.replyCompose.focus();
            });
        },

        submittedReply: function (e) {
            this.log("reply submitted: ", e.detail);
            // Close reply window?
            this.showingReply = false;
            e.stopPropagation();
        },

        canceledReply: function (e) {
            this.log("reply canceled.");
            this.showingReply = false;
            e.stopPropagation();
        },

        canEditPost: function (post, profile, isAdmin) {
            if (!this.$ || !this.$.postFooter) {
                return false;
            }
            if (!post || !profile) {
                return false;
            }
            return this.$.postFooter.canEditPost(post, profile, isAdmin);
        },


        editPost: function (e) {
            this.showingEdit = !this.showingEdit;
            this.editId = this.postId;

            if (this.post.replyTo) {
                this.editReplyTo = this.post.replyTo;
            } else {
                this.editReplyTo = this.post.threadId;
            }

            var that = this;
            this.async(function () {
                that.$.editCompose.focus();
            });

            // Need to stop the event b/c we're only editing this, not all parent posts.
            e.stopPropagation();
        },

        submittedEdit: function (e) {
            this.log("edit submitted: ", e.detail);
            // Close reply window?
            this.showingEdit = false;
            e.stopPropagation();
        },

        canceledEdit: function (e) {
            this.log("Edit Post canceled.");
            this.showingEdit = false;
            e.stopPropagation();
        },


        reportPost: function (e) {
            this.fire('not-yet-implemented');
            e.stopPropagation();

        },

        voteUp: function (e) {
            e.stopPropagation();
            if (!this.checkIfCanVote()) return false;
            this.$.vote.voteUp();

        },

        voteDown: function (e) {
            e.stopPropagation();
            if (!this.checkIfCanVote()) return false;
            this.$.vote.voteDown();
        },

        checkIfCanVote: function () {
            if (!this.globals.profile) {
                this.toast(this.$$('logged_in_to_vote'));
                this.fire('loginButtonPressed');
                return false;
            }
            return true;
        },

        childPostDeleted: function (e, detail, sender) {
            // a post under me was deleted by the current user.
            // See if we should delete this post - only
            // if it's marked for deletion already and has no other replies.

            if (this.postId == detail.replyTo) {
                this.log("Me: ", this.postId, " child post deleted: ", detail);

                // am I marked deleted?
                if (this.post.deleted) {
                    var numReplies = this.numRepliesToMe();
                    // a reply to me was deleted, and I'm marked-deleted w/ no children!
                    if (numReplies == 0) {
                        this.log("I should be deleted right now b/c my only child was deleted! ", this.post);
                        this.fire('delete-post');
                    } else {
                        this.log('Not sweeping deleted post bc has active ', numReplies, ' children');
                    }
                } else {
                    this.log("Stopping deleted post sweep at non-deleted post.");
                }
                e.stopPropagation();
            }

        },

        postCollapseToggle: function (e, details, sender) {
            // this.log("post collapsed", this.post, details, sender);
            this.isCollapsed = !this.isCollapsed;
            this.$.imgCollapse.toggle();
            this.$.extraCollapse.toggle();
            e.stopPropagation();
        },

        // Net votes text displayed in post header.
        getNetVotesText: function (postVotes, votedUp, votedDown) {
            if (!postVotes) return '';

            var downVotes = postVotes.down || 0;
            var upVotes = postVotes.up || 0;

            if (upVotes === 0 && downVotes === 0) return '';

            var netVotes = upVotes - downVotes;
            if (netVotes > -1) {
                return '(+' + netVotes + ')';
            } else {
                return '(-' + netVotes + ')';
            }

        },

        getPostCountDeep: function () {
            // Pass this method through to the reply set
            return this.$.replySet.getPostCountDeep();
        },

        eventDelegates: {
            'reply-to-post': 'replyToPost',
            'edit-post': 'editPost',
            'cancel-edit': 'canceledEdit',
            'submitted-edit': 'submittedEdit',
            'report-post': 'reportPost',
            'delete-post': 'deletePost',
            'vote-up': 'voteUp',
            'vote-down': 'voteDown',
            'cancel-post': 'canceledReply',
            'submitted-post': 'submittedReply',
            'speakur-card-toggle': 'postCollapseToggle',
            'post-deleted': 'childPostDeleted'
        },

        computed: {
            'netVotesText': 'getNetVotesText(postVotes, $.vote.votedUp, $.vote.votedDown)',
            'indentWidthForLevel': 'level+1 * indentWidth',
            'indentClass': '"indent-" + ( ( ( level ) % 3 ) + 1)',
            'replyCount': '$.replySet.postCount',
            'replyCountDeep': '$.replySet.postCountDeep',

            // TODO: see comment in speakur-base
            "lc": "globals.currentLocale ? globals.currentLocale : 'en'",
            "anon_name": "'Anonymous' | $$(globals.currentLocale ? globals.currentLocale : 'en')"
        }

    });

})();
