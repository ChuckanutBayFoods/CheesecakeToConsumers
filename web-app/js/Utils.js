// Utility functions
Utils = {

    // Returns true if running on a mobile device
    // TODO: this function should be memoized.
    // Is there a library we can use to answer this?
    isMobile: function() {
        if (this._isMobile === undefined) {
            this._isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        }
        return this._isMobile;
    },

    getSetProp: function(name, value, context) {
        return (value && (context[name] = value) && context) || context[name];
    },

    // Gets the current height of the viewport
    getViewportHeight: function() {
        this._viewportHeight = this._viewportHeight || $(window).height();
        return this._viewportHeight;
    },

    // Gets the current height of each section
    getSectionHeight: function() {
        return this.getViewportHeight() * 2;
    },

    // Gets the height of the viewport prior to the most recent window resize
    getPreviousViewportHeight: function() {
        return this._previousViewportHeight;
    }
};