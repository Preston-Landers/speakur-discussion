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
        level: 0,
        /*
        childRemoved: function (event) {
            this.log('child removed ', event.detail.name, ':', event.detail.value);
            // this.fire('data-changed');
        },
        childAdded: function (event) {
            this.log('child added ', event.detail.name, ':', event.detail.value);
            // this.fire('data-changed');
        },
        */
        voteOrderKey: function (sortOrder) {
            if (sortOrder === 'low') {
                return 'down';
            }
            if (sortOrder === 'high') {
                return 'up';
            }
            return null;
        },
        postOrderKey: function (sortOrder) {
            if (sortOrder === 'oldest' || sortOrder === 'newest') {
                return 'timestamp';
            }
            return null;
        },
        sortedPostIds: function (postIds, sortOrder) {
            if (!postIds) { return null; }
            if (sortOrder === 'high' || sortOrder === 'low') {
                return this.voteSortedPostIds(postIds, sortOrder);
            }
            // The ordering provided by the main FB element should work here.
            // But it doesn't, or I haven't figure out how to make that conistently work and respond to updates.
            var post, ts;
            var posts = [];
            var that = this;
            _.forEach(postIds, function (postId) {
                post = that.posts[postId];
                ts = post.timestamp;
                if (sortOrder === 'newest') ts = -ts;
                posts.push({
                    'timestamp': ts,
                    'id': postId
                });
            });
            var timeSorted = _.sortBy(posts, 'timestamp');
            return _.pluck(timeSorted, 'id');
        },
        voteSortedPostIds: function (postIds, sortOrder) {
            if (!postIds) return null;
            // console.log("pre=", postIds);

            var postvotes = this.postvotes;
            if (!postvotes) postvotes = {};

            // Pull out all the votes for these post IDs, assigning 0 votes to
            // posts without votes, and also put in the timestamp as a secondary sort field.
            var postVote, post;
            var allvotes = [];
            var that = this;
            _.forEach(postIds, function (postId) {
                postVote = postvotes[postId];
                post = that.posts[postId];
                if (!post) return;
                if (!postVote) {
                    postVote = {
                        up: 0,
                        down: 0
                    };
                }
                postVote['id'] = postId;
                postVote['timestamp'] = post.timestamp;
                allvotes.push(postVote);
            });
            // sort by timestamp first as a 'secondary' sort,
            // then sort again by the primary key (votes).
            // http://stackoverflow.com/a/18262813/858289
            var timeSorted = _.sortBy(allvotes, 'timestamp');
            // console.log("time sorted", timeSorted);

            // now vote sort.
            var voteSorted = _.sortBy(timeSorted, function (val) {
                if (sortOrder === 'high') return -val.up;
                return -val.down;
            });
            // console.log("vote sorted", voteSorted);
            var sortedIds = _.pluck(voteSorted, 'id');
            // console.log("plucked", sortedIds);
            return sortedIds;
        },

        computed: {
            'postCount': 'postIds.length ? postIds.length : 0'
        },

        ready: function () {
            this.postCountDeep = 0;
            this.postCount = 0;
        },

        domReady: function () {
            this.async(function () {
                if (!this.postCountDeep) {
                    this.getPostCountDeep();
                }
            }, null, 200);
        },

        getPostCountDeep: function () {
            var deepCount = 0;
            var postEls = this.$.postListContainer.querySelectorAll("speakur-post");
            _.forEach(postEls, function (postEl, idx, col) {
                var thisCount = postEl.getPostCountDeep();
                // console.log("getPostCountDeep: ", postEl, " count: ", thisCount);
                deepCount += thisCount;
            });
            this.postCountDeep = deepCount + this.postCount;
            return this.postCountDeep;
        },

        postIdsChanged: function (oldval, newval) {
            this.postCount = newval.length;
            // console.log(this.parentId + " telling parent I have " + this.postCount + " replies. ");
            this.fire('reply-count-changed', {
                parentId: this.parentId,
                count: newval.length,
                postIds: newval
            });
        },

        childPostCountUpdated: function (e, detail, send) {
            // A child (direct or indirect) has informed us that their posts changed
            // so recalculate our deep post count and allow this event to continue to propagate up
            this.getPostCountDeep();
        }

    });

})();
