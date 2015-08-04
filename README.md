OpenLog - An easy way to aggregate client side logging
======================================================

OpenLog helps you track down client side javascript errors that you can never seem to replicate on your machine.  Now errors and stack traces that happen on any machine will be readily available to you.    
###Tiny overhead, client-side plugin is < 1kb gzipped!!!  

Installation
------------

#####Simple
1. Download the latest release from the [Github Releases](https://github.com/MarshallOfSound/OpenLog/releases)
2. Include the `dist/capture.min.js` file on any page you want to capture the errors and logs for
    ````html
    <script src="path/to/capture.min.js" type="text/javascript" language="javascript"></script>
    ````
3. Upload the entire release directory to your server and from the root OpenLog directory run
    ````bash
    npm install
    node server/server.js
    ````
4. Access your instance of OpenLog at http://your-domain.here:4783, the default login credentials are
    ````
    username: openlog
    password: password
    ````
5. That's it... No, seriously, that is it :)

#####Advanced
1. Download the latest release from the [Github Releases](https://github.com/MarshallOfSound/OpenLog/releases)
2. You can customise a few parts of OpenLog by modifying the `config.inc.json` in the root OpenLog directory.  You can change the `user` and `password` values.  As well as changing the port that OpenLog runs on.
3. Once you have modified those values you can build you own version of OpenLog by running these commands in the root OpenLog directory
    ````bash
    npm install -g grunt-cli
    npm install
    grunt build
    ````

4. You can now include the `dist/capture.min.js` file on any page you want to capture the errors and logs for
   ````html
    <script src="path/to/capture.min.js" type="text/javascript" language="javascript"></script>
    ````
5. Upload the entire OpenLog directory **(leave behind `node_modules`)** to your server and from the root OpenLog directory run
    ````
    npm install -g grunt-cli
    npm install
    grunt build
    node  server/server.js
    ````

Usage
------------
If you are already logging using `console.log`, `console.info`, `console.warn` and `console.error` then OpenLog requires no extra work at all.  It will capture errors globally on your page and listen to calls to the above `console` functions.  

If you aren't currently logging using those functions you can either start logging with those functions, or call the OpenLog functions which are.  
`Log.info(arguments)`, `Log.warn(arguments)`, `Log.error(arguments)`.  `Log` is a globally defined object

If you don't want to capture certain logging types you simply add a `data-capture` parameter to the script tag that loaded the `capture.min.js` file and set it to be the types of logs you wish to capture.  For instance if you only want error logs
`data-capture="error"`, or if you want error and warning logs `data-capture="warn error"`.

If your server is not runinng in the expected / default location (the hostname the script is included on at port 4783) you can specify the logging URL by setting a `data-log-url="<YOUR URL HERE>"` attribute on the script tag that loaded the `capture.min.js`.

Updating OpenLog
-----------------

Fancy, smooth, no data loss updating method coming soon :)


Contributing
---------

All PR's and issues are welcomed with open arms, just fork make your magical new feature or bugfix and throw up a PR to master.

Requirements
------------

`node.js` > 0.10
`npm`

Author
-------

Samuel Attard - <me@samuelattard.com> - <https://twitter.com/marshallofsound> - <https://www.samuelattard.com>

License
-------

OpenLog is licensed under the MIT License - see the LICENSE file for details