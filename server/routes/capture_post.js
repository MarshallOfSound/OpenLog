module.exports = function(app, collection, sendError) {
    app.post('/log', function(req, res) {
        var required = ["type", "message", "trace", "page", "time"],
            tmp;
        console.log("Received a burst of " + req.body.length + " log" + (req.body.length === 1 ? '' : 's') + " from: " + req.ip);
        for (var i = 0; i < req.body.length; i++) {
            tmp = req.body[i];
            for (var k = 0; k < required.length; k++) {
                if (!tmp[required[k]]) {
                    sendError("LogObject requires the attribute: " + required[k]);
                }
            }
            tmp.IP = req.ip;
            tmp.page = tmp.page.replace(/https?:\/\//g, '');
            collection.insert(tmp);
        }
        res.end();
    });
};