// Should only be accessed statically as a singleton.
ScrollBoundaryManager = {

    // Should not be called until S has been initialized.
    // Clears registered boundaries.
    init: function() {
        this._boundaries = [];
        this._initialized = true;
        if (!S) {
            throw "Initialize the skrollr object (S) first."
        }
        S.on('beforerender', function(e) {

            // Call the handler function of every boundary that is about to be crossed
            var boundaries = ScrollBoundaryManager._boundaries;
            for(var i = 0; i < boundaries.length; i++) {
                var boundary = boundaries[i];
                if ((e.curTop > boundary.position && e.lastTop <= boundary.position) // Crossing down over the boundary
                    || (e.curTop < boundary.position && e.lastTop >= boundary.position)) { // Crossing up over the boundary
                    if(boundary.handler(e) === false) { // handler function called, the boundary should not be crossed
                        S.setScrollTop(boundary.position, false);
                        return false;
                    };
                }
            }
        });
        return this;
    },

    // Registers a function to be called when the user scrolls to a specified location.
    // boundary - Can be any one of BOUNDARIES or a pixel position of a boundary (at the bottom of the viewport).
    // onBoundary - The function to notify when the boundary is crossed. Should return false if the user should not be allowed to scroll past the boundary.
    registerBoundary: function(boundary, onBoundary) {
        if(!this._initialized) {
            this.init();
        }
        this._boundaries.push({position: this.getBoundaryPosition(boundary), handler: onBoundary});
        return this;
    },

    // Gets the position of the top of the viewport in pixels for any boundary.
    // boundary - Can be any one of BOUNDARIES or a pixel position of a boundary (at the bottom of the viewport).
    getBoundaryPosition: function(boundary) {
        var position;
        switch(boundary) {
            case BOUNDARIES.SECTION1_TO_SECTION2: position = S.getSectionHeight() * 1; break;
            case BOUNDARIES.SECTION2_TO_SECTION3: position = S.getSectionHeight() * 2; break;
            case BOUNDARIES.SECTION3_TO_SECTION4: position = S.getSectionHeight() * 3; break;
            case BOUNDARIES.END: position = S.getSectionHeight() * 4; break;
            default : position = boundaryPosition;
        }
        position -= S.getViewportHeight(); // Accounts for the fact that boundaries at positions at the bottom of the window.
        return position;
    },

    // Removes all of the boundary registrations.
    unregisterAllBoundaries: function() {
        this._boundaries = [];
        return this;
    }
}

BOUNDARIES = {
    SECTION1_TO_SECTION2: {name: 'section1ToSection2'},
    SECTION2_TO_SECTION3: {name: 'section2ToSection3'},
    SECTION3_TO_SECTION4: {name: 'section3ToSection4'},
    END: {name: 'end'}
}

//skrollr object
var S;

(function() {
    S = skrollr.init({
        constants: {},
        forceHeight: false
    });
    skrollr.menu.init(S);

    // Gets the current height of the viewport
    S.getViewportHeight = function() {
        this._viewportHeight = this._viewportHeight || $(window).height();
        return this._viewportHeight;
    };

    // Gets the current height of each section
    S.getSectionHeight = function() {
        return this.getViewportHeight();
    };

    // Gets the height of the viewport prior to the most recent window resize
    S.getPreviousViewportHeight = function() {
        return this._previousViewportHeight;
    }

    // Update viewport functions on resize;
    $(window).resize(function(e) {
        S._previousViewportHeight = S._viewportHeight;
        S._viewportHeight = $(window).height();
    });

    var buttonClicked = false;
    $('#permission-to-enter-section3').click(function() {
        buttonClicked = true;
    });

    function registerBoundaries() {
        ScrollBoundaryManager
            .unregisterAllBoundaries()
            .registerBoundary(BOUNDARIES.SECTION2_TO_SECTION3, function(e) {
                //console.log(e);
                if (e.direction === "down" && !buttonClicked) {
                    return false;
                }
            })
            .registerBoundary(BOUNDARIES.SECTION3_TO_SECTION4, function(e) {
                //console.log(e);
                if (e.direction === "down") {
                    $('#entered-exited-section4').text('You have entered section 4');
                } else {
                    $('#entered-exited-section4').text('You have left section 4');
                }
            });
    }
    registerBoundaries();

    $(window).resize(function(e) {
        registerBoundaries();

        // Reposition skrollr to account for size change
        S.setScrollTop(S.getScrollTop() * S.getViewportHeight() / S.getPreviousViewportHeight(), true);
    });
})();

//$.fn.refresh = function() {
//    return this.each(function() {
//        if(S) {
//            S.refresh(this);
//        }
//    });
//};