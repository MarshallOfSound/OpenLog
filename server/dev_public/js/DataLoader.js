/**
 * Constructs a new DataLoader
 * Fetches content from the OpenLog REST services in a UI friendly asynchronous manner
 * @constructor
 */
var DataLoader = function() {
    this.queryString = "";
    this.inProgress = 0;
    this.silent = false;
};
DataLoader.prototype = {
    /**
     * Sets the query filter for LogObject REST requests
     * @param type string  {info | warn | error}
     * @param message string {Any regexp}
     * @param page string {Any string, has to match the page name exactly}
     * @param ip string {Any string, has to match the IP exactly}
     * @param id integer {Any integer, should be greater than 0}
     * @param group integer {0 | 1}
     */
    setFilter: function(type, message, page, ip, id, group) {
        this.queryString = "";
        this.queryString += (type ? '&type=' + type : '');
        this.queryString += (message ? '&message=' + message : '');
        this.queryString += (page ? '&page=' + page : '');
        this.queryString += (ip ? '&ip=' + ip : '');
        this.queryString += (id ? '&id=' + id : '');
        this.queryString += (group ? '&group=' + group : '');
        this.queryString = this.queryString.substr(1);
    },
    /**
     * Fetches a search results page number and returns the results via the callback parameter
     * @param num integer The page number to fetch
     * @param cb function A callback function that will be provided an array of LogObject's
     */
    fetchPage: function(num, cb) {
        var pageNumber = num || 0;
        this._fetch('/rest/logs/' + pageNumber + '?' + this.queryString, function(data) {
            var ret = [];
            for (var i = 0; i < data.logs.length; i++) {
                ret.push(new LogObject(data.logs[i]));
            }
            data.logs = ret;
            cb(data);
        });
    },
    /**
     * Fetches the Stats overview data and returns it via the provided callback function
     * @param cb function A callback function that will be provided the returns Stats Object
     */
    fetchStats: function(cb) {
        this._fetch('/rest/logs/stats', cb);
    },
    /**
     * Fetches a list of all the pages that have submitted logs to OpenLog
     * @param cb function A callback function that will be provided an array of all the page URL's
     */
    fetchPageList: function(cb) {
        this._fetch('/rest/logs/pages', cb);
    },
    /**
     * Fetches the complete JSON data for a submitted log file, accepts the `group` parameter to determine style of JSON
     * @param logID integer The ID of the Log to fetch
     * @param group bool Whether to fetch a group of logs that match the given log ID
     * @param cb function The function to send the data too
     */
    fetchLogData: function(logID, group, cb) {
        this._fetch('/rest/logs/details/' + logID + '/' + (group ? 't' : 'f'), cb);
    },
    /**
     * Fetches the given url and returns the response as JSON to the callback function
     * @param url string The URL to fetch
     * @param cb function The function to send the data too
     * @private
     */
    _fetch: function(url, cb) {
        var self = this;
        self.inProgress++;
        console.info((this.silent ? 'Silently fetching' : 'Fetching') + " data from: " + url);
        var loadingModal = $('#progressModal'),
            start = Date.now();
        if (!this.silent) {
            loadingModal.modal('show').on('hide.bs.modal', function (e) {
                e.preventDefault();
                return false;
            });
        }
        $.ajax(url, {
            method: 'GET',
            success: function(data) {
                if (typeof data !== 'object' || data.error) {
                    console.error("An error occurred while reading the data from: " + url);
                    console.error(data);
                    alert("Something went wrong, check the console for more info");
                    return true;
                }
                setTimeout(function() {
                    self.inProgress--;
                    cb(data);
                    if (self.inProgress === 0) {
                        loadingModal.unbind().modal('hide');
                    }
                }, Math.max(0, 1200 - (Date.now() - start)));
            },
            error: function(x, status, error) {
                console.error("An error occurred while requesting the data from: " + url);
                console.error(status + " --> " + error);
                console.warn("Ensure the OpenLog server is still running");
                alert("Something went wrong, check the console for more info");
            }
        });
    }
};