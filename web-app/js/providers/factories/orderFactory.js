app.factory('orderFactory', ['$rootScope', function($rootScope) {
    $rootScope.order = {
        cheesecakes : [],
        giftMessage : [
            'Grandma Jane,',
            '',
            'Happy 83rd birthday!  Thank you for another year of fun, joy, and love.  We hope you enjoy this all natural delicious dessert!',
            '',
            'With much love,',
            'Jack and Jill'
        ].join('\n'),

    };

    var orderFactory = {
        addCheesecake : function(flavor) {
            var cheesecakes = $rootScope.order.cheesecakes;
            for(var i = 0; i < 8; i++) {
                if (!cheesecakes[i]) {
                    cheesecakes[i] = flavor;
                    return i;
                }
            }
            return false;
        },

        numOpenCheesecakeSlots : function() {
            var openSlots = 0;
            for(var i = 0; i < 8; i++) {
                if (!$rootScope.order.cheesecakes[i]) {
                    openSlots++;
                }
            }
            return openSlots;
        }
    };

    return orderFactory;
}]);