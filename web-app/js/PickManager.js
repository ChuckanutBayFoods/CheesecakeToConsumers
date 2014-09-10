// #flavor-carousel
// #selected-cheesecake-btns .btn-more-info
// #selected-cheesecake-btns .btn-add
//'#more-info'
//'.btn-show-nutrition-label'
PickManager = function(elementSelectors, order, onPickComplete, flavorFactory) {
    var flavorCarousel;
    flavorFactory.getAllFlavors().then(function(flavors) {
        flavorCarousel = new FlavorCarousel({
            main: elementSelectors.carousel + ' .well',
            leftArrow: elementSelectors.carousel + ' .arrow-left',
            rightArrow: elementSelectors.carousel + ' .arrow-right',
            hiddenImages: '#hidden-image-loading-container'
        }, flavors, function() {
            _pickCheesecake(flavorCarousel.getSelectedFlavor());
        });
    });

    $(elementSelectors.showNutritionLabelButton).click(function() {
        $(this).hide();
        $(elementSelectors.moreInfo).addClass('show-nutrition-label');
    });

    $(elementSelectors.moreInfoButton).click($.proxy(function() {
        displayMoreInfo(flavorCarousel.getSelectedFlavor());
    }, this));

    $(elementSelectors.addButton).click($.proxy(function() {
        this.pickCheesecake(flavorCarousel.getSelectedFlavor());
    }, this));

    $.each(order.cheesecakes.all(), function(i, v) {
        if (v) {
            displayCheesecake(i + 1,  v);
        }
    });

    function displayMoreInfo(flavor) {
        var moreInfoWindow = $(elementSelectors.moreInfo).removeClass('show-nutrition-label').modal();
        $(elementSelectors.showNutritionLabelButton).show();
        moreInfoWindow.find('h3').text(flavor.name);
        moreInfoWindow.find('.staged-image').attr('src', flavor.stageImageUrl);
        moreInfoWindow.find('.description').text(flavor.description);
        moreInfoWindow.find('.ingredients').text(flavor.ingredients);
        moreInfoWindow.find('.allergens').text(flavor.allergens);
        moreInfoWindow.find('.nutrition-label').attr('src', flavor.nutritionLabelImageUrl);
        return this;
    }

    this.disable = function() {
        $(elementSelectors.addButton).addClass('disabled');
        $(elementSelectors.tray1 + ', ' + elementSelectors.tray2).find('.cheesecake').off('click');
    };


    var _pickCheesecake = function(flaovr) {
        var flavor = flavorCarousel.getSelectedFlavor();
        var slot = order.cheesecakes.add(flavor);

        if (slot === false) {
            return;
        }

        displayCheesecake(slot + 1, flavor);
    };
    this.pickCheesecake = _pickCheesecake;

    function displayCheesecake(cheesecakeNumber, flavor) {
        if (order.cheesecakes.isFull()) {
            $(elementSelectors.addButton).addClass('disabled');
            onPickComplete();
        }

        var parentContainer;
        if (cheesecakeNumber <= Constants.NUM_CHEESECAKE_SLOTS/2) {
            parentContainer = $(elementSelectors.tray1);
        } else {
            parentContainer = $(elementSelectors.tray2);
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $(
            '<img class="cheesecake cheesecake' + cheesecakeNumber + '" src="' + flavor.bareImageUrl + '">')
            .appendTo(parentContainer)
            .popover({
                placement: 'top',
                content: function() {
                    return $(
                        '<div class="flavor-label">' + flavor.name + '</div>' +
                            '<div class="btn-container btn-container' + cheesecakeNumber + '">' +
                            '<div class="btn btn-more-info">More info</div>' +
                            '<div class="btn btn-remove btn-danger">Remove</div>' +
                            '</div>').data('flavor', flavor);
                },
                html: true,
                trigger: 'manual'
            })
            .click(function(e) {
                // TODO Validate correct section
                $(this).popover('show');
                clickedAway = false;
                isVisible = true;
                e.preventDefault();
                $('.popover').bind('click', function() {
                    clickedAway = false;
                });
            })
            .animate({opacity: 1}, 500);

        cheesecake.parent().delegate('.btn-container' + cheesecakeNumber + ' .btn-more-info', 'click', $.proxy(function() {
            displayMoreInfo(flavor);
        }, this)).delegate('.btn-container' + cheesecakeNumber + ' .btn-remove', 'click', function() {
            order.cheesecakes.remove(cheesecakeNumber - 1);
            cheesecake.popover('hide').animate({opacity: 0}, 500, function() {
                cheesecake.remove();
            });
            $(elementSelectors.addButton).removeClass('disabled');
            $('footer').addClass('out');
        });

        $(document).click(function(e) {
            if(isVisible && clickedAway) {
                cheesecake.popover('hide');
                isVisible = clickedAway = false;
            } else {
                clickedAway = true;
            }
        });
        return this;
    }
};