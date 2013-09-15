package cheesecaketoconsumers

import grails.validation.Validateable;
import groovy.transform.ToString;

import java.awt.TexturePaintContext.Int;

@ToString
@Validateable
class Cheesecake {	
	String id
	int quantity
}
