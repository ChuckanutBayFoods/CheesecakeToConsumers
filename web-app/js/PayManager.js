PayManager = function(elementSelectors, order, onPaymentComplete) {
    var checkoutWindow = $(elementSelectors.checkoutWindow);
    var payForm = $(elementSelectors.payForm);
    var isPaymentComplete = false;

    payForm.find('.name').val(order.billingInfo.name());
    payForm.find('.email').val(order.billingInfo.email());
    payForm.find('[disabled=""]').removeAttr('disabled');

    this.disable = function() {
        $(payForm.find('input, button, select')).attr('disabled', 'disabled');
    };

    this.displayOrderSummary = function() {
        var flavorQuantitiesContainer = checkoutWindow.find('ul');
        flavorQuantitiesContainer.empty();
        $.each(order.cheesecakes.getUnique(), function(i, v) {
            flavorQuantitiesContainer.append(
                '<li>' + v.quantity + 'x ' + v.name + '</li>'
            );
        });
    };

    this.addInputNames = function() {
        // Not ideal, but jQuery's validate plugin requires fields to have names
        // so we add them at the last possible minute, in case any javascript
        // exceptions have caused other parts of the script to fail.
        payForm.find('.card-number').attr('name', 'card-number');
        payForm.find('.card-cvc').attr('name', 'card-cvc');
        payForm.find('.card-expiry-year').attr('name', 'card-expiry-year');
    };

    this.removeInputNames = function() {
        payForm.find('.card-number, .card-cvc, .card-expiry-year').removeAttr('name');
    };

    this.submit = function(form) {
        // remove the input field names for security
        // we do this *before* anything else which might throw an exception
        this.removeInputNames(); // THIS IS IMPORTANT!

        // given a valid form, submit the payment details to stripe
        $(form['submit-button']).attr('disabled', 'disabled');
        checkoutWindow.find('.loading > *').addClass('active');

        Stripe.createToken({
            number: $('.card-number').val(),
            cvc: $('.card-cvc').val(),
            exp_month: $('.card-expiry-month').val(),
            exp_year: $('.card-expiry-year').val()
        }, function(status, response) {
            if (response.error) {
                // re-enable the submit button
                $(form['submit-button']).removeAttr('disabled');
                payForm.find('.loading > *').removeClass('active');

                // show the error
                payForm.find('.payment-errors').show().html(response.error.message);

                // we add these names back in so we can revalidate properly
                this.addInputNames();
            } else {
                payForm.find('.payment-errors').hide();
                order.billingInfo.stripeToken(response.id);
                var sale = {
                    sale: {
                        stripeToken: order.billingInfo.stripeToken(),
                        recipient: {
                            name: order.label.name(),
                            companyName: order.label.company(),
                            addressLine1: order.label.address(),
                            addressLine2: order.label.address2(),
                            city: order.label.city(),
                            state: order.label.state(),
                            zipCode: order.label.zip(),
                            phoneNumber: 'Not Given'
                        },
                        saleItems: (function() {
                            var saleItems = [];
                            $.each(order.cheesecakes.getUnique(), function(i, v) {
                                saleItems.push({
                                    quantity: v.quantity,
                                    product: {
                                        id: v.id
                                    }
                                });
                            });
                            return saleItems;
                        })(),
                        arrivalDate: moment(order.label.deliverdate()).format('YYYYMMDD'),
                        giftMessage: order.giftMessage,
                        giver: {
                            emailAddress: order.billingInfo.email(),
                            name: order.billingInfo.name()
                        }
                    }
                };
                $.ajax({
                    url: Constants.Urls.STRIPE_CHARGE,
                    method: 'post',
                    contentType: 'application/json',
                    processData: false,
                    data: JSON.stringify(sale)
                }).done(function(response) {
                    $(form['submit-button']).removeAttr('disabled');
                    if (response.paid) {
                        isPaymentComplete = true;
                        onPaymentComplete();
                    } else if (response.backendFailure) {
                        payForm.find('.payment-errors').show().html('There was an error processing your order. Please try again.');
                    } else {
                        payForm.find('.payment-errors').show().html(response.failureMessage);
                    }
                }).fail(function() {
                    payForm.find('.payment-errors').show().html('There was an error processing your order. Please try again.');
                    $(form['submit-button']).removeAttr('disabled');
                }).always(function() {
                    checkoutWindow.find('.loading > *').removeClass('active');
                });
            }
        });

        return false;
    };

    this.isPaymentComplete = function() {
        return isPaymentComplete;
    };

    // Get publishable key
    $.get(Constants.Urls.STRIPE_GET_PUBLISHABLE_KEY).done(function(result) {
        Stripe.setPublishableKey(result);
    });

    // Initialize credit card year and month fields
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    for (var i = 0; i < 12; i++) {
        // TODO: use http://jqueryvalidation.org/jQuery.validator.format/
        $('.card-expiry-year').append($('<option value="'+(i + year)+'" '+(i === 0 ? 'selected' : '')+'>'+(i + year)+'</option>'));
        $('.card-expiry-month').append($('<option value="'+ (i + 1) +'" '+(month === i + 1 ? 'selected' : '')+'>'+ (i + 1) +'</option>'));
    }

    // add custom rules for credit card validating
    jQuery.validator.addMethod('billingName', function(name) {
        order.billingInfo.name(name);
        return name;
    }, 'Enter name on credit card.');

    jQuery.validator.addMethod('billingEmail', function(email) {
        order.billingInfo.email(email);
        return email;
    }, 'Enter your email.');

    jQuery.validator.addMethod('cardNumber', Stripe.validateCardNumber, 'Please enter a valid card number');
    jQuery.validator.addMethod('cardCVC', Stripe.validateCVC, 'Please enter a valid security code');
    jQuery.validator.addMethod('cardExpiry', function() {
        return Stripe.validateExpiry($('.card-expiry-month').val(), $('.card-expiry-year').val());
    }, 'Please enter a valid expiration');

    // We use the jQuery validate plugin to validate required params on submit
    payForm.validate({
        submitHandler: $.proxy(this.submit, this),
        rules: {
            'name' : {
                billingName: true
            },
            'email' : {
                billingEmail: true
            },
            'card-cvc' : {
                cardCVC: true,
                required: true
            },
            'card-number' : {
                cardNumber: true,
                required: true
            },
            'card-expiry-year' : 'cardExpiry' // we don't validate month separately
        }
    });

    // adding the input field names is the last step, in case an earlier step errors
    this.addInputNames();
};