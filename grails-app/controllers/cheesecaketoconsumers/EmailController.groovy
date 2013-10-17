package cheesecaketoconsumers


class EmailController {

    def index() { }
	
	def sendShipmentTrackingEmails() {
		SendShipmentTrackingEmailJob.triggerNow();
		render "Triggered Job"
	}

}
