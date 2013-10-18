package cheesecaketoconsumers




class SendShipmentTrackingEmailJob {
    static triggers = {
		// Execute job every 5 minutes indefinitely
		simple startDelay : 60 * 1000, repeatInterval: 5 * 60 * 1000, repeatCount: -1
    }
	
	EmailService emailService
	
	// http://grails-plugins.github.io/grails-quartz/guide/configuration.html
	def concurrent = false

    def execute() {
        System.out.println("Executing!!!")
		List<Sale> sales = Sale.findAll {
			wasShipmentTrackingEmailSent == false &&
			shippingMethod != null &&
			shipmentTrackingNumber != null
		}
		log.debug("${sales.size} sales found with shipment tracking number but no shipment tracking email sent.")
		sales.each({
			if (emailService.sendShipmentTrackingEmail(it)) {
				it.wasShipmentTrackingEmailSent = true
			}
		})
    }
}
