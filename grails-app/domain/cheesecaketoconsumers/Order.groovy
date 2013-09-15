package cheesecaketoconsumers

class Order {
	Recipient recipient
	static hasMany = [cheesecakes:Cheesecake]
	String arrivalDate
	String giftMessage
}
