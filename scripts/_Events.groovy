// Enable gzip compressions for non-static resources (e.g., /home/index)
// http://www.slideshare.net/gr8conf/gr8conf-2011-tuning-grails-applications-by-peter-ledbrook
eventConfigureTomcat = {tomcat ->
	tomcat.connector.setAttribute("compression", "on")
	tomcat.connector.port = serverPort
}