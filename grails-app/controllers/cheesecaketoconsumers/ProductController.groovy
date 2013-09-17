package cheesecaketoconsumers

import grails.util.Environment

class ProductController {

	// http://grails.org/doc/latest/guide/scaffolding.html
	static scaffold = Environment.current != Environment.PRODUCTION
	
	def getDump() {
		render(contentType : "application/json") {
			Product.findAllByIsActive(true)
		}
	}
	
}
