app.controller('pickController', ['$scope', 'orderFactory', function($scope, orderFactory) {
    $scope.addToBox = function() {
        orderFactory.addCheesecake($scope.flavors[0]);
    };

    $scope.isFull = function() {
        return orderFactory.numOpenCheesecakeSlots() === 0;
    }
}]);