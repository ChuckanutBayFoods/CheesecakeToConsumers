// Utility functions
var Utils = {

    // Returns true if unning on a mobile device
    _isMobile: undefined,
    isMobile: function() {
        if (this._isMobile === undefined) {
            this._isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        }
        return this._isMobile;
    },

    getSetProp: function(name, value, context) {
        return (value && (context[name] = value) && context) || context[name];
    },

    removeClassFromAll: function(className) {
        return $('.' + className).removeClass(className);
    },

    NUM_CHESSECAKE_SLOTS: 8
};

var Urls = {
    STRIPE_GET_PUBLISHABLE_KEY: '/stripe/getPublishableKey',
    STRIPE_CHARGE: '/stripe/charge',
    PRODUCT_GET_DUMP: '/product/getDump'
}

var Order = function() {
    var Cheesecakes = function() {
        var cheesecakeSlots = [];

        this.getUnique = function() {
            return $.grep(cheesecakeSlots, function(v, i) {

                // ignore open slots
                if(!v || !i) {
                    return false;
                }

                if ($.inArray(v, cheesecakeSlots) === i) { // This is the first occurrence of the flavor v
                    v.quantity = 1;
                    return true;
                } else { // We have seen this flavor before
                    v.quantity++;
                    return false;
                }
            });
        };

        this.add = function(flavor) {
            for(var i = 0; i < Utils.NUM_CHESSECAKE_SLOTS; i++) {
                if (!cheesecakeSlots[i]) {
                    cheesecakeSlots[i] = flavor;
                }
            }
            return false;
        };

        this.remove = function(slot) {
            var removedCheesecake = cheesecakeSlots[slot];
            cheesecakeSlots[slot] = undefined;
            return removedCheesecake;
        };
    }
    this.cheesecakes = new Cheesecakes();

    this.giftMessage =
        'My dearest,                                          \
                                                              \
        I hope you enjoy this all natural delicious dessert.  \
                                                              \
        Love,                                                 \
        Your secret admirer';

    var Label = function() {
        var _name;
        var _company;
        var _address;
        var _address2;
        var _city;
        var _state;
        var _zip;
        var _deliverdate;

        this.name        = function(name) { return Utils.getSetProp('_name', name, this) };
        this.company     = function(company) { return Utils.getSetProp('_company', company, this) };
        this.address     = function(address) { return Utils.getSetProp('_address', address, this) };
        this.address2    = function(address2) { return Utils.getSetProp('_address2', address2, this) };
        this.city        = function(city) { return Utils.getSetProp('_city', city, this) };
        this.state       = function(state) { return Utils.getSetProp('_state', state, this) };
        this.zip         = function(zip) { return Utils.getSetProp('_zip', zip, this) };
        this.deliverdate = function(deliverdate) { return Utils.getSetProp('_deliverdate', deliverdate, this) };
    }
    this.label = new Label();

    var BillingInfo = function() {
        var _name;
        var _email;
        var _stripeToken;

        this.name        = function(name) { return Utils.getSetProp('_name', name, this) };
        this.email     = function(email) { return Utils.getSetProp('_email', email, this) };
        this.stripeToken     = function(stripeToken) { return Utils.getSetProp('_stripeToken', stripeToken, this) };
    }
    this.billingInfo = new BillingInfo();
}



//var FaqPopover = function() {
//    $('.questions > a').popover({
//        placement: 'bottom',
//        content: $('.questions-content').html(),
//        html: true
//    });
//};

var FlavorManager = function() {
    var flavors = [];

    this.loadFlavors = function(callback) {
        if (flavors) {
            callback(flavors);
        } else {
            $.get(Urls.PRODUCT_GET_DUMP).done(function (result) {
                flavors = result;
                callback(flavors);
            });
        }
        return this;
    };

    this.getAllFlavors = function() {
        return flavors;
    };


    this.getFlavorById = function(id) {
        var flavor;
        $.each(flavors, function(i, v) {
            if (v.id === id) {
                flavor = v;
                return false;
            }
        });
        return flavor;
    };
};

// #flavor-carousel
// #selected-cheesecake-btns .btn-more-info
// #selected-cheesecake-btns .btn-add
//'#more-info'
//'.btn-show-nutrition-label'
var PickManager = function(elementSelectors, order) {
    var flavorCarousel;
    var flavorManager = new FlavorManager().load(function(flavors) {
        flavorCarousel = new FlavorCarousel({
            main: elementSelectors.carousel + ' .well',
            leftArrow: elementSelectors.carousel + ' .left-arrow',
            rightArrow: elementSelectors.carousel + ' .right-arrow'
        }, flavors)
    });

    $(elementSelectors.showNutritionLabelButton).click(function() {
        $(this).hide();
        $(elementSelectors.moreInfo).addClass('show-nutrition-label')
    });

    $(elementSelectors.moreInfoButton).click($.proxy(function() {
        this.displayMoreInfo(flavorCarousel.getSelectedFlavor());
    }), this);

    $(elementSelectors.addButton).click($.proxy(function() {
        this.pickCheesecake(flavorCarousel.getSelectedFlavor());
    }), this);

    this.displayMoreInfo = function(flavor) {
        var moreInfoWindow = $(elementSelectors.moreInfo).removeClass('show-nutrition-label').modal();
        $(elementSelectors.showNutritionLabelButton).show();
        moreInfoWindow.find('h3').text(flavor.name);
        moreInfoWindow.find('.staged-image').attr('src', flavor.stageImageUrl);
        moreInfoWindow.find('.description').text(flavor.description);
        moreInfoWindow.find('.ingredients').text(flavor.ingredients);
        moreInfoWindow.find('.allergens').text(flavor.allergens);
        moreInfoWindow.find('.nutrition-label').attr('src', flavor.nutritionLabelImageUrl);
        return this;
    };

    this.pickCheesecake = function(flavor) {
        var flavor = flavorCarousel.getSelectedFlavor();
        var slot = Flavors.pickCheesecake(flavor);

        if (!slot) {
            return;
        }

        if (slot == Utils.NUM_CHESSECAKE_SLOTS - 1) {
            $(elementSelectors.addButton).addClass('disabled');
        }

        var parentContainer;
        if (slot < Utils.NUM_CHESSECAKE_SLOTS/2) {
            parentContainer = $('#tray1');
        } else {
            parentContainer = $('#tray2');
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $(
            '<img class="cheesecake cheesecake' + slot + ' src="' + flavor.bareImageUrl + '">' +
                '<a href="#" class="cheesecake-event-catcher cheesecake cheesecake' + slot + '"><img src="' + flavor.bareImageUrl + '" /></a>')
            .appendTo(parentContainer)
            .animate({top: '-=100'}, 500)
            .popover({
                placement: 'top',
                content: function() {
                    return $(
                        '<div class="flavor-label">' + flavor.name + '</div>' +
                            '<div class="btn-container btn-container' + slot + '">' +
                            '<div class="btn btn-more-info">More info</div>' +
                            '<div class="btn btn-remove btn-danger">Remove</div>' +
                            '</div>').data('flavor', flavor);
                },
                html: true,
                trigger: 'manual'
            })
            .click(function(e) {
                // TODO Validate correct section
                $(this).popover('show');
                clickedAway = false;
                isVisible = true;
                e.preventDefault();
                $('.popover').bind('click', function() {
                    clickedAway = false;
                });
            });

        cheesecake.parent().delegate('.btn-container' + slot + ' .btn-more-info', 'click', function() {
            displayMoreInfo($(this).parent().data('flavor'));
        }).delegate('.btn-container' + slot + ' .btn-remove', 'click', function() {
                order.cheesecakes.remove(slot);
                cheesecake.popover('hide').animate({top: '+=100'}, 500, function() {
                    cheesecake.remove();
                });
                $(elementSelectors.addButton).removeClass('disabled');
            });

        $(document).click(function(e) {
            if(isVisible && clickedAway) {
                cheesecake.popover('hide');
                isVisible = clickedAway = false;
            } else {
                clickedAway = true;
            }
        });
        return this;
    };
};

FlavorCarousel = function(elementSelectors, flavorManager) {
    this.addAllFlavors(flavorManager.getAllFlavors());

    // See http://darsa.in/sly/examples/horizontal.html
    $(elementSelectors.main).sly({
        horizontal: 1,
        itemNav: 'forceCentered',
        smart: 1,
        activateMiddle: 1,
        activateOn: 'click',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: 0,
        scrollBy: 1,
        speed: 300,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,

        // control buttons
        prev: $(elementSelectors.leftArrow),
        next: $(elementSelectors.rightArrow)

    }).sly('on', 'change', this.preloadSelectedBareImage);

    this.addAllFlavors = function(flavors) {
        $.each(flavors, $.proxy(function(i, v) {
            this.addFlavor(v);
        }, this));
    };

    this.addFlavor = function(flavor) {
        $(elementSelectors.main).find('.scroll').append(
            '<li class="flavor" data-id="' + flavor.id + '">' +
                (flavor.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                '<img src="' + flavor.stageImageUrl + '"/>' +
                '<div class="flavor-label">' + flavor.name + '</div>' +
                '</li>'
        );
    };

    this.preloadSelectedBareImage = function() {
        $(elementSelectors.hiddenImages).append(
            '<img src="' + this.getSelectedFlavor() + '" />'
        );
    };

    this.getSelectedFlavor = function() {
        return flavorManager.getFlavorById($(elementSelectors.main).find('.flavor.active').attr('data-id'));
    }
};

var PersonalizeManager = function(elementSelectors, order) {
    var mainElement = $(elementSelectors.main);
    mainElement.find('pre, .edit-message-label').click(function() {this.makeEditable(true) });
    mainElement.find('.btn-save').click(function() {this.makeEditable(false) });
    mainElement.find('pre').text(order.giftMessage);

    this.displayPickedCheesecakesInfo = function() {
        var flavorInfoContainer = mainElement.find('.flavor-info-container');
        flavorInfoContainer.empty();
        $.each(order.cheesecakes.getUnique(), function(i, v) {
            flavorInfoContainer.append(
                '<div class="flavor-info">' +
                    '<h5>' + v.name + '</h5>' +
                    '<div class="blurb">' + v.description + '</div>' +
                '</div>')
        });
    };

    this.makeEditable = function(editable) {
        if (editable) {
            mainElement.find('textarea').val(order.giftMessage);
        } else {
            mainElement.find('pre').text((order.giftMessage = mainElement.find('textarea').val()));
        }
        mainElement.find('.non-edit').toggleClass('hide', editable);
        mainElement.find('.edit').toggleClass('hide', !editable);
    }
};
// #label form
var PackManager = function(elementSelectors, order) {
    var form = $(elementSelectors.main);
    var datePicker = new DatePicker({ main: '#datepicker' });

    jQuery.validator.addMethod("packArrivalDate", this.validArrivalDate, "Please select a valid arrival date.");
    jQuery.validator.addMethod("packName", this.validName, "Please enter the recipient's name.");
    jQuery.validator.addMethod("packAddressLine1", this.validAddress, "Please enter the recipient's address");
    jQuery.validator.addMethod("packCity", this.validCity, "Please enter the recipient's city");
    jQuery.validator.addMethod("packState", this.validState, "Please enter the recipient's state");
    jQuery.validator.addMethod("packZip", this.validZip, "Please enter the recipient's zip code");

    form.validate({
        submitHandler: this.submit,
        showErrors: function(errorMap, errorList) {
            var error = errorList[0];
            error.element.tooltip({
                title: error.message,
                placement: 'right',
                trigger: 'manual'
            }).data('tooltip').show();
        },

        rules: {
            'arrival-date': {
                packArrivalDate: true,
                required: true
            },
            'name': {
                packName: true,
                required: true
            },
            'address': {
                packAddressLine1: true,
                required: true
            },
            'city': {
                packCity: true,
                required: true
            },
            'state': {
                packState: true,
                required: true
            },
            'zip': {
                packZip: true,
                required: true
            }
        }
    });

    this.makeEditable = function(editable) {
        if (!editable)  {
            order.label
                .name(form.find('.name').val())
                .company(form.find('.company').val())
                .address(form.find('.address').val())
                .address2(form.find('.address2').val())
                .city(form.find('.city').val())
                .state(form.find('.state').val())
                .zip(form.find('.zip').val())
                .deliverdate($('#datepicker').val());
            var addressString =
                order.label.name() + '\n' +
                    (order.label.company() ? order.label.company() + '\n' : '') +
                    order.label.address() + '\n' +
                    (order.label.address2() ? order.label.address2() + '\n' : '') +
                    order.label.city() + ' ' + order.label.state() + ' ' + order.label.zip();
            form.find('.ship-to').text(addressString);
            form.find('.deliver-date').text(order.label.deliverdate());
        }
        form.find('.ship-to').toggle(!editable);
        form.find('.deliver-date').toggle(!editable);
        form.find('input, label').toggle(editable);
    };

    this.submit = function() {
        // TODO go to next section
    };

//    $('#label .zip').keyup(function() {
//        if ($('#label .zip').val().length == 5) {
//            $('footer.pack').removeClass('slide-down');
//        } else {
//            $('footer.pack').addClass('slide-down');
//        }
//    });
}

$.extend(PackManager.prototype, {
    validArrivalDate: function(arrivalDate) {
        return this.datePicker.validArrivalDate(new Date($('#datepicker').val()));
    },
    validName: function(name) {return name;},
    validAddress: function(address) {return address;},
    validCity: function(city) {return city;},
    validState: function(state) {
        return (/^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[ANU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/).test(state.toUpperCase());
    },
    validZip: function(zip) {
        return (/^\d{5}$/).test(zip);
    }
});

DatePicker = function(element) {
    element.datepicker({
        format: 'mm/dd/yyyy',
        onRender: $.proxy(function(date) {
            return !this.validArrivalDate(date) ? '' : 'disabled';
        }, this)
    }).data('datepicker').setValue(this.getFirstArrivalDate());

    this.getFirstArrivalDate = function() {
        var startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Earliest delivery is next day
        if (startDate.getUTCHours() >= 20) {
            startDate.setDate(startDate.getDate() + 1); // After 1PM, won't ship until next day
        }

        var daysToAdd = 0;
        switch (startDate.getDay()) {
            case 0: daysToAdd = 2; break; // Sunday - can't deliver until Tue
            case 1: daysToAdd = 1; break; // Monday - can't deliver until Tue
            case 6: daysToAdd = 3; break; // Saturday - can't deliver until Tue
        }
        startDate.setDate(startDate.getDate() + daysToAdd);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    };

    this.validArrivalDate = function() {
        var date = element.data('datepicker').date;
        return this.getFirstArrivalDate().valueOf() <= date.valueOf() && $.inArray(date.getDay(), [0, 1, 6]) == -1;
    }
};

var PayManager = function(elementSelectors, order) {
    var checkoutWindow = $(elementSelectors.checkoutWindow);
    var payForm = $(elementSelectors.payForm);

    // Get publishable key
    $.get(Urls.STRIPE_GET_PUBLISHABLE_KEY).done(function(result) {
        Stripe.setPublishableKey(result);
    });

    // Initialize credit card year and month fields
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    for (var i = 0; i < 12; i++) {
        $(".card-expiry-year").append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"));
        $(".card-expiry-month").append($("<option value='"+i+"' "+(month === i ? "selected" : "")+">"+i+"</option>"));
    }

    // add custom rules for credit card validating
    jQuery.validator.addMethod("cardNumber", Stripe.validateCardNumber, "Please enter a valid card number");
    jQuery.validator.addMethod("cardCVC", Stripe.validateCVC, "Please enter a valid security code");
    jQuery.validator.addMethod("cardExpiry", function() {
        return Stripe.validateExpiry($(".card-expiry-month").val(), $(".card-expiry-year").val())
    }, "Please enter a valid expiration");

    // We use the jQuery validate plugin to validate required params on submit
    payForm.validate({
        submitHandler: this.submit,
        rules: {
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

    this.displayOrderSummary = function() {
        var flavorQuantitiesContainer = checkoutWindow.find('ul');
        flavorQuantitiesContainer.empty();
        $.each(order.cheesecakes.getUnique(), function(i, v) {
            flavorQuantitiesContainer.append(
                '<li>' + v.quantity + 'x ' + v.name + '</li>'
            );
        });
    },

        this.paymentComplete = function() {
            // TODO go to payment complete
        },

        this.addInputNames = function() {
            // Not ideal, but jQuery's validate plugin requires fields to have names
            // so we add them at the last possible minute, in case any javascript
            // exceptions have caused other parts of the script to fail.
            payForm.find('.card-number').attr('name', 'card-number');
            payForm.find('.card-cvc').attr('name', 'card-cvc');
            payForm.find('.card-expiry-year').attr('name', 'card-expiry-year');
        },

        this.removeInputNames = function() {
            payForm.find('.card-number, .card-cvc, .card-expiry-year').removeAttr('name');
        },

        this.submit = function(form) {
            // remove the input field names for security
            // we do this *before* anything else which might throw an exception
            this.removeInputNames(); // THIS IS IMPORTANT!

            // given a valid form, submit the payment details to stripe
            $(form['submit-button']).attr('disabled', 'disabled')
            checkoutWindow.find('.loading > *').addClass('active');

            order.billingInfo.name(payForm.find('.name').val());
            order.billingInfo.email(payForm.find('.email').val());

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
                            arrivalDate: order.label.deliverdate(),
                            giftMessage: order.giftMessage(),
                            giver: {
                                emailAddress: order.billingInfo.email(),
                                name: order.billingInfo.name()
                            }
                        }
                    }
                    $.ajax({
                        url: Urls.STRIPE_CHARGE,
                        method: 'post',
                        contentType: 'application/json',
                        processData: false,
                        data: JSON.stringify(sale)
                    }).done(function(response) {
                            if (response.paid) {
                                paymentComplete();
                            } else if (response.backendFailure) {
                                payForm.find('.payment-errors').show().html('There was an error processing your order. Please try again.');
                            } else {
                                payForm.find('.payment-errors').show().html(response.failureMessage);
                            }
                        }).fail(function() {
                            payForm.find('.payment-errors').show().html('There was an error processing your order. Please try again.');
                        }).always(function() {
                            $(form['submit-button']).removeAttr('disabled');
                            checkoutWindow.find('.loading > *').removeClass('active');
                        });
                }
            });

            return false;
        }
};

var OrderCompleteManager = function(elementSelectors, order) {
    var element = $(elementSelectors.main);

    this.refreshSummaryFields = function() {
        element.find('.email').text(order.billingInfo.email());
        element.find('.recipient').text(order.label.name());
        element.find('.delivery-date').text(moment(order.label.deliverdate()).format('MMMM Do YYYY'));

    }

}