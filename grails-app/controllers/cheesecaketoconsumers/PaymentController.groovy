package cheesecaketoconsumers

import grails.converters.JSON;
import groovy.transform.PackageScope;
import groovy.transform.ToString;
import groovy.xml.MarkupBuilder

import java.awt.GraphicsConfiguration.DefaultBufferCapabilities;
import java.sql.ResultSet;
import java.util.Date;

import org.springframework.aop.TrueClassFilter;

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
import com.amazonaws.utils.PropertyBundle;
import com.amazonaws.utils.PropertyKeys;
import com.oracle.jrockit.jfr.ContentType;

class PaymentController {

	static scope = "singleton"
	
	private AmazonFPS service;
	private String accessKeyId = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
	private String secretAccessKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
	
	PaymentController() {
		accessKeyId = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
		secretAccessKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
		
		try {
			service = new AmazonFPSClient(accessKeyId, secretAccessKey);
		} catch (AmazonFPSException e) {
			log.error([
				"Caught Exception" : e.getMessage(),
			    "Response Status Code: " : e.getStatusCode(),
			    "Error Code: " : e.getErrorCode(),
			    "Error Type: " : e.getErrorType(),
			    "Request ID: " : e.getRequestId(),
			    "XML: " : e.getXML()
			], e)
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
			transactionAmount : "50",
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
	
	def chargeCustomer() {
		// TODO: See if there's a way for Grails to do this automatically.
		Order order = new Order(request.JSON.order);
		log.debug(order);
		def amazonSingleUseResponseParameters = request.JSON.amazonSingleUseResponseParameters;
		log.debug(amazonSingleUseResponseParameters);
		
		PayRequest payRequest = new PayRequest([
			callerReference : request.JSON.amazonCallerReference,
			senderTokenId : amazonSingleUseResponseParameters.tokenID,
			transactionAmount : [
				currencyCode : CurrencyCode.USD,
				value : "50"
			]
		]);
		invokePay(payRequest)
		render(contentType : "application/json") {[
			result : "true"
		]}
	}
	
	public void invokePay(PayRequest payRequest) {
		try {
			
			PayResponse payResponse = service.pay(payRequest);

			
			System.out.println ("Pay Action Response");
			System.out.println ("=============================================================================");
			System.out.println ();

			System.out.println("    PayResponse");
			System.out.println();
			if (payResponse.isSetPayResult()) {
				System.out.println("        PayResult");
				System.out.println();
				PayResult  payResult = payResponse.getPayResult();
				if (payResult.isSetTransactionId()) {
					System.out.println("            TransactionId");
					System.out.println();
					System.out.println("                " + payResult.getTransactionId());
					System.out.println();
				}
				if (payResult.isSetTransactionStatus()) {
					System.out.println("            TransactionStatus");
					System.out.println();
					System.out.println("                " + payResult.getTransactionStatus().value());
					System.out.println();
				}
			}
			if (payResponse.isSetResponseMetadata()) {
				System.out.println("        ResponseMetadata");
				System.out.println();
				ResponseMetadata  payResponseMetadata = payResponse.getResponseMetadata();
				if (payResponseMetadata.isSetRequestId()) {
					System.out.println("            RequestId");
					System.out.println();
					System.out.println("                " + payResponseMetadata.getRequestId());
					System.out.println();
				}
			}
			System.out.println();

		   
		} catch (AmazonFPSException ex) {
			
			System.out.println("Caught Exception: " + ex.getMessage());
			System.out.println("Response Status Code: " + ex.getStatusCode());
			System.out.println("Error Code: " + ex.getErrorCode());
			System.out.println("Error Type: " + ex.getErrorType());
			System.out.println("Request ID: " + ex.getRequestId());
			System.out.print("XML: " + ex.getXML());
		}
	}
}
