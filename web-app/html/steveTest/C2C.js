C2C = function() {
	
};
$.extend(C2C.prototype, {
    amazonCoBrandedPopUpUrl : null,
    getAmazonCoBrandedUrl : function() {
        var that = this;
    	$.ajax({
    	    type : 'POST',
    	    url : '/CheesecakeToConsumers/payment/amazonCoBrandedUrl', 
    	    data : JSON.stringify(this.getParamsForAmazonCoBrandedUrlRequest()),
    	    processData : false
    	}).done(function(url) {
    		console.log('amazonCoBrandedPopUpUrl: <%s>', url);
    		that.amazonCoBrandedPopUpUrl = url;
    	 });
    },
    getParamsForAmazonCoBrandedUrlRequest : function() {
    	return {
    		recipient : {
    			name : 'John Smith',
    			addressLine1 : '711 Briar Rd.',
    			addressLine2 : 'Appartment D',
    			city : 'Bellingham',
    			state : 'WA',
    			zip : '98229',
    			phoneNumber : '360-389-3818'
    		},
    		cheecakes : [
        		{
        		    cheesecakeId : 'newYork',
        		    quantity : 4
        		}, {
                    cheesecakeId : 'veryBerry',
                    quantity : 4
                }
    		],
    		arrivalDate : '2013-10-25',
    		giftMessage : 'Dear Mom,  I hope you have a wonderful birthday.  We love you!'
    	};
    }
});