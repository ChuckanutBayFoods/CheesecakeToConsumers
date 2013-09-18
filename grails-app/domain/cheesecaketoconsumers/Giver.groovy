package cheesecaketoconsumers

class Giver {

    static constraints = {
		name maxSize : 128, blank:false
		emailAddress maxSize : 256, email : true
    }
	
	Sale sale;
	
	String name;
	String emailAddress;
}
