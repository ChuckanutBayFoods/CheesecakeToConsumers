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
		id generator : 'assigned',
		   column: 'id', 
		   type: 'string'
	}
	
	String name
	String description
	String allergens
	String ingredients
}
