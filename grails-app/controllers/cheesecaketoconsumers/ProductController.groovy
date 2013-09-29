package cheesecaketoconsumers


class ProductController {

	// http://grails.org/doc/latest/guide/scaffolding.html
	static scaffold = false // Environment.current != Environment.PRODUCTION
	
	def getDump() {
		render(contentType : "application/json") {
			Product.findAllByIsActive(true)
		}
	}
	
}
