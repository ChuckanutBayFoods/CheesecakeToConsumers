// Should only be accessed statically as a singleton.
function ScrollBoundaryManager() {}

// Should not be called until S has been initialized.
// Clears registered boundaries.
ScrollBoundaryManager.init = function() {
    this._boundaries = [];
    this._initialized = true;
    if (!S) {
        throw "Initialize the skrollr object (S) first."
    }
    S.on('beforerender', function(e) {
        var boundaries = ScrollBoundaryManager._boundaries;
        for(var i = 0; i < boundaries.length; i++) {
            var boundary = boundaries[i];
            var boundaryTop = boundary.position - S.getViewportHeight(); // Accounts for the fact that boundaries at positions at the bottom of the window.
            if ((e.curTop > boundaryTop && e.lastTop <= boundaryTop)
                || (e.curTop < boundaryTop && e.lastTop >= boundaryTop)) {
                if(boundary.handler(e) === false) {
                    S.setScrollTop(boundaryTop, false);
                    return false;
                };
            }
        }
    });
    return this;
}

// Registers a function to be called when the user scrolls to a specified location.
// boundaryPosition - The pixel position of the bottom of the viewport of the boundary or a section transition name.
// onBoundary - The function to notify when the boundary is crossed. Should return false if the user should not be allowed to scroll past the boundary.
ScrollBoundaryManager.registerBoundary = function(boundaryPosition, onBoundary) {
    if(!this._initialized) {
        this.init();
    }
    var position;
    switch(boundaryPosition) {
        case 'section1ToSection2':position = S.getSectionHeight() * 1; break;
        case 'section2ToSection3':position = S.getSectionHeight() * 2; break;
        case 'section3ToSection4':position = S.getSectionHeight() * 3; break;
        default : position = boundaryPosition;
    }
    this._boundaries.push({position: position, handler: onBoundary});
    return this;
}

// Removes all of the boundary registrations.
ScrollBoundaryManager.unregisterAllBoundaries = function() {
    this._boundaries = [];
    return this;
}

//skrollr object
var S;
var MIN_SECTION_HEIGHT = 800;

(function() {
    S = skrollr.init({
        constants: {},
        forceHeight: false
    });

    // Gets the current height of the viewport
    S.getViewportHeight = function() {
        return $(window).height();
    };

    // Gets the current height of each section
    S.getSectionHeight = function() {
        return Math.max(this.getViewportHeight(), MIN_SECTION_HEIGHT);
    };

    var buttonClicked = false;
    $('#permission-to-enter-section3').click(function() {
        buttonClicked = true;
    });

    function registerBoundaries() {
        ScrollBoundaryManager
            .unregisterAllBoundaries()
            .registerBoundary('section2ToSection3', function(e) {
                console.log(e);
                if (e.direction === "down" && !buttonClicked) {
                    return false;
                }
            })
            .registerBoundary('section3ToSection4', function(e) {
                console.log(e);
                if (e.direction === "down") {
                    $('#entered-exited-section4').text('You have entered section 4');
                } else {
                    $('#entered-exited-section4').text('You have left section 4');
                }
            });
    }
    registerBoundaries();

    var isRealativeMode = S.getViewportHeight() >= MIN_SECTION_HEIGHT;
    $(window).resize(function() {
        if ((isRealativeMode && S.getViewportHeight() < MIN_SECTION_HEIGHT) || (!isRealativeMode && S.getViewportHeight() >= MIN_SECTION_HEIGHT)) {
            isRealativeMode = !isRealativeMode;
            $('.skrollable').removeAttrs(/^data-/);
            $('script[src="//prinzhorn.github.io/skrollr-stylesheets/dist/skrollr.stylesheets.min.js"]').remove();
            $('<script src="//prinzhorn.github.io/skrollr-stylesheets/dist/skrollr.stylesheets.min.js" type="text/javascript"></script>').appendTo('body');
            setTimeout(function() {
                S.refresh();
                registerBoundaries();
            }, 1000);
        }
    });
})();

$.fn.removeAttrs = function (regex) {
    return this.each(function() {
        var $this = $(this);
        var names = [];
        $.each(this.attributes, function(i, attr) {
            if (attr && attr.specified && regex.test(attr.name)) {
                names.push(attr.name);
            }
        });
        $.each(names, function(i, attr) {
            $this.removeAttr(attr);
        });


    });
}


$.fn.refresh = function() {
    return this.each(function() {
        if(S) {
            S.refresh(this);
        }
    });
};