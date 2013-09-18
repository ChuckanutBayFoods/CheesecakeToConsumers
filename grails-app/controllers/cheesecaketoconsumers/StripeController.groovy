package cheesecaketoconsumers

import com.stripe.Stripe
import com.stripe.exception.APIConnectionException
import com.stripe.exception.APIException
import com.stripe.exception.AuthenticationException
import com.stripe.exception.CardException
import com.stripe.exception.InvalidRequestException
import com.stripe.model.Charge


class StripeController {

	def charge() {
		Stripe.apiKey = "sk_test_mkGsLqEW6SLnZa487HYfJVLf";
		Stripe.apiVersion = "2013-08-13"
		
		// TODO: See if there's a way for Grails to do this automatically.
		//Order order = new Order(request.JSON.order);
		///log.debug(order);
		
		log.debug(request.JSON.sale)
		Sale sale = new Sale(request.JSON.sale)
		sale.properties = [
			giver : new Giver(request.JSON.giver),
			recipient : new Recipient(request.JSON.recipient),
			saleItems : request.JSON.saleItems.collect{
				new SaleItem(it)
			}
		]
		log.debug(sale)
		
		Charge charge
		def result = [
			paid : false,
			backendFailure : true
		]
		try {
			charge = Charge.create([
				amount : 50 * 100,
				currency : "usd",
				// request.JSON.stripeToken
				// https://stripe.com/docs/testing
				card : [
					number : "4242424242424242", // success
					//number : "4000000000000002", // card_declined
					exp_month : 12,
					exp_year: 2020
				], 
				description : "email@address.com order for recipient"
			])
			result += [
				paid : true,
				backendFailure : false
			]
//			if (!sale.save()) {
//				sale.errors.each {
//					log.error(it)
//				}
//			}
			
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
			// Display a very generic error to the user, and maybe send
			// yourself an email
		}
		
		render(contentType : "application/json") {
			result
		}
		
	}
}
