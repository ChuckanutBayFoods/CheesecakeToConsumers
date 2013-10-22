package cheesecaketoconsumers

import grails.util.Environment


/**
 * Controller for homepage.
 */
class HomeController {
	
	def index() {
		if (Environment.current == Environment.PRODUCTION) {
			log.info(params)
			if (!(params.passCode =~ "betaTest")) {
				render("Coming soon.  Check back in 1 week.")
				return
			}
		}
		render(view: "index")
	}
	
	def customerService() {
		log.info("Redirecting to Customer Service page.")
		redirect(url:"https://docs.google.com/document/d/1rpM6SlmaFaOuESQtR2MB_H-aOR1sp6hsS6iyd0x7UT8/edit?pli=1")
	}

}
