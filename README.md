speakur-discussion
==================

This custom element (web component) provides a real-time discussion thread for any web page / article / resource.

The only server required is a free Firebase.com account to host the data.  All the comments and other data is stored on
your Firebase account under your control.

A free Firebase account has resource limits but these limits should be adequate for a typical blog or low traffic site.
If you wish to use this on a high traffic site you may need to pay Firebase.

This package is written with the [Polymer framework](https://www.polymer-project.org/) and [Web Components](http://webcomponents.org/).

This project is part of a Software Engineering master's report at the University of Texas at Austin to explore
W3C Web Component technology.

## Demo and Component Documentation

* Demo thread 1:

https://preston-landers.github.io/speakur-discussion/components/speakur-discussion/demo.html

* See also the component page: 

https://Preston-Landers.github.io/speakur-discussion/

More demo threads coming.

## What does this software do?

It provides a commenting or discussion plugin - something like Disqus - for blogs, news aggregators, or any other
web site that needs a comment or feedback system for articles. You don't have to run your own app server but you
do need a free account on Firebase.com to host the data.

The software is delivered as a Web Component custom element to be included in your web page.

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

## Quickstart for non-self-hosting

I recommend setting up your own Firebase as described below whether or not you host the Speakur HTML files yourself.

If you use the author's Firebase you will have no control over the data, so you should only do that for testing purposes. 
Also, loading the 'raw' (non-concatenated) components will cause slower page loading times. 

That said, you can quickly add Speakur to almost any web page with a few simple steps:

1) You must load the webcomponents.js script:

```
    <script src="//preston-landers.github.io/speakur-discussion/components/webcomponentsjs/webcomponents.min.js"></script>
```

* Then you can import the `<speakur-discussion>` custom element:

```
    <link rel="import" href="//preston-landers.github.io/speakur-discussion/components/speakur-discussion/speakur-discussion.html">
```

* And now you can place the element somewhere on the page that you want the comment box
to appear. The thread will be automatically set to the containing page location.  If you want
to use a different unique ID for the thread, simply set the `href` attribute another one.

```
    <speakur-discussion
        href="my_awesome_thread_1"
        allowAnonymous="false">
    </speakur-discussion>
```

If you have your own Firebase set up (and you should) you can give it as `firebaseLocation=`

* You now have a comment section!

## Requirements for Self-Hosting

* You must have a web page where you can control the page's HTML and add scripts (i.e, not certain blog services that restrict scripts.)

* A free (or paid) account on Firebase.com (FB), a cloud database service owned by Google.

    This site hosts all the comment data under your FB account and under your control. You can use a single account to host
    Speakur discussion for multiple sites, but they will all be subject to the same resource limitations of your Firebase
    account.

* Speakur does not require any web app server other than Firebase and a (static) host for the html files which could be
from a remote CDN (content delivery network).

* Currently only Facebook and Google login options are supported. That means you must obtain your own API Key for these
services and attach that to your Firebase account. Instructions for that can be found below.

* This package needs certain dependencies - Polymer and certain Javascript libraries. It follows Bower dependency
assumptions as Polymer recommends. If you are hosting the Speakur HTML files yourself then you have to install the
bower dependencies at the appropriate location next to speakur-discussion.

## Getting Started

* If you are hosting the HTML files yourself, I recommend to use Bower to install speakur-discussion along
    with its dependencies (Polymer and other libraries) and use Vulcanize to minify and concatenate the components
    together for better performance and to avoid excessive HTTP requests.

    See this page for details: https://www.polymer-project.org/articles/concatenating-web-components.html

* You must register an App / Project with each of the authentication services you want to use:

    * Go to https://developers.facebook.com/ and register a new 'App' there. When users authenticate with your Speakur
    discussion site using Facebook, they will see the info you put here.  Same with Google.

    * Go to https://console.developers.google.com and register a new 'Project' there.

    * TODO: Github accounts

    * TODO: Twitter accounts

    * TODO: ability to switch individual auth providers on/off

* Configure your Firebase (FB) account:

    * Register an account on [Firebase.com](https://www.firebase.com/) if needed.

    * From the FB console create a new 'App' (database). When you first register, one is created for you and you can use that,
    or create another.

      * If you have multiple 'sites' that you want to use with Speakur, you can either put them all
      in the same Firebase app or create different Firebase apps for each, your choice.

    * Go to the Dashboard for your new App.

    * Under the Security and Rules tab, add the rules from this file:

      https://raw.githubusercontent.com/Preston-Landers/speakur-discussion/master/security-rules.json

      * If you don't do this, malicious users will be able to take control of the data / comments.

    * Under Login & Auth, enable Facebook and Google authentication.

      * Click Facebook and check 'Enable Facebook Authentication'

      * Put in your App ID and Secret you obtained from the Facebook API console.

      * Click Google and check 'Enable Google Authentication'

      * Put in your Google Client ID and Client Secret from the Google API console.

      * You may also need to set your OAuth origin domains and other settings. See also:
        https://www.firebase.com/docs/web/guide/login/google.html
        https://www.firebase.com/docs/web/guide/login/facebook.html

* If you don't specify your own Firebase URL when putting  Speakur on your page, it will fall back on using the
author's Firebase app and you WON'T be able to moderate/admin posts or fully control it. So it is recommended to
create your own Firebase account as above. The default database also has a low (free) resource limit for users/space.

* See demo.html for a complete working example of using `<speakur-discussion>`

* Your page must load `webcomponents.js` that polyfills Web Component support:

This step is provisional until web components are natively supported in browsers.

```
    <head>
        ...
        <script src="/bower_components/webcomponentsjs/webcomponents.min.js"></script>
    </head>
```

* Then you can bring in the `<speakur-discussion>` custom element:

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

* The 'target' of the thread is determined by the containing page's URL by default (`window.location.url`). However
you can specify a different 'topic ID' by setting the `href` attribute, usually to a URL but it can be anything.
The href attribute becomes the effective thread unique ID.  The generic demo thread uses `demo1` as a thread ID.

```
    <speakur-discussion
        href="thread_id_1"
        firebaseLocation="https://MY-FB-DATABASE.firebaseio.com/">
    </speakur-discussion>
```


## Administration and Moderation

There are two types of special users: Administrators and Moderators.

Admins control the entire site such as the ability to delete and edit comments.

Moderators have similar powers but only for a particular thread ID (href).

For security reasons you must set these outside of the Speakur interface by directly
inserting the values into your Firebase app.

TODO: explain how to set these...


## TODO List

* 'Native' accounts

  Currently the software only supports Google and Facebook user accounts.  That means in order to host this yourself
  you must register an 'application' with Google and/or Facebook and get an API key, and then add that to your Firebase account.

  I would like to support a self-contained user registration system which uses Firebase Simple Auth.

* Page fails to load on Firefox with Adblock

  The Adblock+ plugin seems to trip over the social icons provided with Polymer. It causes the page to not load.
  Temporary workaround is to disable Adblock+ on that page/domain. There are no ads present.

* Currently the first logged-in user to visit a particular thread is marked as the thread owner.

* Spam report and moderation features are not implemented yet. 

## Support

If you wish to support this software you can send your bitcoin donations to this address:

    17Kt9hrtZCrHgSm3ihrsyYXoVXazhADL52

## License

This code may only be used under the BSD style license found at http://Preston-Landers.github.io/speakur-discussion/LICENSE.txt
