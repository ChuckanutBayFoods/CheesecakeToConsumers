package cheesecaketoconsumers

/**
 * Controller for redirecting to the homepage.
 */
class HomeController {
	
	def index() {
		redirect(url: "/html/index.html");
	}
}
