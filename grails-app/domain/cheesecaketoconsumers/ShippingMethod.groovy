package cheesecaketoconsumers


class ShippingMethod {

    static constraints = {
		name maxSize : 128, blank:false
    }
	
	String name
	
}
