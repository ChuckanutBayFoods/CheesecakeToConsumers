/**
 * Provides cheesecake flavor data from the backend.
 */
app.factory('flavorsFactory', ['$http', '$rootScope', 'URLS', 'EVENTS', function($http, $rootScope, URLS, EVENTS) {
    $rootScope.flavors = [];

    var flavorsFactory = {
        getFlavorById : function(id) {
            return _.find($rootScope.flavors, { id : id });
        }
    };

    // Immediately load flavors
    $http.get(URLS.PRODUCT.GET_DUMP).then(function(response) {
        $rootScope.flavors = response.data;
    }, function(reason) {
        $rootScope.$broadcast(EVENTS.FLAVORS.LOAD_ERROR, reason);
    });

    return flavorsFactory;
}]);