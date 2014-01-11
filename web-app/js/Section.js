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
		WELCOME : 'sWelcome',
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
		// BaseOffset concept isn't currently needed because the header is part of the welcome section.
		// We're keeping this abstraction around in case it's needed in the future.
		return 0;
	},

	_getViewportHeight : function() {
		return Utils.getViewportHeight();
	},

	_getTransitionHeight : function() {
		// Special case the first section where there the welcome screen doesn't have transition height.
		return this.index === 0 ? 0 : this._getViewportHeight();
	},

	_getSectionHeight : function() {
		return this._getViewportHeight() + this._getTransitionHeight();
	},

	/**
	 * @return {Number} Scroll top position so that the top of this section is at the top of the viewport.
	 */
	getViewportTopPosition : function() {
		// When doing the calculation, we have to account for how the welcome screen has a non-standard height.
		return this.index === 0 ? 0 : this._getBaseOffset() + (this.index * this._getSectionHeight()) - this._getViewportHeight();
	},

	/**
	 * @return {Number} Scroll top position so that the bottom of this section is at the bottom of the viewport.
	 */
	getViewportBottomPosition : function() {
		// Our keyframes are based on percentages, which means we can't have min-height for our sections.
		// As a result, the section will always be the height of the viewport.
		// When we are ever able to set min-height, then this logic can be expanded.
		return this.getViewportTopPosition();
	},
});