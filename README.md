OpenLog - Track client side Javascript errors in real time. [![Build Status](https://travis-ci.org/MarshallOfSound/OpenLog.svg?branch=master)](https://travis-ci.org/MarshallOfSound/OpenLog)
==========================================================

OpenLog is a lightweight front end Javascript plugin (< 1kb gzipped!) that sends your user's console errors & warnings in real time to a dynamic dashboard built with Node.

Installation
------------

1. Include the [dist/capture.min.js](dist/capture.min.js) file on any page you want to capture the errors and logs for

````html
<script src="path/to/capture.min.js" type="text/javascript"></script>
````

2. Install globally with [npm](https://www.npmjs.com/about): `npm install -g openlog`
3. Start the open log server: `openlog`

...and that's it! Now you can access your instance of OpenLog at http://127.0.0.1:4783. The default login credentials are:

````
username: openlog
password: password
````

Changing Settings
------------

Configuration options for OpenLog are set in `/config.inc.json`. To find where your copy of OpenLog is installed, run the following command:

````bash
$ npm root -g
> /usr/local/lib/node_modules
````

This command returns the path where global npm packages are installed on your machine. Once you know this path, you can visit the OpenLog directory with: `cd <insert_node_path_here>/openlog`. You can then modify the `/config.inc.json` file...

| Setting  | Description                                                           |
|----------|-----------------------------------------------------------------------|
| Username | Username used to access the admin panel with. Default: `openlog`      |
| Password | Password used to access the admin panel with. Default: `password`     |
| Port     | The server port that the OpenLog admin panel runs on. Default: `4783` |

Once you have modified those values you can build your own version of OpenLog by running these commands in the root OpenLog directory:

````bash
npm install -g grunt-cli
npm install
grunt build
````

Amungst other things, this will build a new `dist/capture.min.js` file. It's now simply a matter of including this new file on your HTML pages, and starting up the OpenLog server again with your new compiled settings.

Usage / Other Configuration
------------
If you are already logging using `console.log`, `console.info`, `console.warn` and `console.error` then OpenLog requires no extra work at all.  It will capture errors globally on your page and listen to calls to the above `console` functions. Alternatively, if you don't want to explicitly log information to the clients console, you can use OpenLog's built in methods:

- `Log.error();`
- `Log.warn();`
- `Log.info();`

`Log` is a globally defined object by the `capture.min.js` file.

### Error Limiting

If you don't want to capture certain logging types you simply add a `data-capture` parameter to the script tag that loaded the `capture.min.js` file and set it to be the types of logs you wish to capture.  For instance, if you only want error logs:

````html
<script src="path/to/capture.min.js" type="text/javascript" data-capture="error"></script>
````

...or if you want error and warning logs `data-capture="warn error"` etc etc.

### Modify OpenLog Server URL

By default, OpenLog assumes that the dashboard is running on the same domain as the frontend it sends logs from (default port is 4783). To change this, you can specify the logging URL by setting a `data-log-url=""` attribute on the script tag that loaded the `capture.min.js`:

````html
<script src="path/to/capture.min.js" type="text/javascript" data-log-url="http://logs.mydomain.com/log"></script>
````

### Domain Limiting

A final configurable option is to use `data-restrict-to` parameter on the script tag. This setting allows you to specify domain name(s) permitted to send logs to the OpenLog server, and is particularly useful for reporting console noise only in a staging/production environment (as opposed to developers working locally). By default, OpenLog will send logs from all sources.

````html
<!-- Use a HOSTNAME, not a full domain like above -->
<script src="path/to/capture.min.js" type="text/javascript" data-restrict-to="staging.myserver.com"></script>
````

To restrict multiple domains, use spaces to separate them, eg - `data-restrict-to="staging.myserver.com production.com"`.

Updating OpenLog
-----------------

Fancy, smooth, no data loss updating method coming soon :)

Contributing
---------

All PR's and issues are welcomed with open arms.

1. Fork this repository.
2. Create a new branch: `git checkout -b my-new-feature`.
3. Make your changes and add some commits.
4. Push your changes to GitHub and send in a pull request to this repository.

Requirements
------------

- `node.js` > 0.10
- `npm`

Author
-------

Samuel Attard - <me@samuelattard.com> - <https://twitter.com/marshallofsound> - <https://www.samuelattard.com>

License
-------

OpenLog is licensed under the MIT License - see the LICENSE file for details.
