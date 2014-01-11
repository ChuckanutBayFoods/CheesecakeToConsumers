/**
 * Defines sections on the page.
 * This class is useful for determining page boundaries.
 * @param {String} name Convenience id used for event names, maps, etc.
 * @param {Number} index Index on the page.
 */
Section = function(name, index) {
	this.name = name;
	this.index = index;
};

_.extend(Section, {
	/**
	 * Friendly identifier for each of the sections.
	 * This is what will show in the hash of the URL.
	 * These sections intentionally have a prefix.
	 * If not, the section names conflict with DOM id's on the page.
	 * If there is a conflict, the browser will autoscroll to that id,
	 * preventing us from using Skrollr to animate.
	 */
	Name : {
        PICK : 'sPick',
        PERSONALIZE : 'sPersonalize',
        PACK : 'sPack',
        PAY : 'sPay',
        ORDER_COMPLETE : 'sOrderComplete'
    }
});

// Convenience for getting all the Section.Names.
Section.NAMES = _.values(Section.Name);

_.extend(Section.prototype, {

	_getBaseOffset : function() {
		// Special case the first section where there is the header.
		return this.index === 0 ? $('header').height() : 0;
	},

	_getViewportHeight : function() {
		return Utils.getViewportHeight();
	},

	_getTransitionHeight : function() {
		return this._getViewportHeight();
	},

	_getSectionHeight : function() {
		return this._getViewportHeight() + this._getTransitionHeight();
	},

	getViewportTopPosition : function() {
		return this.getViewportBottomPosition() - this._getViewportHeight();
	},

	getViewportBottomPosition : function() {
		return this._getBaseOffset() + (this.index * this._getSectionHeight());
	},
});