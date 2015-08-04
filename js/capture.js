var Logger = function() {
    this.l = window.location;
    this.SERVER = this.l.protocol + "//" + this.l.hostname + ":{{SERVER_PORT}}/log";
    this.LOGGING_LEVELS = {
        info: true,
        warn: true,
        error: true
    };

    var key = "openLogQueue", store = localStorage, tags = document.getElementsByTagName('script'), self = this, i, d;
    this.o = {
        error: console.error,
        info: console.info,
        log: console.log,
        warn: console.warn
    };
    this.queue = JSON.parse(store.getItem(key) || "[]");
    store.removeItem(key);

    window.onbeforeunload = function() {
        store.setItem(key, JSON.stringify(self.queue));
    };
    setInterval(function() {
        if (!self.sending) {
            self.sendQueue.call(self);
        }
    }, 1000);

    for (i = 0; i < tags.length; i++) {
        d = tags[i].getAttribute('data-capture');
        url = tags[i].getAttribute('data-log-url');
        if (url) {
            this.SERVER = url;
        }
        if (d) {
            d = d.split(" ");
            this.LOGGING_LEVELS = {
                info: false,
                warn: false,
                error: false
            };
            for (i = 0; i < d.length; i++) {
                this.set(d[i], true);
            }
            break;
        }
    }
    console.log(this.SERVER);
};
Logger.prototype = {
    console: function(msg) {
        this.o.log.apply(console, [msg]);
    },
    error: function() {
        console.error.apply(console, arguments);
    },
    info: function() {
        console.info.apply(console, arguments);
    },
    warn: function() {
        console.warn.apply(console, arguments);
    },
    sendQueue: function() {
        if (this.queue.length > 0) {
            var req = new XMLHttpRequest(),
                self = this;
            self.sending = true;
            req.open("post", this.SERVER, true);
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req.onload = function() {
                self.queue = [];
                self.sending = false;
            };
            req.onerror = function() {
                self.sending = false;
            };
            req.send("[" + this.queue.join(", ") + "]");
        }
    },
    _send: function(type, message, t) {
        var a = this.LOGGING_LEVELS[type] || false;
        if (a && this.LOGGING_LEVELS[type]) {
            this.queue.push(JSON.stringify({type: type, message: message, trace: (t || Error().trace), time: Date.now(), page: this.l.href}));
        }
    },
    set: function(type, state) {
        if (typeof (this.LOGGING_LEVELS[type]) !== 'undefined') {
            this.LOGGING_LEVELS[type] = state;
        }
    }
};

var Log = new Logger(),
    types = ["error", "info", "log", "warn"];

for (var i = 0; i < types.length; i++) {
    (function() {
        var k = i;
        console[types[k]] = function () {
            Log._send(types[k], arguments, Error().stack);
            Log.o[types[k]].apply(this, arguments);
        };
    })(); // jshint ignore:line
}

window.onerror = function(msg, a, b, c, err) {
    Log._send("error", msg, err.stack);
};
window.Log = Log;