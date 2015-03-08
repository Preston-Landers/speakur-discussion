speakur-discussion
==================

This custom element (web component) provides a real-time discussion forum for any web resource. It is simple to use; no
server is required other than a free Firebase.com account.

A free Firebase account has resource limits but these limits should be adequate for a typical blog or low traffic site.
If you wish to use this on a high traffic site you may need to pay Firebase.  All the comments and other data is stored
on your Firebase account under your control. 

This package is written with the [Polymer framework](https://www.polymer-project.org/) and [Web Components](http://webcomponents.org/).

This is part of a Software Engineering master's report project at the University of Texas at Austin.

## License

This code may only be used under the BSD style license found at http://speakur.github.io/LICENSE.txt

## What does this software do?

This package provides a commenting system - something like Disqus - for blogs, news aggregators, or any other
web site that needs a comment or feedback system for articles. You don't have to run your own app server but you
do need a free account on Firebase.com to host the data.

### Feature Summary

* Real-time commenting - new comments load automatically without reloading the page.

* Markdown syntax is supported in comments

* Support for syntax highlighting for code

* Comment voting up/down

* Sign in with Google and Facebook accounts, but users control the name they post under.

* Several theme choices are provided. Future versions may have theme plugins.

* Preliminary translations / localizations in 14 languages. Patches to improve the translation quality are welcome.
  These translations were obtained automatically from the Microsoft translation API using this tool: https://github.com/Preston-Landers/eurgh

* Languages and themes selections update instantly

## Requirements

* A web site / page under your control that you wish to add a commenting system for. You will embed a custom
HTML element in the page to contain the Speakur discussion.

* A free (or paid) account on Firebase.com (FB), a cloud database service owned by Google.

    This site hosts all the comment data under your FB account and under your control. You can use a single account to host
    Speakur discussion for multiple sites, but they will all be subject to the same resource limitations of your Firebase
    account.

* Speakur does not require any web app server other than Firebase and a (static) host for the html files which could be
from a remote CDN (content delivery network).

* Currently only Facebook and Google login options are supported. That means you must obtain your own API Key for these
services and attach that to your Firebase account. Instructions for that can be found below.

* This package follows Bower dependency assumptions as Polymer recommends. If you are hosting the Speakur HTML files yourself
then you have to install the bower dependencies at the appropriate location next to speakur-discussion.


## Getting Started

* If hosting the HTML files yourself, it is recommended to use Bower to install speakur-discussion along
    with its dependencies (Polymer and other libraries) and use Vulcanize to minify and concatenate the components
    together for better performance and to avoid excessive HTTP requests.

    See this page for details: https://www.polymer-project.org/articles/concatenating-web-components.html

* Configure your Firebase (FB) account:

    * Register an account on [Firebase.com](https://www.firebase.com/) if needed.

    * From the FB console create a new 'App' (database). When you first register, one is created for you and you can use that.

    * Go to the Dashboard for your new App.

    * Under Security and Rules, add the rules from this file... (TODO!)

    * Under Login & Auth, enable Facebook and Google authentication.

      * Click Facebook and check 'Enable Facebook Authentication'

      * Put in your App ID and Secret you obtained from the Facebook API console. (TODO: link)

      * Click Google and check 'Enable Google Authentication'

      * Put in your Google Client ID and Client Secret from the Google API console. (TODO: link)

    * If you have multiple 'sites' that you want to use with Speakur, you can either put them all
      in the same FB app or create different FB apps for each, your choice.

* If you don't specify your own Firebase URL when using Speakur, it will fall back on using the
 author's Firebase app and you WON'T be able to moderate/admin posts or fully control it. So
 it is recommended to create your own Firebase account as above.

* See demo.html for a complete working example of using <speakur-discussion>

* Your page must load the webcomponents.js that polyfills Web Component support:

```
    <head>
        ...
        <script src="/bower_components/webcomponentsjs/webcomponents.min.js"></script>
    </head>
```

* Then you can bring in the <speakur-discussion> custom element:

```
    <link rel="import" href="/bower_components/speakur-discussion/speakur-discussion.html">
```

* And now you can place the element somewhere on the page that you want the comment box
to appear.

```
    <speakur-discussion
        firebaseLocation="https://MY-FB-DATABASE.firebaseio.com/"
        allowAnonymous="false">
    </speakur-discussion>
```

Be sure to set the appropriate options, particularly firebaseLocation and whether you want to allow anonymous
commenting.  Anonymous users (only) will have their IP address and approximate geographic location saved with the
comment although this is not revealed to other users, and is not saved in the case of registered users.

* The 'target' of the thread is determined by the containing page's URL by default (window.location.url). However
you can specify a different 'topic ID' by setting the `href` attribute, usually to a URL but it can be anything.
The href attribute becomes the effective thread unique ID.

```
    <speakur-discussion
        href="thread_id_1"
        firebaseLocation="https://MY-FB-DATABASE.firebaseio.com/">
    </speakur-discussion>
```


## Making yourself 'Administrator'

There are two types of special users: Administrators and Moderators.

Admins control the entire site such as the ability to delete and edit comments.

Moderators have similar powers but only for a particular thread ID (href).

TODO: how to set these

For security reasons you must set these outside of the Speakur interface by directly
inserting the values into your Firebase app.


### TODO List

* 'Native' accounts

  Currently the software only supports Google and Facebook user accounts.  That means in order to host this yourself
  you must register an 'application' with Google and/or Facebook and get an API key, and then add that to your Firebase account.

  I would like to support a self-contained user registration system which uses Firebase Simple Auth.


* FIREBASE WARNING: resumeSession() was canceled: Auth token is expired.

  Expired auth token isn't resetting globals.isAdmin - need to respond to an event for that?

