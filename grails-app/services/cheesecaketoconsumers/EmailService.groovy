package cheesecaketoconsumers


class EmailService {
	
	private static final String MAIL_FROM_ADDRESS = "givecheesecakes.com <customerservice@givecheesecakes.com>"
	private static final String CUSTOMER_SERVICE_EMAIL_ADDRESS = "customerservice@givecheesecakes.com"
	
    /**
	 * @param sale {@link Sale} to send a "thank you for your order" email for.
	 * @param log {@link Log} to use for logging any errors.
	 * @return whether the "thank you for your order" email was sent.
	 * All {@link Exception}s are caught and logged.
	 */
	boolean sendThankYouForYourOrderEmail(Sale sale) {
		log.debug("Sending 'thanks for your order' email to ${sale.giver.emailAddress} for ${sale}")
		try {
			sendMail {
				to "${sale.giver.emailAddress}"
				from MAIL_FROM_ADDRESS
				subject "Thanks for your order!"
				text view: "/emails/thankYouForYourOrderText", model: [sale : sale, price : "\$50.00", customerServiceEmailAddress : CUSTOMER_SERVICE_EMAIL_ADDRESS]
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
	 * @return whether the "your order has shipped" email was sent.
	 * All {@link Exception}s are caught and logged.
	 */
	boolean sendShipmentTrackingEmail(Sale sale) {
		log.debug("Sending 'shipment tracking' email to ${sale.giver.emailAddress} for ${sale}")
		try {
			sendMail {
				to "${sale.giver.emailAddress}"
				from MAIL_FROM_ADDRESS
				subject "Your cheesecakes have shipped!"
				text view: "/emails/yourOrderHasShippedText", model: [sale : sale, customerServiceEmailAddress : CUSTOMER_SERVICE_EMAIL_ADDRESS]
			}
			return true
		} catch (Exception e) {
			log.error("Unable to send 'shipment tracking' email to ${sale.giver.emailAddress} for ${sale}", e)
			return false
		}
	}
}
