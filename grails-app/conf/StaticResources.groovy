import grails.util.Environment

import java.nio.file.Files

def isProd = Environment.current == Environment.PRODUCTION;

modules = {
	core {
		defaultBundle 'common'
		
		resource url: cacheAndGetLocalUrl(
			"css", getUrl(
				"http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.no-icons.min.css", 
				""))
		
		resource url: cacheAndGetLocalUrl(
			"css", getUrl(
				"http://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.2.0/css/datepicker.min.css",
				"http://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.2.0/css/datepicker.css"))
		
		resource url: 'css/site.css'
		resource url: 'css/keyframes.css', attrs:["data-skrollr-stylesheet":""]
		
		// jQuery - A webapp essential
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"http://code.jquery.com/jquery-2.0.3.min.js", 
				"http://code.jquery.com/jquery-2.0.3.js"))

		// jQuery.validate - A jQuery plugin for forms validation
		// http://jqueryvalidation.org/
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"http://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js", 
				"http://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.js"))

		// moment.js - For date processing and formatting
		// http://momentjs.com/
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.4.0/moment.min.js", 
				"http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.4.0/moment.js"))

		// bootstrap.js - UI elements such as buttons and popovers
		// http://getbootstrap.com/2.3.2/
		// We should upgrade to 3.x
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js",
				"http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.js"))

		// bootstrap-datepicker.js - A datepicker UI element from bootstrap
		// https://github.com/eternicode/bootstrap-datepicker
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"http://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.2.0/js/bootstrap-datepicker.min.js",
				"http://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.2.0/js/bootstrap-datepicker.js"))
		

		// sly.js - Carousel UI element
		// http://darsa.in/sly
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"https://github.com/Darsain/sly/raw/v1.2.0/dist/sly.min.js",
				"https://github.com/Darsain/sly/raw/v1.2.0/dist/sly.js"))

		// stripe.js - Credit-card and checkout processing
		// https://stripe.com/docs/tutorials/forms
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"https://js.stripe.com/v2",
				""))

		// skrollr.js - Parallax and Single-Page-App framework
		// https://github.com/Prinzhorn/skrollr
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"https://github.com/Prinzhorn/skrollr/raw/0.6.17/dist/skrollr.min.js",
				"https://github.com/Prinzhorn/skrollr/raw/0.6.17/src/skrollr.js"))

		// skrollr-menu.js - Navigation support for skrollr
		// https://github.com/Prinzhorn/skrollr-menu
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"https://github.com/Prinzhorn/skrollr-menu/raw/0.1.8/dist/skrollr.menu.min.js",
				"https://github.com/Prinzhorn/skrollr-menu/raw/0.1.8/src/skrollr.menu.js"))

		// skrollr-stylesheets.js - CSS support for skrollr
		// https://github.com/Prinzhorn/skrollr-stylesheets
		resource url: cacheAndGetLocalUrl(
			"js", getUrl(
				"https://github.com/Prinzhorn/skrollr-stylesheets/raw/0.0.4/dist/skrollr.stylesheets.min.js",
				"https://github.com/Prinzhorn/skrollr-stylesheets/raw/0.0.4/src/skrollr.stylesheets.js"))

        // persist.js - For browser storage
		// TODO: strip this out
        resource url: "js/persist.js"

		// Our own lovely js
		resource url: "js/site.js"
	}
}


/**
 * Downloads the file from the provided URL and caches it locally.
 * There are multiple levels of caching.
 * If a file doesn't exist in the local web-app, then we look to see if it is in the tmp directory.
 * If it's not in the tmp directory, we download it to the tmp directory, and the copy it to the web-app.
 * As a result, if you downloaded a bum file, it needs to be deleted from both the tmp directory and the web-app.
 * This functionality was added since the Resources plugin won't inline external resources.
 * A jira was opened about this.
 * @param type Should either be "js" or "css"
 * @param url Url of the file to download.
 * @return path string of the local file for the provided URL.
 * @see "http://jira.grails.org/browse/GPRESOURCES-234"
 */
String cacheAndGetLocalUrl(String type, String url) {
	// http://stackoverflow.com/a/14136896
	File webAppDir = grailsApplication.mainContext.getResource("/").getFile()
	String outputFilePath = "${type}/externalDownloads/" + url.replaceFirst("https?://", "")
	// The resource plugin requires that the suffix be js or css.
	// We need to add it for the Stripe case.
	if (!(outputFilePath =~ ".${type}\$")) {
		outputFilePath += ".${type}"
	}
	File outputFile = new File(webAppDir, outputFilePath);
	println "Caching and getting local file for ${url}.  Local file should be at ${outputFile.absolutePath}"
	if (outputFile.exists()) {
		println "Local file ${outputFile.absolutePath} already exists.  Returning."
		return outputFilePath; 
	}
	outputFile.getParentFile().mkdirs();
	
	File tmpDir = new File(System.getProperty("java.io.tmpdir"));
	File tmpFile = new File(tmpDir, outputFilePath);
	if (!tmpFile.exists()) {
		println "Downloading ${url} to ${tmpFile}"
		tmpFile.getParentFile().mkdirs();
		def tmpStream = new BufferedOutputStream(new FileOutputStream(tmpFile))
		tmpStream << "// Downloaded from ${url}\n"
		// Download file from URL and remove the source mappings.
		// This way browsers won't request a sourceMapping file that doesn't exist on the server.
		// As of 11/2/13, this is mainly just application for jQuery.
		tmpStream << new URL(url).openStream().filterLine({ it ->
			!(it =~ "sourceMappingURL=")
		})
		tmpStream.close()
		assert tmpFile.length() > 0
	}
	println "Copying ${tmpFile} to ${outputFile}"
	Files.copy(tmpFile.toPath(), outputFile.toPath())
	
	println "Created local file ${outputFile.absolutePath}." 
	
	return outputFilePath
}

/**
 * @param minifiedUrl The URL that should be used for production.
 * @param debugUrl The URL that should be used during development.  This is optional.
 * @return One of the two URLs based on the environment and whether the debugUrl was specified.
 */
String getUrl(String minifiedUrl, String debugUrl) {
	if (Environment.current != Environment.PRODUCTION && debugUrl) {
		return debugUrl
	}
	return minifiedUrl
}