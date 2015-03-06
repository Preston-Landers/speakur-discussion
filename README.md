speakur-discussion
==================

Provides a real-time discussion forum for any web resource. Simple to use; no server required other than a free
Firebase.com account.

A free Firebase account has resource limits but these limits should be adequate for a typical blog or low traffic site.
If you wish to use this on a high traffic site you may need to pay Firebase.  All the comments and other data is stored
on your Firebase account under your control. 

NOTE: The rest of this document has been auto-generated. I need to update it.

See the [component page](http://polymerlabs.github.io/seed-element) for more information.

## License

This code may only be used under the BSD style license found at http://speakur.github.io/LICENSE.txt

## Getting Started

We've put together a [guide to seed-element](http://www.polymer-project.org/docs/start/reusableelements.html) to help get you rolling.

## Testing Your Element

Add the logic specific to your new element and verify its functionality. Good unit tests are essential to your verification plan but a good way to quickly sanity test your component is to access your demo.html file via a local web server. There are several ways to do this but one easy method is to run a simple web server that ships with Python, using the commands:

```sh
python -m SimpleHTTPServer
```

Or other method using NodeJS:

```sh
http-server -p 8000 ./
```

This starts a web server on port 8000, so you can test your new element by navigating a browser to `localhost:8000/test/index.html`.

### web-component-tester

The tests are also compatible with [web-component-tester](https://github.com/Polymer/web-component-tester). You can run them on multiple local browsers via:

```sh
npm install -g web-component-tester
wct
```


### TODO List

* FIREBASE WARNING: resumeSession() was canceled: Auth token is expired.

  Expired auth token isn't resetting globals.isAdmin - need to respond to an event for that?

