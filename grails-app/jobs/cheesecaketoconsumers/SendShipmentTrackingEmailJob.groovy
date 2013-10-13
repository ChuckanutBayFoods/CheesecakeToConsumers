package cheesecaketoconsumers



class SendShipmentTrackingEmailJob {
    static triggers = {
		// Execute job every 5 minutes indefinitely
		simple startDelay : 60 * 1000, repeatInterval: 5 * 60 * 1000, repeatCount: -1
    }

    def execute() {
        System.out.println("Executing!!!")
    }
}
