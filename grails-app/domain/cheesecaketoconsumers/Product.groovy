package cheesecaketoconsumers


class Product {

    static constraints = {
		id size : 6..7
		name maxSize : 128, blank:false
		description maxSize : 1024, blank:false
		name maxSize : 256, blank:false
		name maxSize : 1024, blank:false
    }
	
	static mapping = {
		// Enable using Chuckanut's #####-# format
		// http://stackoverflow.com/questions/8856336/changing-primary-key-id-to-string-type-in-grails
		id column: 'id', generator : 'assigned'
		
		// http://grails.org/doc/latest/guide/GORM.html#eventsAutoTimestamping
		autoTimestamp true
	}
	
	// See conf/BootStrap.groovy for the custom ObjectMarshaler when converting to JSON.
	
	String id
	Date lastUpdated
	boolean isActive = true
	String name
	String description
	String allergens
	String ingredients
	boolean isGlutenFree = false
	boolean isNoSugarAdded = false
	
	String getStageImageUrl() {
		return getImageUrl("stage")
	}
	
	String getBareImageUrl() {
		return getImageUrl("bare")
	}
	
	String getNutritionLabelImageUrl() {
		return getImageUrl("nutritionLabel")
	}
	
	private String getImageUrl(String imageType) {
		// We don't use resources.givecheeseackes.com because we need to serve over https in production,
		// and we'd need to buy another SSL certificate for that domain.
		return "https://d1z9tzwlpwyvx2.cloudfront.net/productImages/${imageType}/${id}.png?lastUpdate=${lastUpdated}"
	}
}
