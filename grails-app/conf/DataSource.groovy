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
	production {
		// http://flnkr.com/2013/07/grails-on-aws/
		dataSource {
			username = "masterchuck"
			password = "chuck1mysql"
			pooled = true
			dbCreate = "update"
			driverClassName = "com.mysql.jdbc.Driver"
			url = "jdbc:mysql://aa19q4s9c37s6ze.cfs7tnw9etj0.us-east-1.rds.amazonaws.com:3306/ebdb?user=masterchuck&password=chuck1mysql"
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
