package cheesecaketoconsumers

class Giver {

    static constraints = {
		name maxSize : 128, blank:false
		emailAddress maxSize : 256, email : true
    }
	
	String name;
	String emailAddress;
}
