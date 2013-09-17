package cheesecaketoconsumers

import java.awt.event.ItemEvent;

import javax.media.j3d.EnvironmentSet;

import grails.converters.JSON;
import grails.util.Environment;

import org.springframework.dao.DataIntegrityViolationException

import com.sun.org.apache.bcel.internal.generic.RETURN;

class ProductController {

	// http://grails.org/doc/latest/guide/scaffolding.html
	static scaffold = Environment.current != Environment.PRODUCTION
		
	def getDump() {
		render(contentType : "application/json") {
			Product.findAllByIsActive(true)
		}
	}
	
}
