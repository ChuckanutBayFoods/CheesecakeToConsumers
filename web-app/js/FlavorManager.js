FlavorManager = function() {
    var flavors;

    this.loadFlavors = function(callback) {
        if (flavors) {
            callback(flavors);
        } else {
            $.get(Constants.Urls.PRODUCT_GET_DUMP).done(function (result) {
                flavors = result;
                callback(flavors);
            });
        }
        return this;
    };

    this.getAllFlavors = function() {
        return flavors;
    };


    this.getFlavorById = function(id) {
        var flavor;
        $.each(flavors, function(i, v) {
            if (v.id === id) {
                flavor = v;
                return false;
            }
        });
        return flavor;
    };
};