/**
 * A collection of {@link Flavor}s. Provides utility functions for working with cheesecake flavors.
 */
app.factory('Flavors', ['Flavor', function(Flavor) {

    /**
     * Creates the {@link Flavors} object from the given array of flavors.
     * @param {Array} rawData An array of objects that can be mapped to {@link Flavors}
     * @constructor
     */
    var Flavors = function(rawData) {
        this._flavors = [];
        _.each(rawData, function(flavorData) {
            this._flavors.push(new Flavor(flavorData));
        }, this);
    };

    /**
     * @returns {Array} All of the {@link Flavor}s
     */
    Flavors.prototype.getAll = function() {
        return this._flavors;
    };

    /**
     * Finds the {@link Flavor} with the given id.
     * @param {Number} id The {@link Flavor} id to match on.
     * @returns {Flavor} The matching {@link Flavor}, or undefined if no {@link Flavor} could be found.
     */
    Flavors.prototype.getFlavorById = function(id) {
        return _.find(this._flavors, { id : id });
    };

    return Flavors;
}]);