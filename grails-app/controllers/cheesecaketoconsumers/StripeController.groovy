package cheesecaketoconsumers

import com.stripe.Stripe
import com.stripe.exception.APIConnectionException
import com.stripe.exception.APIException
import com.stripe.exception.AuthenticationException
import com.stripe.exception.CardException
import com.stripe.exception.InvalidRequestException
import com.stripe.model.Charge


/**
 * Controller for persisting a {@link Sale} and making a charge to the customer's credit card via Stripe.
 */
class StripeController {

	private static final PUBLISHABLE_KEY;
	static {
		// https://console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/configuration?applicationName=givecheesecakes.com&environmentId=e-s6cnnk2wah&edit=container
		// https://manage.stripe.com/account
		// Defaults to our test secret key
		Stripe.apiKey = System.getProperty("STRIPE_USE_LIVE") == "true" ? System.getProperty("STRIPE_LIVE_SECRET_KEY") : "sk_test_Y0jk7VaFIDLqxXdOvf3gLLLa";
		Stripe.apiVersion = "2013-08-13"
		
		PUBLISHABLE_KEY = System.getProperty("STRIPE_USE_LIVE") == "true" ? "pk_live_h0i3a6TYJx4iK0zE6CyAITLh" : "pk_test_J460WxCY0NPbCGolQQDc19gx";
	}
	
	EmailService emailService;
	
	def getPublishableKey() {
		render PUBLISHABLE_KEY
	}
	
	def charge() {
		log.debug("Received sale ${request.JSON.sale}")
		Charge charge
		def result = [
			paid : false,
			backendFailure : true,
			wasConfirmationEmailSent : false
		]
		
		// Ensure the DB entities are able to persist before engaging Stripe
		Giver giver = new Giver(request.JSON.sale.giver)
		if (!saveDomainObject(giver, false, result)) {
			return
		}
		Recipient recipient = new Recipient(request.JSON.sale.recipient)
		if (!saveDomainObject(recipient, false, result)) {
			return
		}
		Sale sale = new Sale(request.JSON.sale)
		sale.properties = [
			giver : giver,
			recipient : recipient,
			saleItems : request.JSON.sale.saleItems.collect{
				new SaleItem([
					sale : sale,
					quantity : it.quantity,
					product : Product.read(it.product.id)
				])
			},
			wasChargeConfirmed : false
		]
		if (!saveDomainObject(sale, true, result)) {
			return
		}
		
		try {
			String description = "Giver: ${sale.giver.name}/${sale.giver.emailAddress}; Recipient: ${sale.recipient.name}; Items: "
			description += request.JSON.sale.saleItems.collect{
				"${it.quantity} x ${it.product.id}"
			}.join(", ")
			// https://stripe.com/docs/testing
			def card = sale.stripeToken != "test" ? sale.stripeToken : [
				number : "4242424242424242", // success
				//number : "4000000000000002", // card_declined
				exp_month : 12,
				exp_year: 2020
			]
			charge = Charge.create([
				amount : 50 * 100,
				currency : "usd",
				card : card,
				description : description
			])
			sale.wasChargeConfirmed = true
			if (!sale.save(flush : true)) {
				log.error("Unable to set wasChargeConfirmed to true for <${sale}> because of the following errors: <${sale.errors}>.  Will attempt to delete the row from the database...")
				// At this point, wasChargeConfirmed will be false, but will be left in the database.
				// It will require manually analysis to determine whether the customer was actually charged.
			}
			result += [
				paid : true,
				backendFailure : false
			]
			
			// https://stripe.com/docs/api/java#errors
		} catch (CardException e) {
			// Since it's a decline, CardException will be caught
			System.out.println("Status is: " + e.getCode());
			System.out.println("Message is: " + e.getParam());
			result += [
				failureCode : e.code,
				failureMessage : e.param,
				backendFailure : false
			]
		} catch (InvalidRequestException e) {
			log.error("Invalid parameters were supplied to Stripe's API", e)
		} catch (AuthenticationException e) {
			log.error("Authentication with Stripe's API failed.  Maybe we changed our API keys recently?", e)
		} catch (APIConnectionException e) {
			log.error("Network communication with Stripe failed.", e)
		} catch (APIException e) {
			log.error("Very generic error", e)
		}
		
		if (result.paid) {
			sale.wasConfirmationEmailSent = result.wasConfirmationEmailSent = emailService.sendThankYouForYourOrderEmail(sale);
		} else {
			log.warn("Attempting to delete <${sale}> since it wasn't successfully paid.")
			sale.delete()
		}
		
		renderResult(result)
		
	}
	
	private boolean saveDomainObject(def domainObject, boolean flush, def result) {
		if (!domainObject.save(flush : flush)) {
			log.error("Persisting <${domainObject}> for the sale with JSON <${request.JSON}> generated the following errors: <${domainObject.errors}>")
			renderResult(result)
			return false
		}
		return true
	}
	
	private void renderResult(def result) {
		render(contentType : "application/json") {
			result
		}
	}
}
