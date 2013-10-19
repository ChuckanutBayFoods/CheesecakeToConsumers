package cheesecaketoconsumers


class ShippingMethod {

    static constraints = {
		name maxSize : 128, blank:false
    }
	
	String name
	
	/**
	 * @return URL prefix per http://verysimple.com/2011/07/06/ups-tracking-url/
	 */
	String getTrackingUrlPrefix() {
		if (name =~ /UPS/) {
			return "http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums="
		} else if (name =~ /FedEx/) {
			return "http://www.fedex.com/Tracking?action=track&tracknumbers="
		}
	}
}
