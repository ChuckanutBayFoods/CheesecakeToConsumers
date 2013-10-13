package cheesecaketoconsumers

class EmailController {

    def index() { }
	
	def sendShipmentTrackingEmails() {
		SendShipmentTrackingEmailJob.triggerNow();
		render "Triggered Job"
	}
	
	/**
	 * @param sale
	 * @return whether the "thank you for your order email" was sent.
	 * All {@link Exception}s are caught and nothing is logged.
	 */
	static boolean sendThankYouForYourOrderEmail(Sale sale) {
		try {
			sendMail {
				to "${sale.giver.emailAddress}"
				from "givecheesecakes.com <customerservice@givecheesecakes.com>"
				subject "Thanks for your order!"
				text view: "/emails/thankYouForYourOrderText", model: [sale : sale, price : "\$50.00", customerServiceEmailAddress : "customerservice@givecheesecakes.com"]
			}
			return true
		} catch (Exception e) {
			return false
		}
	}
}
