//skrollr object
var S;

// Utility functions
var Utils = {

    // Returns true if unning on a mobile device
    isMobile: function() {
        if (this._isMobile === undefined) {
            this._isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        }
        return this._isMobile;
    },

    getSetProp: function(name, value, context) {
        return (value && (context[name] = value) && context) || context[name];
    },

    // Gets the current height of the viewport
    getViewportHeight: function() {
        this._viewportHeight = this._viewportHeight || $(window).height();
        return this._viewportHeight;
    },

    // Gets the current height of each section
    getSectionHeight: function() {
        return this.getViewportHeight() * 2;
    },

    // Gets the height of the viewport prior to the most recent window resize
    getPreviousViewportHeight: function() {
        return this._previousViewportHeight;
    },

    NUM_CHEESECAKE_SLOTS: 8
};

// Update viewport functions on resize;
(function() {
    $(window).resize(function(e) {
        Utils._previousViewportHeight = Utils._viewportHeight;
        Utils._viewportHeight = $(window).height();

        // Reposition skrollr to account for size change
        S.setScrollTop(S.getScrollTop() * Utils.getViewportHeight() / Utils.getPreviousViewportHeight(), true);
    });
})();

var Urls = {
    STRIPE_GET_PUBLISHABLE_KEY: '/stripe/getPublishableKey',
    STRIPE_CHARGE: '/stripe/charge',
    PRODUCT_GET_DUMP: '/product/getDump'
}

var BOUNDARIES = {
    PICK_TO_PERSONALIZE: {
        name: 'PICK_TO_PERSONALIZE',
        friendlyName: 'pick',
        position: function() {
            return Utils.getSectionHeight() * 1 - 2 * Utils.getViewportHeight() + $('header').height();
        }
    },
    PERSONALIZE_TO_PACK: {
        name: 'PERSONALIZE_TO_PACK',
        friendlyName: 'personalize',
        position: function() {
            return Utils.getSectionHeight() * 2 - 2 * Utils.getViewportHeight();
        }
    },
    PACK_TO_PAY: {
        name: 'PACK_TO_PAY',
        friendlyName: 'pack',
        position: function() {
            return Utils.getSectionHeight() * 3 - 2 * Utils.getViewportHeight();
        }
    },
    PAY_TO_ORDER_COMPLETE: {
        name: 'PAY_TO_ORDER_COMPLETE',
        friendlyName: 'pay',
        position: function() {
            return Utils.getSectionHeight() * 4 - 2 * Utils.getViewportHeight();
        }
    },
    END: {
        name: 'END',
        friendlyName: 'orderComplete',
        position: function() {
            return Utils.getSectionHeight() * 5 - 2 * Utils.getViewportHeight();
        }
    }
}

// Should not be called until S has been initialized.
// Clears registered boundaries.
var ScrollBoundaryManager = function() {
    if (!S) {
        throw "Initialize the skrollr object (S) first."
    }
    var boundaries = [];
    S.on('beforerender', function(e) {

        // Call the handler function of every boundary that is about to be crossed
        for(var i = 0; i < boundaries.length; i++) {
            var boundary = boundaries[i];
            if ((e.curTop > boundary.position && e.lastTop <= boundary.position) // Crossing down over the boundary
                || (e.curTop <= boundary.position && e.lastTop > boundary.position)) { // Crossing up over the boundary
                if(boundary.handler(e) === false) { // handler function called, the boundary should not be crossed
                    S.setScrollTop(boundary.position, false);
                    return false;
                };
            }
        }
    });

    // Registers a function to be called when the user scrolls to a specified location.
    // boundary - Can be any one of BOUNDARIES or a pixel position of a boundary (at the bottom of the viewport).
    // onBoundary - The function to notify when the boundary is crossed. Should return false if the user should not be allowed to scroll past the boundary.
    this.registerBoundary = function(boundary, onBoundary) {
        boundaries.push({position: getBoundaryPosition(boundary), handler: onBoundary});
        return this;
    };

    // Gets the position of the top of the viewport in pixels for any boundary.
    // boundary - Can be any one of BOUNDARIES or a pixel position of a boundary (at the bottom of the viewport).
    function getBoundaryPosition(boundary) {
        // Accounts for the fact that boundaries at positions at the bottom of the window.
        return (BOUNDARIES[boundary.name] && BOUNDARIES[boundary.name].position() || boundary - Utils.getViewportHeight());
    };

    // Removes all of the boundary registrations.
    this.unregisterAllBoundaries = function() {
        boundaries = [];
        return this;
    };
}

var Order = function() {
    var Cheesecakes = function() {
        var cheesecakeSlots = [];

        this.getUnique = function() {
            var idMap = {};
            return $.grep(cheesecakeSlots, function(v, i) {

                // ignore open slots
                if(!v) {
                    return false;
                }

                if (!idMap[v.id]) { // This is the first occurrence of the flavor v
                    v.quantity = 1;
                    idMap[v.id] = v;
                    return true;
                } else { // We have seen this flavor before
                    idMap[v.id].quantity++;
                    return false;
                }
            });
        };

        this.openSlots = function() {
            var openSlots = 0;
            for(var i = 0; i < Utils.NUM_CHEESECAKE_SLOTS; i++) {
                if (!cheesecakeSlots[i]) {
                    openSlots++;
                }
            }
            return openSlots;
        };

        this.isFull = function() {
            return this.openSlots() == 0;
        }

        this.add = function(flavor) {
            for(var i = 0; i < Utils.NUM_CHEESECAKE_SLOTS; i++) {
                if (!cheesecakeSlots[i]) {
                    cheesecakeSlots[i] = flavor;
                    return i;
                }
            }
            return false;
        };

        this.remove = function(slot) {
            var removedCheesecake = cheesecakeSlots[slot];
            cheesecakeSlots[slot] = undefined;
            return removedCheesecake;
        };

        this.all = function(cheesecakes) {
            if (cheesecakes) {
                cheesecakeSlots = cheesecakes;
                return this;
            }
            return cheesecakeSlots;
        }
    }
    this.cheesecakes = new Cheesecakes();

    this.giftMessage = [
        'Grandma Jane,',
        '',
        'Happy 83rd birthday!  Thank you for another year of fun, joy, and love.  We hope you enjoy this all natural delicious dessert!',
        '',
        'With much love,',
        'Jack and Jill'
    ].join('\n');

    var Label = function() {
        this.name        = function(name) { return Utils.getSetProp('_name', name, this) };
        this.company     = function(company) { return Utils.getSetProp('_company', company, this) };
        this.address     = function(address) { return Utils.getSetProp('_address', address, this) };
        this.address2    = function(address2) { return Utils.getSetProp('_address2', address2, this) };
        this.city        = function(city) { return Utils.getSetProp('_city', city, this) };
        this.state       = function(state) { return Utils.getSetProp('_state', (state || '').toUpperCase(), this); };
        this.zip         = function(zip) { return Utils.getSetProp('_zip', zip, this) };
        this.deliverdate = function(deliverdate) { return Utils.getSetProp('_deliverdate', deliverdate, this) };

        this.all = function(data) {
            if (data) {
                this.name(data.name)
                this.company(data.company)
                this.address(data.address)
                this.address2(data.address2)
                this.city(data.city)
                this.state(data.state)
                this.zip(data.zip)
                this.deliverdate(data.deliverdate);
                return this;
            } else {
                return {
                    name: this.name(),
                    company: this.company(),
                    address: this.address(),
                    address2: this.address2(),
                    city: this.city(),
                    state: this.state(),
                    zip: this.zip(),
                    deliverdate: this.deliverdate()
                };
            }
        }
    }
    this.label = new Label();

    var BillingInfo = function() {
        this.name           = function(name) { return Utils.getSetProp('_name', name, this) };
        this.email          = function(email) { return Utils.getSetProp('_email', email, this) };
        this.stripeToken    = function(stripeToken) { return Utils.getSetProp('_stripeToken', stripeToken, this) };

        this.all = function(data) {
            if (data) {
                this.name(data.name)
                this.email(data.email)
                this.stripeToken(data.stripeToken);
                return this;
            } else {
                return {
                    name: this.name(),
                    email: this.email(),
                    stripeToken: this.stripeToken()
                };
            }
        }
    }
    this.billingInfo = new BillingInfo();

    this.toString = function() {
        return JSON.stringify({
            cheesecakes: this.cheesecakes.all(),
            giftMessage: this.giftMessage,
            label: this.label.all(),
            billingInfo: this.billingInfo.all()
        });
    }

    this.parse = function(string) {
        if (string && string !== "undefined") {
            order = JSON.parse(string);
            this.cheesecakes.all(order.cheesecakes);
            this.giftMessage = order.giftMessage;
            this.label.all(order.label);
            this.billingInfo.all(order.billingInfo);
        }
        return this;
    }
}



//var FaqPopover = function() {
//    $('.questions > a').popover({
//        placement: 'bottom',
//        content: $('.questions-content').html(),
//        html: true
//    });
//};

var FlavorManager = function() {
    var flavors;

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
var PickManager = function(elementSelectors, order, onPickComplete) {
    var flavorCarousel;
    var flavorManager = new FlavorManager().loadFlavors(function(flavors) {
        flavorCarousel = new FlavorCarousel({
            main: elementSelectors.carousel + ' .well',
            leftArrow: elementSelectors.carousel + ' .arrow-left',
            rightArrow: elementSelectors.carousel + ' .arrow-right',
            hiddenImages: '#hidden-image-loading-container'
        }, flavorManager)
    });

    $(elementSelectors.showNutritionLabelButton).click(function() {
        $(this).hide();
        $(elementSelectors.moreInfo).addClass('show-nutrition-label')
    });

    $(elementSelectors.moreInfoButton).click($.proxy(function() {
        displayMoreInfo(flavorCarousel.getSelectedFlavor());
    }, this));

    $(elementSelectors.addButton).click($.proxy(function() {
        this.pickCheesecake(flavorCarousel.getSelectedFlavor());
    }, this));

    $.each(order.cheesecakes.all(), function(i, v) {
        if (v) {
            displayCheesecake(i + 1,  v);
        }
    })

    function displayMoreInfo(flavor) {
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

    this.disable = function() {
        $(elementSelectors.addButton).addClass('disabled');
        $(elementSelectors.tray1 + ', ' + elementSelectors.tray2).find('.cheesecake').off('click');
    };

    this.pickCheesecake = function(flaovr) {
        var flavor = flavorCarousel.getSelectedFlavor();
        var slot = order.cheesecakes.add(flavor);

        if (slot === false) {
            return;
        }

        displayCheesecake(slot + 1, flavor);
    }

    function displayCheesecake(cheesecakeNumber, flavor) {
        if (order.cheesecakes.openSlots() == 0) {
            $(elementSelectors.addButton).addClass('disabled');
            onPickComplete();
        }

        var parentContainer;
        if (cheesecakeNumber <= Utils.NUM_CHEESECAKE_SLOTS/2) {
            parentContainer = $(elementSelectors.tray1);
        } else {
            parentContainer = $(elementSelectors.tray2);
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $(
            '<img class="cheesecake cheesecake' + cheesecakeNumber + '" src="' + flavor.bareImageUrl + '">')
            .appendTo(parentContainer)
            .popover({
                placement: 'top',
                content: function() {
                    return $(
                        '<div class="flavor-label">' + flavor.name + '</div>' +
                            '<div class="btn-container btn-container' + cheesecakeNumber + '">' +
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
            })
            .animate({opacity: 1}, 500);

        cheesecake.parent().delegate('.btn-container' + cheesecakeNumber + ' .btn-more-info', 'click', $.proxy(function() {
            displayMoreInfo(flavor);
        }, this)).delegate('.btn-container' + cheesecakeNumber + ' .btn-remove', 'click', function() {
            order.cheesecakes.remove(cheesecakeNumber - 1);
            cheesecake.popover('hide').animate({opacity: 0}, 500, function() {
                cheesecake.remove();
            })
            $(elementSelectors.addButton).removeClass('disabled');
            $('footer').addClass('out');
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

    this.preloadSelectedBareImage = function() {
        $(elementSelectors.hiddenImages).append(
            '<img src="' + this.getSelectedFlavor().bareImageUrl + '" />'
        );
    };

    this.getSelectedFlavor = function() {
        return flavorManager.getFlavorById($(elementSelectors.main).find('.flavor.active').attr('data-id'));
    }

    this.addFlavor = function(flavor) {
        $(elementSelectors.main).find('.scroll').append(
            '<li class="flavor" data-id="' + flavor.id + '">' +
                (flavor.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                '<img src="' + flavor.stageImageUrl + '"/>' +
                '<div class="flavor-label">' + flavor.name + '</div>' +
                '</li>'
        );
    };

    this.addAllFlavors = function(flavors) {
        $.each(flavors, $.proxy(function(i, v) {
            this.addFlavor(v);
        }, this));
    };
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

    }).sly('on', 'change', $.proxy(this.preloadSelectedBareImage, this));
};

var PersonalizeManager = function(elementSelectors, order, onPersonalizeComplete) {
    var mainElement = $(elementSelectors.main);
    mainElement.find('.edit-message-label').click($.proxy(function() { this.makeEditable(true) }, this));
    mainElement.find('.btn-save').click($.proxy(function() {
        this.makeEditable(false);
        isEdited = true;
        onPersonalizeComplete();
    }, this));
    mainElement.find('textarea').text(order.giftMessage);
    var isEdited = false;

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

    this.disable = function() {
        this.makeEditable(false);
        mainElement.find('.edit-message-label').hide();
    };

    this.isEdited = function() {
        return isEdited;
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

var PackManager = function(elementSelectors, order, onPackComplete) {
    var form = $(elementSelectors.main);
    var isValid = false;
    var datePicker = new DatePicker($('#datepicker'));

    form.find('.edit').click($.proxy(function() {
        isValid = false;
        this.makeEditable(true);
        S.setScrollTop(BOUNDARIES.PACK_TO_PAY.position());
    }, this));

    form.find('.arrival-date').val(order.label.deliverdate());
    form.find('.name').val(order.label.name());
    form.find('.company').val(order.label.company());
    form.find('.address').val(order.label.address());
    form.find('.address2').val(order.label.address2());
    form.find('.city').val(order.label.city());
    form.find('.state').val(order.label.state());
    form.find('.zip').val(order.label.zip());


    jQuery.validator.addMethod("packArrivalDate", function() {
        // This is the format expected by the back-end.
        order.label.deliverdate(datePicker.getValue());
        return datePicker.validArrivalDate();
    }, "Select a valid arrival date.");

    jQuery.validator.addMethod("packName", function(name) {
        order.label.name(name);
        return name;
    }, "Enter the recipient's name.");

    jQuery.validator.addMethod("packCompany", function(company) {
        order.label.company(company);
        return true;
    }, "Enter the recipient's company.");

    jQuery.validator.addMethod("packAddressLine1", function(address) {
        order.label.address(address);
        return address;
    }, "Enter the recipient's address");

    jQuery.validator.addMethod("packAddressLine2", function(address2) {
        order.label.address2(address2);
        return true;
    }, "Enter the recipient's address");

    jQuery.validator.addMethod("packCity", function(city) {
        order.label.city(city);
        return city;
    }, "Enter the recipient's city");

    jQuery.validator.addMethod("packState", function(state) {
        order.label.state(state);
        return (/^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[ANU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/).test(state.toUpperCase());
    }, "Enter the recipient's state");

    jQuery.validator.addMethod("packZip", function(zip) {
        order.label.zip(zip);
        return (/^\d{5}$/).test(zip);
    }, "Enter the recipient's zip code");

    form.validate({
        submitHandler: $.proxy(function(e) {
            isValid = true;
            onPackComplete();
            this.makeEditable(false);
        }, this),
        showErrors: function(errorMap, errorList) {
            console.log(errorMap);
            console.log(errorList);
            var error = errorList[0];
            var errorContainer = form.find('.form-errors');
            if (error) {
                isValid = false;
                errorContainer.text(error.message);
            }
            errorContainer.toggleClass('in', error != undefined).toggleClass('out', error == undefined);
        },

        onkeyup: false,
        onfocusout: false,

        rules: {
            'arrival-date': {
                packArrivalDate: true
            },
            'name': {
                packName: true
            },
            'company': {
                packCompany: true
            },
            'addressLine1': {
                packAddressLine1: true
            },
            'addressLine2': {
                packAddressLine2: true
            },
            'city': {
                packCity: true
            },
            'state': {
                packState: true
            },
            'zip': {
                packZip: true
            }
        }
    });

    this.disable = function() {
        this.makeEditable(false);
        form.find('.edit').hide();
    };

    this.makeEditable = function(editable) {
        if (!editable)  {
            var addressString =
                order.label.name() + '\n' +
                    (order.label.company() ? order.label.company() + '\n' : '') +
                    order.label.address() + '\n' +
                    (order.label.address2() ? order.label.address2() + '\n' : '') +
                    order.label.city() + ' ' + order.label.state() + ' ' + order.label.zip();
            form.find('.ship-to').text(addressString);
            form.find('.deliver-date').text(moment(order.label.deliverdate()).format('YYYYMMDD'));
        }
        form.find('.ship-to, .deliver-date, .edit').toggle(!editable);
        form.find('input, label, button').toggle(editable);
    };

    this.isValid = function() {
        return isValid;
    };
}

DatePicker = function(element) {
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

    this.getValue = function() {
        return element.data('datepicker').date;
    }

    this.validArrivalDate = function(date) {
        date = date || this.getValue();
        return this.getFirstArrivalDate().valueOf() <= date.valueOf() && $.inArray(date.getDay(), [0, 1, 6]) == -1;
    }

    element.datepicker({
        format: 'mm/dd/yyyy',
        onRender: $.proxy(function(date) {
            return this.validArrivalDate(date) ? '' : 'disabled';
        }, this)
    }).data('datepicker').setValue(this.getFirstArrivalDate());
};

var PayManager = function(elementSelectors, order, onPaymentComplete) {
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
                }
                $.ajax({
                    url: Urls.STRIPE_CHARGE,
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
    }

    this.isPaymentComplete = function() {
        return isPaymentComplete;
    }

    // Get publishable key
    $.get(Urls.STRIPE_GET_PUBLISHABLE_KEY).done(function(result) {
        Stripe.setPublishableKey(result);
    });

    // Initialize credit card year and month fields
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    for (var i = 0; i < 12; i++) {
        $(".card-expiry-year").append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"));
        $(".card-expiry-month").append($("<option value='"+ (i + 1) +"' "+(month === i + 1 ? "selected" : "")+">"+ (i + 1) +"</option>"));
    }

    // add custom rules for credit card validating
    jQuery.validator.addMethod("billingName", function(name) {
        order.billingInfo.name(name);
        return name;
    }, "Enter name on credit card.");

    jQuery.validator.addMethod("billingEmail", function(email) {
        order.billingInfo.email(email);
        return email;
    }, "Enter your email.");

    jQuery.validator.addMethod("cardNumber", Stripe.validateCardNumber, "Please enter a valid card number");
    jQuery.validator.addMethod("cardCVC", Stripe.validateCVC, "Please enter a valid security code");
    jQuery.validator.addMethod("cardExpiry", function() {
        return Stripe.validateExpiry($(".card-expiry-month").val(), $(".card-expiry-year").val())
    }, "Please enter a valid expiration");

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

var OrderCompleteManager = function(elementSelectors, order) {
    var element = $(elementSelectors.main);
    element.find('.new-order').click(function() {
        location.reload();
    });

    this.refreshSummaryFields = function() {
        element.find('.email').text(order.billingInfo.email());
        element.find('.recipient').text(order.label.name());
        element.find('.delivery-date').text(moment(order.label.deliverdate()).format('MMMM Do YYYY'));

    }
};

function main() {
    var store = new Persist.Store('GiveCheesecakes');

    store.remove('incompleteOrder'); // Remove this line to activate local storage
    var order = new Order().parse(store.get('incompleteOrder'));
    console.log(order);

    var pickManager = new PickManager({
        carousel: '#flavor-carousel',
        moreInfoButton: '#selected-cheesecake-btns .btn-more-info',
        addButton: '#selected-cheesecake-btns .btn-add',
        moreInfo: '#more-info',
        showNutritionLabelButton: '.btn-show-nutrition-label',
        tray1: '#tray1',
        tray2: '#tray2'
    }, order, function() {
        S.animateTo(BOUNDARIES.PERSONALIZE_TO_PACK.position(), {duration: 4000, easing: 'swing'});
    });

    var personalizeManager = new PersonalizeManager({
        main: '#gift-message'
    }, order, function() {
        S.animateTo(BOUNDARIES.PACK_TO_PAY.position(), {duration: 3000, easing: 'swing'});
    });

    var packManager = new PackManager({
        main: '#label form'
    }, order, function() {
        S.animateTo(BOUNDARIES.PAY_TO_ORDER_COMPLETE.position(), {duration: 3000, easing: 'swing'});
    });

    var payManager = new PayManager({
        payForm: '#checkout-window form',
        checkoutWindow: '#checkout-window'
    }, order, function() {
        store.remove('incompleteOrder');
        pickManager.disable();
        personalizeManager.disable();
        packManager.disable();
        payManager.disable();
        S.animateTo(BOUNDARIES.END.position(), {duration: 3000, easing: 'swing'});
    });

    var orderCompleteManager = new OrderCompleteManager({
        main: '#order-complete'
    }, order);

    S = skrollr.init({
        constants: {},
        forceHeight: false
    });
    skrollr.menu.init(S);
    S.setScrollTop(0);

    var scrollBoundaryManager = new ScrollBoundaryManager();


    function registerBoundaries() {
        scrollBoundaryManager
            .unregisterAllBoundaries()
            .registerBoundary(BOUNDARIES.PICK_TO_PERSONALIZE, function(e) {
                //console.log(e);
                if (e.direction === "down") {
                    if (!order.cheesecakes.isFull()) {
                        return false;
                    } else {
                        pushBoundary(BOUNDARIES.PICK_TO_PERSONALIZE );
                        personalizeManager.displayPickedCheesecakesInfo();
                    }
                } else {
                    pushBoundary(BOUNDARIES.PICK_TO_PERSONALIZE );
                }
            })
            .registerBoundary(BOUNDARIES.PERSONALIZE_TO_PACK, function(e) {
                //console.log(e);
                if (e.direction === "down") {
                    if (!personalizeManager.isEdited()) {
                        return false;
                    } else {
                        pushBoundary(BOUNDARIES.PERSONALIZE_TO_PACK);
                    }
                } else {
                    pushBoundary(BOUNDARIES.PERSONALIZE_TO_PACK);
                }
            })
            .registerBoundary(BOUNDARIES.PACK_TO_PAY, function(e) {
                //console.log(e);
                if (e.direction === "down") {
                    if (!packManager.isValid()) {
                        return false;
                    } else {
                        pushBoundary(BOUNDARIES.PACK_TO_PAY);
                        payManager.displayOrderSummary();
                    }
                } else {
                    pushBoundary(BOUNDARIES.PACK_TO_PAY);
                }
            })
            .registerBoundary(BOUNDARIES.PAY_TO_ORDER_COMPLETE, function(e) {
                //console.log(e);
                if (e.direction === "down") {
                    if (!payManager.isPaymentComplete()) {
                        return false;
                    } else {
                        pushBoundary(BOUNDARIES.PAY_TO_ORDER_COMPLETE);
                        orderCompleteManager.refreshSummaryFields();
                    }
                } else {
                   pushBoundary(BOUNDARIES.PAY_TO_ORDER_COMPLETE);
                }
            });
    }
    registerBoundaries();

    $(window).resize(function(e) {
        registerBoundaries();
    }).unload(function() {
        !payManager.isPaymentComplete() && store.set('incompleteOrder', order.toString());
    });

    $('body').show();

    function pushBoundary(boundary) {
        history.pushState(null, null, '#' + boundary.friendlyName);
    }
}
main();