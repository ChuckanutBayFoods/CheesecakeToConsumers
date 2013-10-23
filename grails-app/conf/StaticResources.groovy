import grails.util.Environment

def isProd = Environment.current == Environment.PRODUCTION;

modules = {
	core {
		defaultBundle 'common'
		resource url: 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.no-icons.min.css'
		resource url: 'css/site.css'
		resource url: 'css/keyframes.css', attrs:["data-skrollr-stylesheet":""]
		
		// jQuery - A webapp essential
		resource url: "https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"

		// jQuery.validate - A jQuery plugin for forms validation
		resource url: "https://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"

		// moment.js - For date processing and formatting
		resource url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.2.1/moment.min.js"

		// bootstrap.js - UI elements such as buttons and popovers
		resource url: "https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"

		// bootstrap-datepicker.js - A datepicker UI element from bootstrap
		resource url: "js/bootstrap-datepicker.js"

		// sly.js - Carousel UI element
		resource url: "js/sly.js"

		// strip.js - Credit-card and checkout processing
		resource url: "js/stripe.js"

		// skrollr.js - Parallax and Single-Page-App framework
		resource url: "js/skrollr.js"

		// skrollr-menu.js - Navigation support for skrollr
		resource url: "js/skrollr.menu.js"

		// skrollr-stylesheets.js - CSS support for skrollr
		resource url: "js/skrollr.stylesheets.js"

        // persist.js - For browser storage
        resource url: "js/persist.js"

		// Our own lovely js
		resource url: "js/site.js"
	}
}


// Work in progress.
// Attempting to see if can download files locally and use them instead.
def cacheAndGetLocalUrl(String url) {
	File tmpDir = new File(System.getProperty("java.io.tmpdir"));
	File outputFile = new File(tmpDir, url.replaceFirst("https?://", ""));
	println "Creating local file for ${url}.  Local file should be at ${outputFile}"
	if (outputFile.exists()) {
		println "Local file ${outputFile} already exists.  Returning."
		return outputFile.path; 
	}
	outputFile.getParentFile().mkdirs();
	def outputStream = new BufferedOutputStream(new FileOutputStream(outputFile))
	outputStream << new URL(url).openStream()
	outputStream.close()
	
	assert outputFile.length() > 0
	
	println "Created local file ${outputFile}." 
	
	return outputFile.path
}