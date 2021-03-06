(function main() {
    var order = new Order();

    var dispatcher = _.clone(Backbone.Events);
    // Useful for debugging!
    // dispatcher.on('all', function() {
    //     console.log(arguments);
    // });
    new MetricReporter(dispatcher);

    // Initialize welcome carousel
    $('#welcome-carousel').carousel();

    var dispatchNavigateToNextSection = function() {
        dispatcher.trigger('navigatetonextsection');
    };
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
        dispatchNavigateToNextSection
    );

    var personalizeManager = new PersonalizeManager(
        {
            main: '#gift-message'
        },
        order,
        dispatchNavigateToNextSection
    );

    var packManager = new PackManager(
        {
            main: '#label form'
        },
        order,
        dispatchNavigateToNextSection
    );

    var payManager = new PayManager(
        {
            payForm: '#checkout-window form',
            checkoutWindow: '#checkout-window'
        },
        order,
        function() {
            pickManager.disable();
            personalizeManager.disable();
            packManager.disable();
            payManager.disable();
            dispatchNavigateToNextSection();
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
    S.setScrollTop(0);

    var router = new Router(dispatcher);
    var scrollBoundaryManager = new ScrollBoundaryManager(S, dispatcher, router);
    window.scrollBoundaryManager = scrollBoundaryManager; // for debugging

    /**
     * Creates "boundary handlers" for the ScrollBoundaryManager events.
     * @param  {String} sectionName
     * @param  {Function} allowDownwardScrollPredicate function that should return true if we're allowed to progress past this boundary.
     * @param  {Function} successfulDownFn function to invoke if successfully advanced past the boundary.
     * @return {Function}
     */
    function createOnBoundaryHandler(sectionName, allowDownwardScrollPredicate, successfulDownFn) {
        dispatcher.on('beforescrollpastboundary', function(context) {
            if (context.fromSection.name != sectionName || context.direction != 'down' || !context.allowScroll) {
                return;
            }
            context.allowScroll = allowDownwardScrollPredicate();
        });
        if (successfulDownFn) {
            dispatcher.on('scrolledpastboundary', function(context) {
                if (context.fromSection.name != sectionName || context.direction != 'down') {
                    return;
                } 
                successfulDownFn.call();
            });
        }
    };
    createOnBoundaryHandler(
        Section.Name.PICK, 
        function() {
            return order.cheesecakes.isFull();
        },
        function() {
            personalizeManager.displayPickedCheesecakesInfo();
        }
    );
    createOnBoundaryHandler(
        Section.Name.PERSONALIZE,
        function() {
            return personalizeManager.isEdited();
        }
    );
    createOnBoundaryHandler(
        Section.Name.PACK,
        function() {
            return packManager.isValid();
        },
        function() {
            payManager.displayOrderSummary();
        }
    );
    createOnBoundaryHandler(
        Section.Name.PAY,
        function() {
            return payManager.isPaymentComplete();
        },
        function() {
            orderCompleteManager.refreshSummaryFields();
        }
    );

    // We aren't using pushState because with Backbone it doesn't update the hash.
    // As a result, you end up losing the query string (annoying for development/debugging),
    // and refreshes will go to "/pick" (for example), which we don't have backend/Grails support for currently.
    var definedRouteMatchesTheCurrentUrl = Backbone.history.start();
    if (!definedRouteMatchesTheCurrentUrl) {
        router.navigate(
            Section.NAMES[0], 
            {
                replace : true, 
                trigger : true
            }
        );
    }

    var navigationView = new NavigationView({
        el : $('#nav-container'),
        router : router
    });
    $('body').show();
    $('.btn').on('click', function(jQueryEvent) {
        dispatcher.trigger('clickedbutton', jQueryEvent);
    });
})();