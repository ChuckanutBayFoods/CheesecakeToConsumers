package cheesecaketoconsumers

import java.util.Date;

import com.amazonaws.cbui.AmazonFPSSingleUsePipeline;
import com.amazonaws.utils.PropertyBundle;
import com.amazonaws.utils.PropertyKeys;

class PaymentController {

    def index() { 
		render "what up dog?!"
	}
	
	def amazonCoBrandedUrl(Order order) {
		log.debug(order);
		
		String accessKey = PropertyBundle.getProperty(PropertyKeys.AWS_ACCESS_KEY);
		String secretKey = PropertyBundle.getProperty(PropertyKeys.AWS_SECRET_KEY);
		
		AmazonFPSSingleUsePipeline pipeline= new AmazonFPSSingleUsePipeline(accessKey, secretKey);

		pipeline.setMandatoryParameters("callerReferenceSingleUse" + new Date(), "http://localhost:8080/CheesecakeToConsumers/html/steveTest/closePopup.html", "5");
		
		//optional parameters
		pipeline.addParameter("currencyCode", "USD");
		pipeline.addParameter("paymentReason", "HarryPotter 1-5 DVD set");
		
		//SingleUse url
		render pipeline.getUrl()
	}
}
