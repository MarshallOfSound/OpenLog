var LogsRoute = function() {
    this.expanded = localStorage.getItem("filterExpanded") || false;
    this.currentPage = parseInt(localStorage.getItem("currentPage") || 0);
    if (typeof this.expanded === 'string') {
        this.expanded = (this.expanded === 'true');
    }
    this.filterBar = $('.filter-bar');
    this.toggle = $('.filter-toggle');
    this.filterBar.height(0);
    if (this.expanded) {
        this.filterBar.css("height", "auto");
        this.toggle.addClass('up');
    }

    this.toggle.closest('.panel-heading').unbind().click($.proxy(function(e) {
        var toggle = $(e.currentTarget).find('.filter-toggle'),
            h,t;
        toggle.toggleClass('up');
        if (this.expanded) {
            this.filterBar.height(this.filterBar.height());
            t = document.clientHeight;
            this.filterBar.height(0);
        } else {
            h = this.filterBar.css('height', 'auto').height();
            this.filterBar.height(0);
            this.filterBar.height(h);
        }
        this.expanded = !this.expanded;
        localStorage.setItem("filterExpanded", this.expanded);
    }, this));
};
LogsRoute.prototype.init = function() {
    var self = this;
    this.loadState = 0;
    this.Loader = new DataLoader();
    this.Loader.fetchPageList(function(data) {
        self.generatePageList(data);
        self.loadState++;
        self.done();
    });
    this.updateFilter();
    this.changePage(this.currentPage);
};
LogsRoute.prototype.initFilterListeners = function() {
    var links = {
            type: $('#errorType'),
            message: null,
            page: $('#errorPage'),
            ip: null,
            id: null,
            group: null
        },
        self = this;
    for (var key in links) {
        if (links.hasOwnProperty(key) && links[key] !== null) {
            (function() {
                var attr = key;
                links[attr].unbind('change').change($.proxy(function (e) {
                    var sel = $(e.currentTarget);
                    this.filter[attr] = (sel.val() === '*' ? null : sel.val());
                    this.updateFilter();
                    this.changePage(0);
                }, self)).val(self.filter[attr] || '*');
            })(); // jshint ignore:line
        }
    }
    $('#autoGrouping').unbind('change').change($.proxy(function(e) {
        var check = $(e.currentTarget);
        this.filter.group = (check.is(':checked') ? '1' : '0');
        this.updateFilter();
        this.changePage(0);
    }, this)).prop('checked', (this.filter.group === '1'));
    $('#messageRegEx').unbind().keydown(function(e) {
        if (e.which === 13) {
            $(this).blur();
        }
    }).change($.proxy(function(e) {
        var input = $(e.currentTarget);
        this.filter.message = (input.val() === '' ? null : input.val());
        this.updateFilter();
        this.changePage(0);
    }, this)).val(this.filter.message);
    $('.clear-filter').unbind().click($.proxy(function() {
        delete this.filter;
        localStorage.removeItem("filterConf");
        this.updateFilter();
        this.changePage(0);
    }, this));
};
LogsRoute.prototype.updateFilter = function() {
    this.filter = this.filter || (localStorage.getItem("filterConf") || {type: null, message: null, page: null, ip: null, id: null, group: null});
    if (typeof this.filter !== 'object') {
        this.filter = JSON.parse(this.filter);
    }
    localStorage.setItem("filterConf", JSON.stringify(this.filter));
    this.Loader.setFilter(this.filter.type, this.filter.message, this.filter.page, this.filter.ip, this.filter.id, this.filter.group);
    this.initFilterListeners();
};
LogsRoute.prototype.changePage = function(page) {
    var self = this;
    this.currentPage = page;
    localStorage.setItem("currentPage", this.currentPage);
    this.Loader.fetchPage(this.currentPage, function(data) {
        self.renderPage(data);
        self.loadState++;
        self.done();
    });
};
LogsRoute.prototype.renderPage = function(data) {
    var logs = data.logs,
        table = $('#logTable');

    this.renderPagination(data.max);

    table.find('tr:not(:eq(0))').remove();
    for (var i = 0; i < logs.length; i++) {
        table.append('<tr data-router href="#log-detail" data-router-conf=\'{"id": ' + logs[i]._id + ', "group": ' + (this.filter.group === "1" ? 'true' : 'false') + '}\' class="bg-' + logs[i].getBootstrapType() + '"><td>' + logs[i]._id + '</td><td><span class="text-' + logs[i].getBootstrapType() + '">' + logs[i].getNiceType() + '</span></td><td>' + logs[i].message + '</td><td>' + logs[i].count + '</td><td>' + logs[i].getDate() + '</td></tr>');
    }
    if (this.filter.group !== '1') {
        table.find('tr').each(function() {
            $(this).find('td:eq(3)').css('display', 'none');
        });
        table.find('tr:eq(0) th:eq(3)').css('display', 'none');
        table.find('tr:eq(0) th:eq(0)').css('display', 'table-cell');
    } else {
        table.find('tr').each(function() {
            $(this).find('td:eq(0)').css('display', 'none');
        });
        table.find('tr:eq(0) th:eq(0)').css('display', 'none');
        table.find('tr:eq(0) th:eq(3)').css('display', 'table-cell');
    }
    console.info("Received " + logs.length + " logs with a max page value of " + data.max);
    window.Router.listenForRoutes();
};
LogsRoute.prototype.renderPagination = function(maxPage) {
    var pagesToRender = [],
        PAGES_EACH_WAY = 2,
        pagination = $('.pagination'),
        tmp;

    for (var direction = -1; direction <= 0; direction++) {
        for (var inc = this.currentPage + (direction * PAGES_EACH_WAY); inc <= this.currentPage + ((direction + 1) * PAGES_EACH_WAY) + direction; inc++) {
            if (inc >= 0 && inc <= maxPage) {
                pagesToRender.push(inc);
            }
        }
    }
    console.info("Rendering pagination buttons from " + (pagesToRender[0] + 1) + " to " + (pagesToRender[pagesToRender.length - 1] + 1));
    if (pagesToRender[0] !== 0) {
        if (pagesToRender[0] !== 1) {
            pagesToRender = ['...'].concat(pagesToRender);
        }
        pagesToRender = [0].concat(pagesToRender);
    }
    if (pagesToRender[pagesToRender.length - 1] !== maxPage) {
        if (pagesToRender[pagesToRender.length - 1] !== maxPage - 1) {
            pagesToRender = pagesToRender.concat(['...']);
        }
        pagesToRender = pagesToRender.concat([maxPage]);
    }
    if (maxPage === -1) {
        pagesToRender = ['No Logs Found'];
    }
    pagination.html('');
    for (var i = 0; i < pagesToRender.length; i++) {
        tmp = $('<a data-paginate="' + pagesToRender[i] + '" class="btn btn-info btn-raised">' + (pagesToRender[i] + 1) + '</a>');
        if (typeof pagesToRender[i] === 'string') {
            tmp.addClass('disabled');
            tmp.text(pagesToRender[i]);
        }
        if (pagesToRender[i] === this.currentPage) {
            tmp.addClass('active');
        }
        pagination.append(tmp);
    }
    pagination.find('.btn').click($.proxy(function(e) {
        var newPage = parseInt($(e.currentTarget).data('paginate'));
        if (newPage !== this.currentPage) {
            this.changePage(newPage);
        }
    }, this));
};
LogsRoute.prototype.done = function() {
    if (this.loadState === 2) {
        this.onReady();
    }
};
LogsRoute.prototype.generatePageList = function(data) {
    var sel = $('#errorPage');
    sel.find('option:not(:eq(0))').remove();
    for (var i = 0; i < data.length; i++) {
        sel.append("<option>" + data[i] + "</option>");
    }
};