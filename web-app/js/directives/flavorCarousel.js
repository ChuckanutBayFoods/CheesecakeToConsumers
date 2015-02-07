app.directive('flavorCarousel', function() {
    return {
        restrict : 'E',
        replace : true,
        scope : {
            flavors : '='
        },
        controller : function($scope) {
            $scope.$watch('flavors', function() {
                $scope.sly.reload();
            });
        },
        link : function(scope, element, attrs) {

            // Call Sly on frame
            scope.sly = new Sly('.well', {
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
                easing: 'easeOutExpo',
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1,

                // Buttons
                prev: element.find('.arrow-right'),
                next: element.find('.arrow-left')
            });

            skrollr.get().refresh();
        },
        template :
            '<div class="flavor-carousel">\
                <div class="arrow-left"></div>\
                <div class="arrow-right"></div>\
                <div class="well">\
                    <ul class="scroll">\
                        <flavor-carousel-item ng-repeat="flavor in flavors" flavor="flavor" sly="sly"></flavor-carousel-item>\
                    </ul>\
                </div>\
                <div class="carrot-container">\
                    <div class="outer-carrot"></div>\
                    <div class="inner-carrot"></div>\
                </div>\
                <div id="hidden-image-loading-container" ng-hide="true"></div>\
            </div>'
    }
});