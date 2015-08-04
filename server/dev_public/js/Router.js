/**
 * Constructs a new Router
 * Handles page switching and page state management without the browser actually loading a new page
 * @constructor
 */
var Router = function() {
    this.page = localStorage.getItem("page") || "stats";
    this.routes = {
        "stats": StatsRoute,
        "logs": LogsRoute,
        "log-detail": LogDetailRoute
    };
    this.initialLoad = true;
    // Set to null so the first page change happens
    localStorage.setItem("page", null);
    this.changePage(this.page, true, (localStorage.getItem("conf") || "{}"));

    window.onpopstate = $.proxy(function(state) {
        this.changePage(state.state.page, false, JSON.stringify(state.state.conf));
    }, this);
};
Router.prototype = {
    /**
     * Adds click listeners on all elements with the data-router attribute
     * NOTE: Removes all previous click listeners so you don't end up with multiple fires
     */
    listenForRoutes: function() {
        $('[data-router]').unbind('click').click($.proxy(function(e) {
            var target = $(e.currentTarget).attr('href').substr(1);

            this.changePage(target, true, $(e.currentTarget).attr('data-router-conf'));
            e.preventDefault();
            return false;
        }, this));
    },
    /**
     * Navigates to a new page (the given name variable)
     * @param name string Name of the page to change to
     * @param pushState boolean True if you want to append the page change to the browser history, False otherwise (By default should be true, can be undefined)
     * @param params string A JSON string representing an object that will be passed to the new Route created (By default an empty object, can be undefined)
     */
    changePage: function(name, pushState, params) {
        var anim = false,
            conf = params || "{}",
            self = this;
        conf = JSON.parse(conf);
        pushState = (typeof pushState !== 'undefined' ? pushState : true);
        if (name !== localStorage.getItem("page")) {
            var nav = $('.navbar .nav.navbar-nav');
            nav.find('li.active a[data-router]').parent().removeClass('active');
            nav.find('li a[href="#' + (name === 'log-detail' ? 'logs' : name) + '"]').parent().addClass('active');

            localStorage.setItem("page", name);
            localStorage.setItem("conf", JSON.stringify(conf));
            this.page = name;
            if (pushState) {
                if (this.initialLoad) {
                    history.replaceState({page: name, conf: conf}, null, "/#" + name);
                    this.initialLoad = false;
                } else {
                    history.pushState({page: name, conf: conf}, null, "/#" + name);
                }
            }
            $('.container > div').each(function() {
                var tmp = $(this);
                if (tmp.css("opacity") !== "0") {
                    console.info("Hiding the " + $(this).data('route') + ' page');
                    anim = true;
                    tmp.animate({opacity: 0}, $.proxy(function() {
                        tmp.css("display", "none");
                        console.info("Showing the " + name + ' page');
                        this._animEnd(name, conf);
                    }, self));
                }
            });
            if (!anim) {
                console.warn("No page detected as active, fading in the new page");
                this._animEnd(name, conf);
            }
        }
    },
    /**
     * This function fires once the old page has been faded out or instantly if no page was loaded already
     * @param name string The name of the page to switch to
     * @param conf object The conf object to be passed to the new page
     */
    _animEnd: function(name, conf) {
        var self = this;
        this.currentRoute = new this.routes[name](conf);
        this.currentRoute.onReady = function() {
            $('.container > div[data-route=' + name + ']').css("display", "block").animate({opacity: 1});
            self.listenForRoutes();
        };
        this.currentRoute.init();
    }
};