// https://www.google.com/analytics/web/#management/Settings/a46807185w77934287p80581653/%3Fm.page%3DTrackingCode/
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create
ga('create', 'UA-46807185-1', {
	// https://developers.google.com/analytics/devguides/collection/analyticsjs/domains#auto
	// https://developers.google.com/analytics/devguides/collection/analyticsjs/domains#localhost
	'cookieDomain': window.location.hostname == 'localhost' ? 'none' : 'auto',
	'sampleRate': 100,
	'siteSpeedSampleRate': 100
});