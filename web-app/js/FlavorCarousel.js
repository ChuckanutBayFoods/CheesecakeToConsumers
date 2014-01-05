FlavorCarousel = function(elementSelectors, flavorManager) {

    this.preloadSelectedBareImage = function() {
        $(elementSelectors.hiddenImages).append(
            '<img src="' + this.getSelectedFlavor().bareImageUrl + '" />'
        );
    };

    this.getSelectedFlavor = function() {
        return flavorManager.getFlavorById($(elementSelectors.main).find('.flavor.active').attr('data-id'));
    };

    this.addFlavor = function(flavor) {
        $(elementSelectors.main).find('.scroll').append(
            '<li class="flavor" data-id="' + flavor.id + '">' +
                (flavor.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                '<img src="' + flavor.stageImageUrl + '"/>' +
                '<div class="flavor-label">' + flavor.name + '</div>' +
                '</li>'
        );
    };

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
        scrollBy: 1,
        speed: 300,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,

        // control buttons
        prev: $(elementSelectors.leftArrow),
        next: $(elementSelectors.rightArrow)

    }).sly('on', 'change', $.proxy(this.preloadSelectedBareImage, this));
};