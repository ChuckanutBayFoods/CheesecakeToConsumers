/**
 * Implemented using Sly, the Flavor Carousel displays flavors for the user to add to the box.
 *
 * Should be converted to a view.
 *
 * @param {Object} elementSelectors Should include a hiddenImages, main, leftArrow, and rightArrow selector
 * @param {Object} flavorManager The flavor manager used to get the flavor data to populate the carousel with
 * @param {function} [onDoubleClick] Called when an element is double clicked
 * @constructor
 */
FlavorCarousel = function(elementSelectors, flavorManager, onDoubleClick) {

    this.preloadSelectedBareImage = function() {
        $(elementSelectors.hiddenImages).append(
            '<img src="' + this.getSelectedFlavor().bareImageUrl + '" />'
        );
    };

    /**
     * Returns the flavor currently at the center of the carousel
     * @returns {Object}
     */
    this.getSelectedFlavor = function() {
        return flavorManager.getFlavorById($(elementSelectors.main).find('.flavor.active').attr('data-id'));
    };

    /**
     * Adds the given flavor to the end of the carousel
     * @param flavor The flavor to add to the carousel
     */
    this.addFlavor = function(flavor) {
        $(elementSelectors.main).find('.scroll').append(new FlavorCarouselItem({model: flavor}).render().el);
    };

    /**
     * Adds each of the given flavors to the carousel. See addFlavor.
     * @param {Array} flavors
     */
    this.addAllFlavors = function(flavors) {
        $.each(flavors, $.proxy(function(i, v) {
            this.addFlavor(v);
        }, this));
    };
    this.addAllFlavors(flavorManager.getAllFlavors());

    // See http://darsa.in/sly/examples/horizontal.html
    $(elementSelectors.main).sly({
        horizontal: 1,
        itemNav: 'forceCentered',
        smart: 1,
        activateMiddle: 1,
        activateOn: 'click',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: 0,
        scrollBy: 0,
        speed: 500,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,

        // control buttons
        prev: $(elementSelectors.leftArrow),
        next: $(elementSelectors.rightArrow)

    })
        .sly('on', 'change', $.proxy(this.preloadSelectedBareImage, this))
        .sly('on', 'moveStart', function(e){
            //$('#selected-cheesecake-btns').addClass('transparent');
        })
        .sly('on', 'moveEnd', function(e){
            //$('#selected-cheesecake-btns').removeClass('transparent');
        });

    $(elementSelectors.main).find('.flavor').dblclick(onDoubleClick);
};