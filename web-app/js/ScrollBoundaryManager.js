// Should not be called until S has been initialized.
// Clears registered boundaries.
ScrollBoundaryManager = function() {
    if (!S) {
        throw 'Initialize the skrollr object (S) first.';
    }
    var boundaries = [];
    S.on('beforerender', function(e) {

        // Call the handler function of every boundary that is about to be crossed
        // TODO: convert to foreach
        for (var i = 0; i < boundaries.length; i++) {
            var boundary = boundaries[i];
            if ((e.curTop > boundary.position && e.lastTop <= boundary.position) // Crossing down over the boundary
                || (e.curTop <= boundary.position && e.lastTop > boundary.position)) { // Crossing up over the boundary
                if (boundary.handler(e) === false) { // handler function called, the boundary should not be crossed
                    S.setScrollTop(boundary.position, false);
                    return false;
                }
            }
        }
    });

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