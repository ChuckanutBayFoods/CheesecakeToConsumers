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
     * @param {Backbone.Events} dispatcher
     */
    initialize : function(dispatcher) {
        this._dispatcher = dispatcher;

        this._currentSectionName = '';

        // Tracks whether we've dispatched a 'scrolltosection' event.  If it's true, then we're waiting for an animation to complete.
        this._isScrolling = false;

        this._dispatcher.on({
            'scrolledpastboundary' : this._trackCurrentSection,
            'scrollingpastboundaryprevented' : this._trackCurrentSection 
        }, this);
    },

    section : function(sectionName) {
        this._isScrolling = true;
        // If a section hasn't been set yet, use this one.
        // If this isn't done, then _announceNewSection can be called with _currentSectionName being ''.
        if (!this._currentSectionName) {
            this._currentSectionName = sectionName;
        }
        this._dispatcher.trigger(
            'scrolltosection', {
                sectionName : sectionName, 
                done : _.bind(_.partial(this._onSkrollrAnimateDone, sectionName), this)
            }
        );
    },

    /**
     * Called when Skrollr is done scrolling to the specified position.
     * @param {String} intendedScrollToSectionName Name of the {@link Section} that we intended to scroll to.
     * @param {Boolean} interrupted indicates if the animation was iterrupted by stopAnimateTo or finished to the end
     */
    _onSkrollrAnimateDone : function(intendedScrollToSectionName, interrupted) {
        this._isScrolling = false;
        if (!interrupted) {
            this._announceNewSection();
            return;
        }
        // We reached a different Section than intended.
        // Handle the case when a user doesn't navigate as far as they were hoping.
        // For example, if a customer loads the page and requests "pay" but are on "pick",
        // the history will be update with "pay", but upon attempting to scroll there,
        // scrolling past the pick boundary would be prevented.
        // We need to update the history with the current state.
        if (this._currentSectionName != intendedScrollToSectionName) {
            this.navigate(this._currentSectionName, {trigger : false, replace : true});
            this._announceNewSection();
        }
    },

    /**
     * Tracks what section we're currently in.
     * @param  {[type]} context eventContext
     */
    _trackCurrentSection : function(context) {
        var newSectionName = context.currentSection.name;
        if (this._currentSectionName == newSectionName) {
            return;
        }
        this._currentSectionName = newSectionName;
        // We're not scrolling/animating programatically.  This means the user has manually scrolled to get to a new section.
        if (!this._isScrolling) {
            this.navigate(newSectionName, {trigger : false, replace : false});
            this._announceNewSection();
        }
    },

    /**
     * Dispatches the 'reachednewsection' event.
     * This event is fired when we have actually reached the new section, not just that we intended to reach there.
     */
    _announceNewSection : function() {
        this._dispatcher.trigger('reachednewsection', this._currentSectionName);
    }

});