/**
 * {@link Backbone.View} for the navigation controls.
 */
NavigationView = Backbone.View.extend({

    events: {
        'click a' : 'navigate'
    },

    /**
     * @constructor
     */
    initialize: function(options) {
        this._router = options.router;
    },

    navigate: function(jQueryEvent) {
        jQueryEvent.preventDefault();
        
        var href = $(jQueryEvent.currentTarget).attr('href');
        // Add "s" prefix, capitalize, and drop the "#"
        // "#pick" -> "sPick"
        var sectionName = "s" + href.charAt(1).toUpperCase() + href.slice(2);

        this._router.navigate(sectionName, {trigger : true});
    }

});