C2C = function() {
	
};

C2C.POP_UP_WINDOW_NAME = "AmazonCoBrandedPopUpWindow" + new Date();

$.extend(C2C.prototype, {
    
    _amazonCoBrandedUrl : null,
    _amazonSingleUseResponseParameters : null,
    
    _order : null,
    _callbacks : null,
    
    _checkIfPopUpIsClosedIntervalId : null,
    
    /**
     * Has recipient, cheesecakes, arrivalDate, and giftMessage.
     * Callbacks:
     * - errorGettingAmazonCoBrandedUrl
     * - errorOpeningPopUp
     * - errorPopUpClosed
     * - errorWithPayment
     * - success
     */
    initialize : function(order, callbacks) {
        this._cleanUp();
        this._order = order;
        this._callbacks = {
            errorGettingAmazonCoBrandedUrl : callbacks.errorGettingAmazonCoBrandedUrl || $.noop(),
            errorOpeningPopUp : callbacks.errorOpeningPopUp || $.noop(),
            errorPopUpClosed : callbacks.errorPopUpClosed || $.noop(),
            errorWithPayment : callbacks.errorWithPayment || $.noop(),
            success : callbacks.success || $.noop()
        };
    	$.ajax({
    	    type : 'POST',
    	    url : '/CheesecakeToConsumers/payment/getAmazonCoBrandedUrl', 
    	    data : JSON.stringify(this._order),
    	    contentType: "application/json",
    	    processData : false
    	}).done($.proxy(function(response) {
    	        console.log('getAmazonCoBrandedUrl response:');
    	        console.log(response);
    	        this._amazonCoBrandedUrl = response.amazonCoBrandedUrl;
        		this._amazonCallerReference = response.amazonCallerReference;
        	}, this)
    	).fail(this._callbacks.errorGettingAmazonCoBrandedUrl);
    },
    
    _reinitialize : function() {
        // Reset with a new popUp URL in case the popUp is initiated again.
        this.initialize(this._order, this._callbacks);
    },
    
    _cleanUp : function() {
        this._amazonCoBrandedUrl = null;
        this._amazonCallerReference = null;
        this._amazonSingleUseResponseParameters = null;
        this._callbacks = null;
        // close window if it's open
        window.popUpComplete = null;
    },
    
    openAmazonCoBrandedPopUp : function(callbacks) {
        if (!this._amazonCoBrandedUrl) {
            this._callbacks.errorOpeningPopUp();
            return;
        }
        window.popUpComplete = $.proxy(this._popUpComplete, this);
        var popUpWindow = window.open(this._amazonCoBrandedUrl, C2C.POP_UP_WINDOW_NAME, 'location=yes,menubar=yes,resizable=yes,status=yes,titlebar=yes,toolbar=yes');
        // Monitor the window's state
        // http://stackoverflow.com/questions/5712195/js-listen-when-child-window-is-closed
        this._checkIfPopUpIsClosedIntervalId = setInterval($.proxy(checkIfPopUpIsClosed, this), 500);
        function checkIfPopUpIsClosed() {
            if (popUpWindow.closed) {
                clearInterval(this._checkIfPopUpIsClosedIntervalId);
                if (!this._amazonSingleUseResponseParameters) {
                    this._callbacks.errorPopUpClosed();
                }
            }
        }
        
    },
    
    _popUpComplete : function(redirectUrl) {
        console.log(redirectUrl);
        clearInterval(this._checkIfPopUpIsClosedIntervalId);
        // Defer this work in case there's an error.  We don't want to affect the closing of the popup.
        setTimeout($.proxy(this._handlePopUpComplete, this), 0, redirectUrl);
    },
    
    _handlePopUpComplete : function(redirectUrl) {
        // Convert the query string params to a map.
        this._amazonSingleUseResponseParameters = $.String.deparam(redirectUrl.substring(redirectUrl.indexOf('?') + 1));
        console.log(this._amazonSingleUseResponseParameters);
        if (!this._amazonSingleUseResponseParameters.status || !this._amazonSingleUseResponseParameters.status.match(/^S[ABC]$/)) {
            this._reinitialize();
            this._callbacks.errorWithPayment();
            return;
        }
        $.ajax({
            type : 'POST',
            url : '/CheesecakeToConsumers/payment/chargeCustomer', 
            data : JSON.stringify({
                order : this._order,
                amazonCallerReference : this._amazonCallerReference,
                amazonSingleUseResponseParameters : this._amazonSingleUseResponseParameters
            }),
            contentType: "application/json",
            processData : false
        })
        .always($.proxy(this._reinitialize, this))
        .done($.proxy(function(response) {
                if (response.result) {
                    this._callbacks.success();
                } else {
                    this._reinitialize();
                    this._callbacks.errorWithPayment();
                }
            }, this)    
        ).fail(this._callbacks.errorWithPayment);
        
    }
});