/**
 * Responsible for dispatching metrics to Google Analytics.
 * @constructor
 */
MetricReporter = function(dispatcher) {
	this._dispatcher = dispatcher;

	this._dispatcher.on({
		'reachednewsection' : this._onReachedNewSection
	}, this);
};

_.extend(MetricReporter.prototype, {
	_onReachedNewSection : function(sectionName) {
		// All GA traffic will use this page until it changes.
		ga('set', 'page', '/' + sectionName);
		ga('send', 'pageview');
	}
});