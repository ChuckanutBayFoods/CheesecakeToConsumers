package cheesecaketoconsumers

import groovy.transform.ToString

@ToString
class Sale {

    static constraints = {
		giftMessage maxSize : 350
		arrivalDate maxSize : 10, blank : false
		stripeToken maxSize : 128, blank : false
		shippingMethod nullable : true
		shipmentTrackingNumber nullable : true
    }
	
	static mapping = {
		// As of 10/9/13, Steve hasn't found this to be effective with setting a starting increment value in MySQL.
		// This may be because the MySQL tables were originally created without this.
		// Have ids that don't start at 0.
		// http://grails.org/doc/2.2.x/ref/Database%20Mapping/id.html
		id generator : 'native', params : [initialValue : 5501]
	}
	
	Date dateCreated
	Giver giver
	Recipient recipient
	static hasMany = [saleItems : SaleItem]
	String giftMessage
	String arrivalDate
	String stripeToken
	boolean wasChargeConfirmed = false
	boolean wasConfirmationEmailSent = false
	ShippingMethod shippingMethod = null
	String shipmentTrackingNumber = null
	boolean wasShipmentTrackingEmailSent = false 
	
	String getCustomerFriendlyArrivalDate() {
		Date parsedArrivalDate = Date.parse("yyyyMMdd", arrivalDate)
		return parsedArrivalDate.format("EEEE, MMMM d, yyyy");
	}
}
