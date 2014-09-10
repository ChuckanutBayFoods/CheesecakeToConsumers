/**
 * Provides cheesecake flavor data from the backend.
 */
app.factory('flavorsFactory', ['$http', '$q', 'URLS', 'Flavors', function($http, $q, URLS, Flavors) {

    // Immediately load the flavors
    var promise = $http.get(URLS.PRODUCT.GET_DUMP);

    var flavorsFactory = {};

    /**
     * Gets all of the flavors from the backend.
     * @returns {Promise}
     */
    flavorsFactory.getAllFlavors = function() {
        var deferred = $q.defer();
        promise.then(function(response) {
            deferred.resolve(new Flavors(response.data));
        }, deferred.reject);
        return deferred.promise;
    };

    return flavorsFactory;
}]);