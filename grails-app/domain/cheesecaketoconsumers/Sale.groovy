package cheesecaketoconsumers

import groovy.transform.ToString

@ToString
class Sale {

    static constraints = {
		giver unique : true
		recipient unique : true
		giftMessage maxSize : 350
		arrivalDate maxSize : 10
    }
	Date dateCreated
	static hasOne = [
		giver : Giver,
		recipient : Recipient
	]
	static hasMany = [saleItems : SaleItem]
	String giftMessage
	String arrivalDate
}
