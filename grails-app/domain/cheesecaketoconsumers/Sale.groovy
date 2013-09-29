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
}
