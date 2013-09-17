package cheesecaketoconsumers

import grails.converters.JSON;

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
	
	// Create a custom object marshaller so that we avoid outputting "class" and so we incldue the image urls:
	// http://kylewbanks.com/post/show/Customizing-JSON-Grails-Object-Marshalling
	// http://compiledammit.com/2012/08/16/custom-json-marshalling-in-grails-done-right/
	// http://manbuildswebsite.com/2010/02/15/rendering-json-in-grails-part-3-customise-your-json-with-object-marshallers
	static {
		JSON.registerObjectMarshaller(Product) {
			return [
				id : it.id,
				isActive : it.isActive,
				name : it.name,
				description : it.description,
				allergens : it.allergens,
				ingredients : it.ingredients,
				isGlutenFree : it.isGlutenFree,
				isNoSugarAdded : it.isNoSugarAdded,
				stageImageUrl : it.stageImageUrl,
				bareImageUrl : it.bareImageUrl,
				nutritionLabelImageUrl : it.nutritionLabelImageUrl
			]
		}
	}
	
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
