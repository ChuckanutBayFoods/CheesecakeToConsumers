/**
 * Contains properties of a particular cheesecake flavor.
 */
app.factory('Flavor', function() {

    /**
     * Applies all of the properties of the given object to the {@link Flavor}
     * @param {Object} rawData
     * @constructor
     */
    var Flavor = function(rawData) {
        _.extend(this, rawData);
    };

    return Flavor;
});