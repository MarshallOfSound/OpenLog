module.exports = function(app, collection, sendError) {
    var moment = require('moment'),
        generateSearchObject = function(query, params) {
            var o = {};
            for (var i = 0; i < params.length; i++) {
                if (typeof query[params[i]] !== 'undefined') {
                    o[params[i]] = query[params[i]];
                }
            }
            if (o.message) {
                console.msg = o.message;
                o['$where'] = function() {
                    var msg = console.msg;
                    if (typeof obj.message === 'object') {
                        var ret = 0;
                        for (var key in obj.message) {
                            if (obj.message.hasOwnProperty(key)) {
                                ret += ((new RegExp(".*" + msg + ".*", "gi")).test(obj.message[key]) ? 1 : 0);
                            }
                        }
                        return ret > 0;
                    } else {
                        return (new RegExp(".*" + msg + ".*", "gi")).test(obj.message);
                    }
                };
                delete o.message;
            }
            return o;
        };

    const LOGS_PER_PAGE = 20;

    app.get('/rest/logs/stats', function (req, res) {
        collection.find({}).toArray(function (err, logs) {
            var stats = {
                    quantity: {
                        total: logs.length,
                        error: 0,
                        warn: 0,
                        info: 0
                    },
                    pages: {
                        total: logs.length
                    },
                    past: []
                },
                tmp,
                start = moment(),
                end = moment();
            for (var i = 0; i < logs.length; i++) {
                if (typeof (stats.quantity[logs[i].type]) !== 'undefined') {
                    stats.quantity[logs[i].type]++;
                }
                if (typeof stats.pages[logs[i].page] === 'undefined') {
                    stats.pages[logs[i].page] = 0;
                }
                if (logs[i].type === 'error') {
                    stats.pages[logs[i].page]++;
                }
            }
            for (var week = 0; week < 10; week++) {
                tmp = {week: week, total: 0, error: 0, warn: 0, info: 0};
                start = moment(end);
                end = moment(start).subtract(7, 'days');
                for (i = 0; i < logs.length; i++) {
                    if (moment(logs[i].time).isBetween(end, start)) {
                        tmp.total++;
                        tmp[logs[i].type]++;
                    }
                }
                stats.past.push(tmp);
            }
            res.json(stats);
        });
    });

    app.get('/rest/logs/pages', function (req, res) {
        collection.find({}).toArray(function (err, logs) {
            var pages = [];
            for (var i = 0; i < logs.length; i++) {
                if (pages.indexOf(logs[i].page) < 0) {
                    pages.push(logs[i].page);
                }
            }
            res.json(pages);
        });
    });

    app.get('/rest/logs/details/:id/:group', function(req, res) {
        var search = {"_id": req.params.id},
            logJSON;
        collection.find(search).toArray(function (err, logs) {
            logJSON = logs[0];
            if (req.params.group === 't') {
                var search = generateSearchObject({"IP": logJSON.IP, "type": logJSON.type, "message": logJSON.message}, ["IP", "type", "message"]);
                collection.find(search).toArray(function(err, q) {
                    logJSON.quantity = q.length;
                    res.json(logJSON);
                });
            } else {
                res.json(logJSON);
            }
        });
    });

    app.get('/rest/logs/:page', function (req, res) {
        var search = generateSearchObject(req.query, ["page", "IP", "type", "message", "_id"]);
        collection.find(search).toArray(function (err, logs) {
            var json = [],
                grouped = [],
                l, g, tmp, tmpComp, found, page;

            if (/^[0-9]+$/g.test(req.params.page)) {
                page = parseInt(req.params.page);
                logs.sort(function (a, b) {
                    return b._id - a._id;
                });
                if (req.query.group === '1') {
                    for (l = 0; l < logs.length; l++) {
                        tmp = logs[l];
                        found = false;
                        for (g = 0; g < grouped.length; g++) {
                            tmpComp = grouped[g];
                            if (tmp.type === tmpComp.type && JSON.stringify(tmp.message) === JSON.stringify(tmpComp.message) && tmp.trace === tmpComp.trace && tmp.page === tmpComp.page) {
                                found = true;
                                grouped[g].count++;
                            }
                        }
                        if (!found) {
                            tmp.count = 1;
                            grouped.push(tmp);
                        }
                    }
                    logs = grouped;
                }
                if (logs.length > page * LOGS_PER_PAGE) {
                    json = logs.slice(page * LOGS_PER_PAGE, (page * LOGS_PER_PAGE) + LOGS_PER_PAGE);
                }
            } else {
                return sendError("URL parameter expected a number, got: " + req.params.page, res);
            }
            json = {
                logs: json,
                max: Math.ceil(logs.length / LOGS_PER_PAGE) - 1
            };
            res.json(json);
        });
    });
}