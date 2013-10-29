package cheesecaketoconsumers

class Recipient {

    static constraints = {
		name maxSize : 128, blank: false
		companyName maxSize : 128, nullable: true
		addressLine1 maxSize : 128, blank: false
		addressLine2 maxSize : 128, nullable: true
		city maxSize : 128, blank:false
		state size: 2..2
		zipCode size: 5..5
		phoneNumber maxSize : 10
    }
	
	String name
	String companyName
	String addressLine1
	String addressLine2
	String city
	String state
	String zipCode
	String phoneNumber
	
}
