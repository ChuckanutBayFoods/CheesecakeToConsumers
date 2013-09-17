package cheesecaketoconsumers

import grails.converters.JSON;
import groovy.transform.PackageScope;
import groovy.transform.ToString;
import groovy.xml.MarkupBuilder

import java.awt.GraphicsConfiguration.DefaultBufferCapabilities;
import java.sql.ResultSet;
import java.util.Date;

import net.sf.ehcache.transaction.TransactionID;

import org.springframework.aop.TrueClassFilter;

import cheesecaketoconsumers.command.Order;

import com.amazonaws.cbui.AmazonFPSSingleUsePipeline;
import com.amazonaws.fps.AmazonFPS;
import com.amazonaws.fps.AmazonFPSClient;
import com.amazonaws.fps.AmazonFPSException;
import com.amazonaws.fps.model.Amount;
import com.amazonaws.fps.model.CurrencyCode;
import com.amazonaws.fps.model.PayRequest;
import com.amazonaws.fps.model.PayResponse;
import com.amazonaws.fps.model.PayResult;
import com.amazonaws.fps.model.ResponseMetadata;
import com.amazonaws.fps.model.TransactionStatus;
import com.amazonaws.utils.PropertyBundle;
import com.amazonaws.utils.PropertyKeys;

class PaymentController {

	static scope = "singleton"
	
	private final String TRANSACTION_AMOUNT = "50"
	// http://docs.aws.amazon.com/AmazonFPS/latest/FPSBasicGuide/CHAP_Sandbox.html
	// On 9/15/13, Steve couldn't get these values to trigger an error.
	//private final String TRANSACTION_AMOUNT = "50.61"; // Temporary Decline: Occurs when a downstream process is not available
	//private final String TRANSACTION_AMOUNT = "50.71" // Payment Error: Insufficient funds
	
	private AmazonFPS service;
	private String accessKeyId = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
	private String secretAccessKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
	
	PaymentController() {
		accessKeyId = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
		secretAccessKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
		
		try {
			service = new AmazonFPSClient(accessKeyId, secretAccessKey);
		} catch (AmazonFPSException e) {
			log.error(pullKeysFromAmazonFPSException, e)
			throw new IllegalStateException(e)
		}
	}
	
	def index() { 
		render "what up dog?!"
	}
	
	def getAmazonCoBrandedUrl() {
		// TODO: See if there's a way for Grails to do this automatically.
		Order order = new Order(request.JSON);
		log.debug(order);
		
		AmazonFPSSingleUsePipeline pipeline = new AmazonFPSSingleUsePipeline(accessKeyId, secretAccessKey);

		// http://docs.aws.amazon.com/AmazonFPS/latest/FPSBasicGuide/SingleUsePipeline.html
		String callerReference = "callerReferenceSingleUse" + new Date();
		
		//optional parameters
		pipeline.addOptionalParameters([
			callerReference : callerReference,
			returnURL : "http://localhost:8080/CheesecakeToConsumers/html/steveTest/closePopup.html",
			addressName : order.recipient.name,
			addressLine1 : order.recipient.addressLine1,
			addressLine2 : order.recipient.addressLine2,
			city : order.recipient.city,
			state : order.recipient.state,
			country : "US",
			zip : order.recipient.zipCode,
			phoneNumber : order.recipient.phoneNumber,
			collectShippingAddress : false as String,
			transactionAmount : TRANSACTION_AMOUNT,
			currencyCode : "USD",
			// TODO: it doesn't currently look like this is being respected
			paymentMethod : "ACH,ABT,CC",
			paymentReason : createPaymentReason(order)
		])
		
		//SingleUse url
		render(contentType : "application/json") {[
			amazonCoBrandedUrl : pipeline.getUrl(),
			amazonCallerReference : callerReference
		]}
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
	
	// http://docs.aws.amazon.com/AmazonFPS/latest/FPSBasicGuide/Pay.html
	def chargeCustomer() {
		// TODO: See if there's a way for Grails to do this automatically.
		Order order = new Order(request.JSON.order);
		log.debug(order);
		def amazonSingleUseResponseParameters = request.JSON.amazonSingleUseResponseParameters;
		log.debug(amazonSingleUseResponseParameters);
		
		PayRequest payRequest = new PayRequest([
			//callerReference : request.JSON.amazonCallerReference,
			callerReference : new Date() as String, // Useful when doing error testing
			senderTokenId : amazonSingleUseResponseParameters.tokenID,
			// http://docs.aws.amazon.com/AmazonFPS/latest/FPSBasicGuide/CHAP_Sandbox.html
			//senderTokenId : "Z1LGRXR4HMDZBSFKXELA32KZASGWD8IHMHZCK4DETR784LDLD1GMFW4P3WT8VTGX", // Closed Account
			//senderTokenId : "E3FR7BARJV3PB631PMKV74PGKCJLBHI1Q1KMQN7BJ2JJICPDKN3N1CJIKFZ8D7NN", // Email Address Not Verified
			//senderTokenId : "H216UECZ8ZM1G8G4QA3V7RKF8JDFZ9SI3SJAFSGUKBBNDHX1NVM8GUQRZNRNAHER", // Suspended Account
			transactionAmount : [
				currencyCode : CurrencyCode.USD,
				value : TRANSACTION_AMOUNT
			]
		])
		
		boolean payRequestSuccessfullyMade = false
		try {
			PayResponse payResponse = service.pay(payRequest);
			PayResult payResult = payResponse.getPayResult();
			// TODO: persist transaction ID
			log.debug([
				transactionId : payResult.getTransactionId(),
				transactionStatus : payResult.getTransactionStatus().value()
			]);
		
		    if ([TransactionStatus.PENDING, TransactionStatus.SUCCESS].contains(payResult.getTransactionStatus())) {
				payRequestSuccessfullyMade =  true;
			}
		} catch (AmazonFPSException e) {
			log.error(pullKeysFromAmazonFPSException(e), e)
		}
		render(contentType : "application/json") {[
			result : payRequestSuccessfullyMade
		]}
	}
	
	private def pullKeysFromAmazonFPSException(AmazonFPSException e) {
		return [
			"Caught Exception" : e.getMessage(),
			"Response Status Code" : e.getStatusCode(),
			"Error Code" : e.getErrorCode(),
			"Error Type" : e.getErrorType(),
			"Request ID" : e.getRequestId(),
			"XML" : e.getXML()
		]
	}
}
