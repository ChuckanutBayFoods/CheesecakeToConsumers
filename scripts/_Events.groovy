// Enable gzip compressions for non-static resources (e.g., /home/index)
// This only applies for the Tomcat instance that is fired up with grails run-app.
// One needs to follow a different set of steps for the Elastic Beanstalk Tomcat instance.
// http://www.slideshare.net/gr8conf/gr8conf-2011-tuning-grails-applications-by-peter-ledbrook
eventConfigureTomcat = {tomcat ->
	tomcat.connector.setAttribute("compression", "on")
	tomcat.connector.port = serverPort
}