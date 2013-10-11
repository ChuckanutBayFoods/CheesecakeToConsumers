// http://grails-plugins.github.io/grails-quartz/guide/configuration.html
// http://docs.spring.io/spring/docs/2.5.x/api/org/springframework/scheduling/quartz/SchedulerFactoryBean.html
// http://quartz-scheduler.org/documentation/quartz-2.2.x/configuration/ConfigMain
quartz {
    autoStartup = true
    jdbcStore = false
    waitForJobsToCompleteOnShutdown = true
    exposeSchedulerInRepository = false

    props {
		// http://quartz-scheduler.org/documentation/best-practices
        scheduler.skipUpdateCheck = true
    }
}

environments {
    test {
        quartz {
            autoStartup = false
        }
    }
	development {
		quartz {
			autoStartup = false
		}
	}
}
