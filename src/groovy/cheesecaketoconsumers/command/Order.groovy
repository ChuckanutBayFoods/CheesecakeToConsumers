package cheesecaketoconsumers

import grails.validation.Validateable;
import groovy.transform.ToString;

@ToString
@Validateable
class Order {
	Recipient recipient
	List<Cheesecake> cheesecakes;
	String arrivalDate
	String giftMessage
}
