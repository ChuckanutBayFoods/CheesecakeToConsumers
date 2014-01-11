/**
 * #link{Backbone.Router} for this application.
 * Navigations to a different section should all be done through this class.
 * This will take care of updating the history, and then dispatching the necessary 'scrolltosection' events.
 */
Router = Backbone.Router.extend({

    routes: {
        ':sectionName' : 'section'
    },

    /**
     * @constructor
     * @param  {Backbone.Events} dispatcher
     */
    initialize : function(dispatcher) {
        this._dispatcher = dispatcher;

        this._dispatcher.on({
            'scrollingpastboundaryprevented' : this._handleTruncatedNavigate 
        }, this);
    },

    section : function(sectionName) {
        this._dispatcher.trigger('scrolltosection', sectionName);
    },

    /**
     * Handle the case when a user doesn't navigate as far as they were hoping.
     * For example, if a customer loads the page and requests "pay" but are on "pick",
     * the history will be update with "pay", but upon attempting to scroll there,
     * scrolling past the pick boundary would be prevented.
     * We need to update the history with the current state.
     *
     * Note: because we're listening to "scrollingpastboundaryprevented",
     * this method gets invoked every time a user tries to scroll/move past a boundary.
     * Since we're calling navigate without triggering a route and we're replacing the history,
     * there is no ill-effect.
     * 
     * @param  {Object} context
     * @return {void}
     */
    _handleTruncatedNavigate : function(context) {
        this.navigate(context.currentSection.name, {trigger : false, replace : true});
    }

});