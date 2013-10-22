
// http://grails-plugins.github.io/grails-quartz/guide/configuration.html
// http://docs.spring.io/spring/docs/2.5.x/api/org/springframework/scheduling/quartz/SchedulerFactoryBean.html
// http://quartz-scheduler.org/documentation/quartz-2.2.x/configuration/ConfigMain
quartz {
    autoStartup = true
    jdbcStore = false
}
environments {
	development {
		quartz {
			autoStartup = false
		}
	}
}
