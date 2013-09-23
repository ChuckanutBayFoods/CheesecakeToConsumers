dataSource {
	pooled = true
	driverClassName = "org.h2.Driver"
	username = "sa"
	password = ""
}
hibernate {
	cache.use_second_level_cache = true
	cache.use_query_cache = false
	cache.region.factory_class = 'net.sf.ehcache.hibernate.EhCacheRegionFactory'
}
// environment specific settings
environments {
	development {
		dataSource {
			dbCreate = "create-drop" // one of 'create', 'create-drop', 'update', 'validate', ''
			url = "jdbc:h2:mem:devDb;MVCC=TRUE;LOCK_TIMEOUT=10000"
		}
	}
	test {
		dataSource {
			dbCreate = "update"
			url = "jdbc:h2:mem:testDb;MVCC=TRUE;LOCK_TIMEOUT=10000"
		}
	}
	// Use development if want to hit the prod DB from your personal machine.
	//development {
	production {
		// http://flnkr.com/2013/07/grails-on-aws/
		// https://console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/configuration?applicationName=givecheesecakes.com&environmentId=e-s6cnnk2wah&edit=container
		dataSource {
			username = System.getProperty("JDBC_USERNAME", "jdbcUsernameNotSet")
			password = System.getProperty("JDBC_PASSWORD", "jdbcPasswordNotSet")
			pooled = true
			dbCreate = "update"
			driverClassName = "com.mysql.jdbc.Driver"
			url = System.getProperty("JDBC_CONNECTION_STRING", "jdbcConntectionStringNotSet")
			dialect = org.hibernate.dialect.MySQL5InnoDBDialect
			properties {
				validationQuery = "SELECT 1"
				testOnBorrow = true
				testOnReturn = true
				testWhileIdle = true
				timeBetweenEvictionRunsMillis = 1000 * 60 * 30
				numTestsPerEvictionRun = 3
				minEvictableIdleTimeMillis = 1000 * 60 * 30
			}
		}
	}
}
