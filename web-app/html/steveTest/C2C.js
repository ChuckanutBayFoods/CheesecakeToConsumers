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
    	    contentType: "application/json; charset=utf-8",
    	    processData : false
    	}).done($.proxy(function(url) {
        		console.log('amazonCoBrandedPopUpUrl: <%s>', url);
        		this._amazonCoBrandedUrl = url;
        	}, this)
    	).fail(this._callbacks.errorGettingAmazonCoBrandedUrl);
    },
    
    _cleanUp : function() {
        this._amazonCoBrandedUrl = null;
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
        setTimeout(this._handlePopUpComplete, 0, redirectUrl);
    },
    
    _handlePopUpComplete : function(redirectUrl) {
        this._amazonSingleUseResponseParameters = $.String.deparam(redirectUrl);
        console.log(this._amazonSingleUseResponseParameters);
        if (!this._amazonSingleUseResponseParameters.status || !this._amazonSingleUseResponseParameters.status.match(/^S[ABC]$/)) {
            this._callbacks.errorWithPayment();
            return;
        }
        var that = this;
        $.ajax({
            type : 'POST',
            url : '/CheesecakeToConsumers/payment/chargeCustomer', 
            data : JSON.stringify({
                order : this._order,
                amazonSingleUseResponseParameters : this._amazonSingleUseResponseParameters
            }),
            contentType: "application/json; charset=utf-8",
            processData : false
        }).done(function(url) {
            console.log('Successfully charged user');
            that.callbacks.success();
        }).fail(function() {
            // TODO: what should we do here?
            console.error('Could not charge customer.');
        });
        
    }
});