package cheesecaketoconsumers

class Sale {

    static constraints = {
		recipient : unique : true
		giverEmailAddress maxSize : 256, email : true
		giftMessage maxSize : 350
		arrivalDate maxSize : 10
    }
	Date dateCreated
	static hasOne = [recipient : Recipient]
	static hasMany = [saleItems : SaleItem]
	String giverEmailAddress
	String giftMessage
	String arrivalDate
}
