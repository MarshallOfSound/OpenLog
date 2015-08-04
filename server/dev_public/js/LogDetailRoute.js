var LogDetailRoute = function(conf) {
    if (typeof conf.id === 'undefined' || typeof conf.group === 'undefined') {
        localStorage.setItem("page", "logs");
        window.location.reload();
        return;
    }
    this.logID = conf.id;
    this.logGroup = conf.group;
    this.container = $('.log_detail_container');
    this.container.css({opacity: 0});
};
LogDetailRoute.prototype.init = function() {
    this.Loader = new DataLoader();
    this.Loader.fetchLogData(this.logID, this.logGroup, $.proxy(function(data) {
        var log = new LogObject(data);

        this.container.find('.log_id').text(log._id + (this.logGroup ? ' (Grouped with similar)' : ''));
        this.container.find('.log_type').text(log.getNiceType())
            .removeClass('text-info').removeClass('text-danger').removeClass('text-warning').addClass('text-' + log.getBootstrapType());
        this.container.find('.log_time').text(log.getDate());
        this.container.find('.log_page').html('<a href="' + log.page + '" target="_blank">' + log.page + '</a>');
        if (this.logGroup) {
            this.container.find('.log_quantity').css('display', 'block');
            this.container.find('.log_quantity_number').text(data.quantity);
        } else {
            this.container.find('.log_quantity').css('display', 'none');
        }
        this.container.find('.log_message').text(log.message);
        this.container.find('.log_trace').text(log.trace);
        $('.log_detail_container').animate({opacity: 1});
    }, this));
    this.onReady();
};