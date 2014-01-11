// Should not be called until S has been initialized.
// Clears registered boundaries.
ScrollBoundaryManager = function(skrollr, dispatcher, router) {
    this._skrollr = skrollr;
    this._dispatcher = dispatcher;
    this._router = router;

    this._dispatcher.on({
        'navigatetonextsection' : this._navigateToNextSection,
        'scrolltosection' : this._scrollToSection
    }, this);

    var sections = [];
    var sectionNameToSectionMap = {};
    _.each(Section.NAMES, function(sectionName, index) {
        var section = new Section(sectionName, index);
        sections.push(section);
        sectionNameToSectionMap[sectionName] = section;
    });
    this._sections = sections;
    this._sectionNameToSectionMap = sectionNameToSectionMap;
    this._initializeBoundaries();

    this._skrollr.on('beforerender', _.bind(this._beforeSkrollrRender, this));

    $(window).resize(_.bind(this._onViewportResize, this));

    // Registers a function to be called when the user scrolls to a specified location.
    // boundary - Can be any one of Constants.Boundaries or a pixel position of a boundary (at the bottom of the viewport).
    // onBoundary - The function to notify when the boundary is crossed. Should return false if the user should not be allowed to scroll past the boundary.
    this.registerBoundary = function(boundary, onBoundary) {
        boundaries.push({position: getBoundaryPosition(boundary), handler: onBoundary});
        return this;
    };

    // Gets the position of the top of the viewport in pixels for any boundary.
    // boundary - Can be any one of Constants.Boundaries or a pixel position of a boundary (at the bottom of the viewport).
    function getBoundaryPosition(boundary) {
        // Accounts for the fact that boundaries at positions at the bottom of the window.
        return (Constants.Boundaries[boundary.name] && Constants.Boundaries[boundary.name].position() || boundary - Utils.getViewportHeight());
    }

    // Removes all of the boundary registrations.
    this.unregisterAllBoundaries = function() {
        boundaries = [];
        return this;
    };
};

_.extend(ScrollBoundaryManager.prototype, {

    _initializeBoundaries : function() {
        this._sectionViewportTopBoundaries = [];
        this._sectionViewportBottomBoundaries = [];
        _.each(this._sections, function(section) {
            this._sectionViewportTopBoundaries.push(section.getViewportTopPosition());
            this._sectionViewportBottomBoundaries.push(section.getViewportBottomPosition());
        }, this);
    },

    _onViewportResize : function() {
        this._initializeBoundaries();
        // Reposition skrollr to account for size change
        this._skrollr.setScrollTop(this._skrollr.getScrollTop() * Utils.getViewportHeight() / Utils.getPreviousViewportHeight(), true);
    },

    _beforeSkrollrRender : function(e) {
        var dispatcher = this._dispatcher;
        var sections = this._sections;
        var viewportBoundaries = e.direction === 'down' ? this._sectionViewportBottomBoundaries : this._sectionViewportTopBoundaries;
        var lastIndex = _.sortedIndex(viewportBoundaries, e.lastTop);
        var curIndex = _.sortedIndex(viewportBoundaries, e.curTop);
        if (lastIndex === curIndex) {
            return;
        }
        var context = {
            currentSection : sections[lastIndex],
            direction : e.direction,
            fromSection : sections[lastIndex],
            toSection : sections[curIndex],
            allowScroll : true
        };
        dispatcher.trigger('beforescrollpastboundary', context);
        if (context.allowScroll === false) {
            dispatcher.trigger('scrollingpastboundaryprevented', context);
            this._skrollr.setScrollTop(viewportBoundaries[lastIndex], false);
            // Prevent rendering
            return false;
        } else {
            context.currentSection = context.toSection;
            dispatcher.trigger('scrolledpastboundary', context);
        }
    },

    _getCurrentSection : function() {
        // If no section is found, then use section at index 0.
        var sectionIndex = Math.max(_.indexOf(Section.NAMES, Backbone.history.fragment), 0);
        return this._sections[sectionIndex];
    },

    _getNextSection : function() {
        var nextSectionIndex = this._getCurrentSection().index + 1;
        return this._sections[nextSectionIndex];
    },

    _navigateToNextSection : function() {
        this._router.navigate(this._getNextSection().name, {trigger : true});
    },

    _scrollToSection : function(sectionName) {
        var section = this._sectionNameToSectionMap[sectionName];
        if (!section) {
            return;
        }
        this._skrollr.animateTo(section.getViewportBottomPosition(), {duration: 3000, easing: 'swing'});
    }
});