package cheesecaketoconsumers

import grails.validation.Validateable;
import groovy.transform.ToString;

@ToString
@Validateable
class Recipient {
	String name
	String addressLine1
	String addressLine2
	String city
	String state
	String zipCode
	String phoneNumber
}
