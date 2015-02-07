app.directive('flavorCarouselItem', function() {
    return {
        restrict : 'E',
        replace : true,
        scope : {
            flavor : '=',
            sly : '='
        },
        link : function(scope, element, attrs) {
            scope.sly.reload();
        },
        template :
            '<li class="flavor">\
                <img class="gf-icon" ng-show="{{flavor.isGlutenFree}}" ng-src="../img/gluten-free-icon.png" />\
                <img ng-src="{{flavor.stageImageUrl}}"/>\
                <div class="flavor-label">{{flavor.name}}</div>\
            </li>'
    }
});