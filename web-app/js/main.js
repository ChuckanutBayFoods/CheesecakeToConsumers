(function main() {
    var order = new Order();

    var pickManager = new PickManager(
        {
            carousel: '#flavor-carousel',
            moreInfoButton: '#selected-cheesecake-btns .btn-more-info',
            addButton: '#selected-cheesecake-btns .btn-add',
            moreInfo: '#more-info',
            showNutritionLabelButton: '.btn-show-nutrition-label',
            tray1: '#tray1',
            tray2: '#tray2'
        },
        order,
        function() {
            S.animateTo(Constants.Boundaries.PERSONALIZE_TO_PACK.position(), {duration: 4000, easing: 'swing'});
        }
    );

    var personalizeManager = new PersonalizeManager(
        {
            main: '#gift-message'
        },
        order,
        function() {
            S.animateTo(Constants.Boundaries.PACK_TO_PAY.position(), {duration: 3000, easing: 'swing'});
        }
    );

    var packManager = new PackManager(
        {
            main: '#label form'
        },
        order,
        function() {
            S.animateTo(Constants.Boundaries.PAY_TO_ORDER_COMPLETE.position(), {duration: 3000, easing: 'swing'});
        }
    );

    var payManager = new PayManager(
        {
            payForm: '#checkout-window form',
            checkoutWindow: '#checkout-window'
        },
        order,
        function() {
            store.remove('incompleteOrder');
            pickManager.disable();
            personalizeManager.disable();
            packManager.disable();
            payManager.disable();
            S.animateTo(Constants.Boundaries.END.position(), {duration: 3000, easing: 'swing'});
        }
    );

    var orderCompleteManager = new OrderCompleteManager(
        {
            main: '#order-complete'
        },
        order
    );

    S = skrollr.init({
        constants: {},
        forceHeight: false
    });
    skrollr.menu.init(S);
    S.setScrollTop(0);

    var scrollBoundaryManager = new ScrollBoundaryManager();

    /**
     * Create an onBoundary handler for the ScrollBoundaryManager.
     * @param  {Object} boundary
     * @param  {Function} allowDownwardScrollPredicate function that should return true if we're allowed to progress past this boundary.
     * @param  {Function} successfulDownFn function to invoke if successfully advanced past the boundary.
     * @return {Function}
     */
    function createOnBoundaryHandler(boundary, allowDownwardScrollPredicate, successfulDownFn) {
        return function(e) {
            //console.log(e);
            if (e.direction === 'up') {
                pushBoundary(boundary);
                return;
            }
            if (!allowDownwardScrollPredicate()) {
                return false;
            }
            pushBoundary(boundary);
            (successfulDownFn || $.noop).call();
        };
    }
    function registerBoundaries() {
        scrollBoundaryManager
            .unregisterAllBoundaries()
            .registerBoundary(
                Constants.Boundaries.PICK_TO_PERSONALIZE,
                createOnBoundaryHandler(
                    Constants.Boundaries.PICK_TO_PERSONALIZE,
                    function() {
                        return order.cheesecakes.isFull();
                    },
                    function() {
                        personalizeManager.displayPickedCheesecakesInfo();
                    }
                )
            )
            .registerBoundary(
                Constants.Boundaries.PERSONALIZE_TO_PACK,
                createOnBoundaryHandler(
                    Constants.Boundaries.PERSONALIZE_TO_PACK,
                    function() {
                        return personalizeManager.isEdited();
                    }
                )
            )
            .registerBoundary(
                Constants.Boundaries.PACK_TO_PAY,
                createOnBoundaryHandler(
                    Constants.Boundaries.PACK_TO_PAY,
                    function() {
                        return packManager.isValid();
                    },
                    function() {
                        payManager.displayOrderSummary();
                    }
                )
            )
            .registerBoundary(
                Constants.Boundaries.PAY_TO_ORDER_COMPLETE,
                createOnBoundaryHandler(
                    Constants.Boundaries.PAY_TO_ORDER_COMPLETE,
                    function() {
                        return payManager.isPaymentComplete();
                    },
                    function() {
                        orderCompleteManager.refreshSummaryFields();
                    }
                )
            );
    }
    registerBoundaries();

    $(window)
        .resize(function(e) {
            // Update viewport functions on resize;
            Utils._previousViewportHeight = Utils._viewportHeight;
            Utils._viewportHeight = $(window).height();

            // Reposition skrollr to account for size change
            S.setScrollTop(S.getScrollTop() * Utils.getViewportHeight() / Utils.getPreviousViewportHeight(), true);

            registerBoundaries();
        })
        .unload(function() {
            return !payManager.isPaymentComplete() && store.set('incompleteOrder', order.toString());
        });

    $('body').show();

    function pushBoundary(boundary) {
        history.pushState(null, null, '#' + boundary.friendlyName);
    }
})();