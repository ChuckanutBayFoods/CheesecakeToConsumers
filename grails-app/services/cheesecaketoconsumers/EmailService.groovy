package cheesecaketoconsumers


class EmailService {

    /**
	 * @param sale {@link Sale} to send a "thank you for your order" email for.
	 * @param log {@link Log} to use for logging any errors.
	 * @return whether the "thank you for your order email" was sent.
	 * All {@link Exception}s are caught and nothing is logged.
	 */
	boolean sendThankYouForYourOrderEmail(Sale sale) {
		log.debug("Sending 'thanks for your order' email to ${sale.giver.emailAddress} for ${sale}")
		try {
			sendMail {
				to "${sale.giver.emailAddress}"
				from "givecheesecakes.com <customerservice@givecheesecakes.com>"
				subject "Thanks for your order!"
				text view: "/emails/thankYouForYourOrderText", model: [sale : sale, price : "\$50.00", customerServiceEmailAddress : "customerservice@givecheesecakes.com"]
			}
			return true
		} catch (Exception e) {
			log.error("Unable to send 'thanks for your order' email to ${sale.giver.emailAddress} for ${sale}", e)
			return false
		}
	}
	
	/**
	 * @param sale {@link Sale} to send a "thank you for your order" email for.
	 * @param log {@link Log} to use for logging any errors.
	 * @return whether the "thank you for your order email" was sent.
	 * All {@link Exception}s are caught and nothing is logged.
	 */
	boolean sendShipmentTrackingEmail(Sale sale) {
		log.debug("Sending 'shipment tracking' email to ${sale.giver.emailAddress} for ${sale}")
		try {
			sendMail {
				to "${sale.giver.emailAddress}"
				from "givecheesecakes.com <customerservice@givecheesecakes.com>"
				subject "Your cheesecakes have shipped!"
				text view: "/emails/thankYouForYourOrderText", model: [sale : sale, customerServiceEmailAddress : "customerservice@givecheesecakes.com"]
			}
			return true
		} catch (Exception e) {
			log.error("Unable to send 'shipment tracking' email to ${sale.giver.emailAddress} for ${sale}", e)
			return false
		}
	}
}
