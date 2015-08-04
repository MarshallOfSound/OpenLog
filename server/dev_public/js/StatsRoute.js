var StatsRoute = function() {

};
StatsRoute.prototype.init = function(silent) {
    var self = this,
        loadSilent = silent || false;
    this.Loader = new DataLoader();
    this.Loader.silent = loadSilent;
    this.Loader.fetchStats(function(data) {
        var statPanels = $('.stat-panel .panel-body');

        statPanels.eq(0).text(data.quantity.total);
        statPanels.eq(1).text(data.quantity.info);
        statPanels.eq(2).text(data.quantity.warn);
        statPanels.eq(3).text(data.quantity.error);

        self.renderPastGraph(data.past);
        self.renderFrequencyTable(data.pages);
        self.onReady();
    });
    setTimeout(function() {
        if (window.Router.page === 'stats') {
            self.init(true);
            window.Router.listenForRoutes();
        }
    }, 10000);
};
StatsRoute.prototype.renderPastGraph = function(data) {
    setTimeout(function() {
        $('#past-graph').html('');
        Morris.Area({
            element: 'past-graph',
            data: data.reverse(),
            xkey: 'week',
            xLabelFormat: function(x) {
                x = 9 - parseInt(x.x);
                switch (x) {
                    case 0:
                        return "Last 7 days";
                    default:
                        return (x * 7) + " - " + ((x + 1) * 7) + " Days ago";
                }
            },
            ykeys: ['info', 'warn', 'error'],
            labels: ['Information Logs', 'Warning Logs', 'Error Logs'],
            lineColors: ['#03a9f4', '#ff5722', '#f44336'],
            parseTime: false,
            resize: true
        });
    }, 100);
};
StatsRoute.prototype.renderFrequencyTable = function(data) {
    var table = $('#errorFrequencyTable'),
        max = 0,
        maxKey;
    table.find('tr:not(:eq(0))').remove();
    for (var rank = 1; rank <= 5; rank++) {
        max = 0;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] > max && key !== 'total') {
                    max = data[key];
                    maxKey = key;
                    delete data[key];
                }
            }
        }
        if (max !== 0) {
            table.append('<tr><td>' + maxKey + '</td><td>' + max + '</td></tr>');
        }
    }
};