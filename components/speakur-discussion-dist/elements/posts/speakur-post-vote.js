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
        canVote: false,

        computed: {
            'canVote': 'uid ? true : false',
            'votedUp': 'vote && vote["up"] ? true: false',
            'votedDown': 'vote && vote["down"]  ? true: false',
            'postVotesUp': '!postVotes ? 0 : postVotes["up"] || 0',
            'postVotesDown': '!postVotes ? 0 : postVotes["down"] || 0',

            // TODO: see comment in speakur-base
            "lc": "globals.currentLocale ? globals.currentLocale : 'en'",
            "anon_name": "'Anonymous' | $$(globals.currentLocale ? globals.currentLocale : 'en')"
        },

        logVoteStatus: function (up) {
            if (up) {
                console.log("Voted UP postId", this.postId);
            } else {
                console.log("Voted DOWN postId", this.postId);
            }
            if (this.vote) {
                console.log("Current (prev) vote status: ", this.vote);
            } else {
                console.log("No vote yet on ", this.postId);
            }
        },

        changeVoteStatus: function (up) {

            // Note that if we had previously downvoted and change that to an upvote, that's a +2 net change to the post score.

            var time_now = new Date().getTime();
            var curDown, curUp;
            var netChange = 0;
            var netUp = 0;
            var netDown = 0;

            if (!this.vote) {
                this.vote = {
                    up: false,
                    down: false
                };
            }
            var vote = this.vote;

            // logic below might be a little suspect, or could at least be condensed probably.

            // add or subtract votes accordingly while tracking net vote change.
            if (up) {
                if (vote['up']) {
                    // voting up, but have already voted up - remove upvote.
                    netChange--;
                    netUp--;
                    vote['up'] = false;
                } else {
                    // voting up, and have not already done so - add upvote.
                    netChange++;
                    netUp++;
                    vote['up'] = true;
                    if (vote['down']) {
                        netChange++;
                        netDown--;
                        vote['down'] = false;
                    }
                }

            } else {

                if (vote['down']) {
                    // voting down, but have already voted down - remove downvote.
                    netChange++;
                    netDown--;
                    vote['down'] = false;

                } else {
                    // voting down, and have not already done so - add downvote.
                    netChange--;
                    netDown++;
                    vote['down'] = true;
                    if (vote['up']) {
                        netChange--;
                        netUp--;
                        vote['up'] = false;
                    }

                }
            }

            if (netChange !== 0) {
                // console.log("net change in vote: ", netChange);
                vote['timestamp'] = time_now;

                // console.log("netDown:", netDown);
                // console.log("netUp:", netUp);
                if (!this.postVotes) {
                    this.postVotes = {
                        up: 0,
                        down: 0,
                        timestamp: time_now
                    };
                }
                if (this.postVotes) {
                    curDown = this.postVotes['down'] || 0;
                    curUp = this.postVotes['up'] || 0;
                    this.postVotes['up'] = curUp + netUp;
                    this.postVotes['down'] = curDown + netDown;
                    this.postVotes['timestamp'] = time_now;
                    // console.log("after post", this.postVotes);
                }

            }

        },

        voteUp: function () {
            // this.logVoteStatus(true);
            this.changeVoteStatus(true);
            return null;
        },

        voteDown: function () {
            // this.logVoteStatus(false);
            this.changeVoteStatus(false);
            return null;
        }
    });

})();
