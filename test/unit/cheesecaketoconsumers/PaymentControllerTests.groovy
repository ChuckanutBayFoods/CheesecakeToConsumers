package cheesecaketoconsumers



import java.awt.GraphicsConfiguration.DefaultBufferCapabilities;

import grails.test.mixin.*

import org.junit.*

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(PaymentController)
class PaymentControllerTests {

    void testCreatePaymentReason() {
		Order order = [
			recipient : [
				name : 'JavaScript Person',
				addressLine1 : '711 Briar Rd.',
				addressLine2 : 'Appartment D',
				city : 'CitySteveMadeUp',
				state : 'WA',
				zipCode : '98229',
				phoneNumber : '360-123-1234'
			],
			cheesecakes : [
				[
					id : 'newYork',
					quantity : 4
				], [
					id : 'veryBerry',
					quantity : 4
				]
			],
			arrivalDate : '2013-10-25',
			giftMessage : 'Dear Mom,  I hope you have a wonderful birthday.  We love you!'
		]
		def paymentReason = controller.createPaymentReason(order);
		log.info paymentReason
    }
}
