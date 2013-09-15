package cheesecaketoconsumers

import groovy.transform.PackageScope;
import groovy.transform.ToString;
import groovy.xml.MarkupBuilder

import java.awt.GraphicsConfiguration.DefaultBufferCapabilities;
import java.util.Date;

import com.amazonaws.cbui.AmazonFPSSingleUsePipeline;
import com.amazonaws.utils.PropertyBundle;
import com.amazonaws.utils.PropertyKeys;

class PaymentController {

    def index() { 
		render "what up dog?!"
	}
	
	def getAmazonCoBrandedUrl() {
		// TODO: See if there's a way for Grails to do this automatically.
		Order order = new Order(request.JSON);
		log.debug(order);
		
		String accessKey = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
		String secretKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
		
		AmazonFPSSingleUsePipeline pipeline= new AmazonFPSSingleUsePipeline(accessKey, secretKey);

		pipeline.setMandatoryParameters("callerReferenceSingleUse" + new Date(), "http://localhost:8080/CheesecakeToConsumers/html/steveTest/closePopup.html", "5");
		
		//optional parameters
		pipeline.addOptionalParameters([
			addressName : order.recipient.name,
			addressLine1 : order.recipient.addressLine1,
			addressLine2 : order.recipient.addressLine2,
			city : order.recipient.city,
			state : order.recipient.state,
			country : "US",
			zip : order.recipient.zipCode,
			phoneNumber : order.recipient.phoneNumber,
			collectShippingAddress : false as String,
			currencyCode : "USD",
			transactionAmount : "50",
			// TODO: it doesn't currently look like this is being respected
			paymentMethod : "ACH,ABT,CC",
			paymentReason : createPaymentReason(order)
		])
		
		//SingleUse url
		render pipeline.getUrl()
	}
	
	@PackageScope String createPaymentReason(Order order) {
		def writer = new StringWriter()
		def builder = new MarkupBuilder(writer)
		builder.ul {
			order.cheesecakes.each { cheesecake ->
				builder.li"${cheesecake.quantity} - ${cheesecake.id}"
			}
		}
		return "Gift for ${order.recipient.name}:" + writer.toString();
	}
	
}
