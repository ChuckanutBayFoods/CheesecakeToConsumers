grails.servlet.version = "2.5" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.target.level = 1.6
grails.project.source.level = 1.6
//grails.project.war.file = "target/${appName}-${appVersion}.war"

// uncomment (and adjust settings) to fork the JVM to isolate classpaths
//grails.project.fork = [
//   run: [maxMemory:1024, minMemory:64, debug:false, maxPerm:256]
//]

// Not using the cors plugin as adding the CORS headers via Apach.  See web-app/.ebextensions
// Use a local installation of cors that sets the Filter mapping ahead of the Resrouce filters.
// This way the CORS-related filters will get set.
// http://stackoverflow.com/questions/4435611/how-to-install-grails-plugin-from-source-code
//grails.plugin.location.cors = 'plugins/cors'

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // specify dependency exclusions here; for example, uncomment this to disable ehcache:
        // excludes 'ehcache'
    }
    log "error" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve
    legacyResolve false // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

    repositories {
        inherits true // Whether to inherit repository definitions from plugins

        grailsPlugins()
        grailsHome()
        grailsCentral()

        mavenLocal()
        mavenCentral()

        // uncomment these (or add new ones) to enable remote dependency resolution from public Maven repositories
        //mavenRepo "http://snapshots.repository.codehaus.org"
        //mavenRepo "http://repository.codehaus.org"
        //mavenRepo "http://download.java.net/maven/2/"
        //mavenRepo "http://repository.jboss.com/maven2/"
    }

	// http://grails.org/doc/latest/guide/conf.html#configurationsAndDependencies
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes e.g.

		runtime ('mysql:mysql-connector-java:5.1.26')
		
		// https://stripe.com/docs/libraries
		compile 'com.stripe:stripe-java:1.4.0'
		
    }

    plugins {
        runtime ":hibernate:$grailsVersion"
        
		// https://github.com/davidtinker/grails-cors
		// Currently commenting out since using a local version.
		// If this is left in, it will trump the local version.
		//runtime ":cors:1.1.1"
		
        runtime ":resources:1.2.1"

        runtime ":zipped-resources:1.0"
        runtime ":cached-resources:1.0"
		compile ":cache-headers:1.1.5"
        //runtime ":yui-minify-resources:0.1.5"

        build ":tomcat:$grailsVersion"
		
		// https://github.com/kenliu/grails-elastic-beanstalk
		build ":aws-elastic-beanstalk:0.2"

        runtime ":database-migration:1.3.2"

        compile ":cache:1.0.1"
		
		// http://grails.org/plugin/mail
		compile ":mail:1.0.1"
		
		// http://grails.org/plugin/quartz
		compile ":quartz:1.0-RC13"
		
		// https://github.com/dpcasady/compass-sass
		compile ":compass-sass:0.7"
		
    }
}
