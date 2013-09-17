package cheesecaketoconsumers

class SaleController {

    def index() { 
		render Sale.count();
	}
}
