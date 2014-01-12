/**
 * Responsible for dispatching metrics to Google Analytics.
 * @constructor
 */
MetricReporter = function(dispatcher) {
	this._dispatcher = dispatcher;

	this._dispatcher.on({
		'reachednewsection' : this._onReachedNewSection,
		'clickedbutton' : this._onClickedButton,
	}, this);
};

_.extend(MetricReporter.prototype, {
	_onReachedNewSection : function(sectionName) {
		// All GA traffic will use this page until it changes.
		ga('set', 'page', '/' + sectionName);
		ga('send', 'pageview');
	},

	/**
	 * @param  {jQuery.Event} jQueryEvent
	 */
	_onClickedButton : function(jQueryEvent) {
		// https://developers.google.com/analytics/devguides/collection/analyticsjs/events
		ga('send', {
			'hitType': 'event',          // Required.
			'eventCategory': 'button',   // Required.
			'eventAction': 'click',      // Required.
			'eventLabel': jQueryEvent.target.innerHTML,
			'eventValue': 1
		});
	}
});