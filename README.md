TURN server test page
============================

This project is a single web page which help you to test a TURN server
deployed to be used in WebRTC applications.

Getting started
---------------

To use the web page, serve the project directory via http.
The following python should do the trick:

    $ python -c "import SimpleHTTPServer;SimpleHTTPServer.test()"
    Serving HTTP on 0.0.0.0 port 8000 ...

Then point your browser to http://localhost:8000/turn-test-page.html

License
-------

The MIT License

Copyright © 2013 Romain Gauthier <romain.gauthier@monkeypatch.me>

