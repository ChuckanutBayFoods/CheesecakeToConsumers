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
	}
	
	// See conf/BootStrap.groovy for the custom ObjectMarshaler when converting to JSON.
	
	String id
	boolean isActive = true
	String name
	String description
	String allergens
	String ingredients
	boolean isGlutenFree = false
	boolean isNoSugarAdded = false
	
	String getStageImageUrl() {
		return "http://givecheesecakes.com/productImages/${id}-stage.jpg"
	}
	
	String getBareImageUrl() {
		return "http://givecheesecakes.com/productImages/${id}-bare.jpg"
	}
	
	String getNutritionLabelImageUrl() {
		return "http://givecheesecakes.com/productImages/${id}-nutritionLabel.jpg"
	}
}
