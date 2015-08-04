/**
 * A representation of a Log that was send to OpenLog
 * @param obj The JSON object holding the raw Log data
 * @constructor
 */
var LogObject = function(obj) {
    this.type = obj.type;
    this.message = (typeof obj.message === 'object' ? obj.message["0"] : obj.message);
    this.trace = obj.trace;
    this.UNIXtime = obj.time;
    this.page = obj.page;
    this.IP = obj.IP;
    this.count = obj.count || 1;
    this._id = obj._id;
};
LogObject.prototype = {
    /**
     * Prettifies the timestamp into a string in the format {dd-mm-yyyy hh:ii:ss}
     * @returns {string}
     */
    getDate: function() {
        var date = new Date(this.UNIXtime),
            year = date.getFullYear(),
            month = "0" + (date.getMonth() + 1),
            day = date.getDate(),
            hours = date.getHours(),
            minutes = "0" + date.getMinutes(),
            seconds = "0" + date.getSeconds();

        return [day, month.substr(-2), year].join("-") + "  " + [hours, minutes.substr(-2), seconds.substr(-2)].join(":");
    },
    /**
     * Converts the integer representing a Log type into its corresponding string
     * @returns {string}
     */
    getNiceType: function() {
        return {
            info: "Info",
            warn: "Warning",
            error: "Error"
        }[this.type];
    },
    /**
     * Converts the integer representing a Log type into its corresponding bootstrap class prefix
     * @returns {string}
     */
    getBootstrapType: function() {
        return {
            info: "info",
            warn: "warning",
            error: "danger"
        }[this.type];
    }
};