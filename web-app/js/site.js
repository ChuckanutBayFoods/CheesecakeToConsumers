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


    // Capitalizes the first letter of the given string
    capitalise: function(string) {
        return !string || string.charAt(0).toUpperCase() + string.slice(1);
    },

    removeClassFromAll: function(className) {
        return $('.' + className).removeClass(className);
    }
};

var Pay = {
    init: function() {
        // Get publishable key
        $.get('/stripe/getPublishableKey').done(function(result) {
            Stripe.setPublishableKey(result);
        });

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
        $("#pay-form").validate({
            submitHandler: Pay.submit,
            rules: {
                "card-cvc" : {
                    cardCVC: true,
                    required: true
                },
                "card-number" : {
                    cardNumber: true,
                    required: true
                },
                "card-expiry-year" : "cardExpiry" // we don't validate month separately
            }
        });

        $("footer.order-complete").click(function() {
            location.reload();
        });

        // adding the input field names is the last step, in case an earlier step errors
        this.addInputNames();
    },

    displayOrderSummary: function() {
        var flavorQuantitiesContainer = $('#checkout-window ul');
        flavorQuantitiesContainer.empty();
        $.each(Flavors.getUniquePickedCheesecakes(), function(i, v) {
            flavorQuantitiesContainer.append(
                '<li>' + v.quantity + 'x ' + v.name + '</li>'
            );
        });
    },

    paymentComplete: function() {
        sectionTransitionFunctions.fromPayToOrderComplete();
        isOrderComplete = true;
        $('#order-complete .email').text($('#checkout-window .email').val());
        $('#order-complete .recipient').text($('#label input.name').val());
        $('#order-complete .delivery-date').text(moment($('#label #datepicker').val()).format('MMMM Do YYYY'));
    },

    addInputNames: function() {
        // Not ideal, but jQuery's validate plugin requires fields to have names
        // so we add them at the last possible minute, in case any javascript
        // exceptions have caused other parts of the script to fail.
        $(".card-number").attr("name", "card-number")
        $(".card-cvc").attr("name", "card-cvc")
        $(".card-expiry-year").attr("name", "card-expiry-year")
    },

    removeInputNames: function() {
        $(".card-number").removeAttr("name")
        $(".card-cvc").removeAttr("name")
        $(".card-expiry-year").removeAttr("name")
    },

    submit: function(form) {
        // remove the input field names for security
        // we do this *before* anything else which might throw an exception
        this.removeInputNames(); // THIS IS IMPORTANT!

        // given a valid form, submit the payment details to stripe
        $(form['submit-button']).attr("disabled", "disabled")
        $('#checkout-window .loading > *').addClass('active');

        Stripe.createToken({
            number: $('.card-number').val(),
            cvc: $('.card-cvc').val(),
            exp_month: $('.card-expiry-month').val(),
            exp_year: $('.card-expiry-year').val()
        }, function(status, response) {
            if (response.error) {
                // re-enable the submit button
                $(form['submit-button']).removeAttr("disabled");
                $('#checkout-window .loading > *').removeClass('active');

                // show the error
                $(".payment-errors").show().html(response.error.message);

                // we add these names back in so we can revalidate properly
                this.addInputNames();
            } else {
                $(".payment-errors").hide();
                var sale = {
                    sale: {
                        stripeToken: response['id'],
                        recipient: {
                            name: $('#label input.name').val(),
                            companyName: $('#label input.company').val(),
                            addressLine1: $('#label input.address').val(),
                            addressLine2: $('#label input.address2').val(),
                            city: $('#label input.city').val(),
                            state: $('#label input.state').val(),
                            zipCode: $('#label input.zip').val(),
                            phoneNumber: 'Not Given'
                        },
                        saleItems: (function() {
                            var saleItems = [];
                            $.each(getUniquePickedCheesecakes(), function(i, v) {
                                saleItems.push({
                                    quantity: v.quantity,
                                    product: {
                                        id: v.id
                                    }
                                });
                            });
                            return saleItems;
                        })(),
                        arrivalDate: $('#label #datepicker').val(),
                        giftMessage: $('#gift-message .non-edit pre').text(),
                        giver: {
                            emailAddress: $('#checkout-window .email').val(),
                            name: $('#checkout-window .name').val()
                        }
                    }
                }
                $.ajax({
                    url: '/stripe/charge',
                    method: 'post',
                    contentType: 'application/json',
                    processData: false,
                    data: JSON.stringify(sale)
                }).done(function(response) {
                    if (response.paid) {
                        paymentComplete();
                    } else if (response.backendFailure) {
                        $(".payment-errors").show().html("There was an error processing your order. Please try again.");
                    } else {
                        $(".payment-errors").show().html(response.failureMessage);
                    }
                }).fail(function() {
                    $(".payment-errors").show().html("There was an error processing your order. Please try again.");
                }).always(function() {
                    $(form['submit-button']).removeAttr("disabled");
                    $('#checkout-window .loading > *').removeClass('active');
                });
            }
        });

        return false;
    }
};

var QuestionsPopover = {
    init: function() {
        $('.questions > a').popover({
            placement: 'bottom',
            content: $('.questions-content').html(),
            html: true
        });
    }
};

var Flavors = {
    _flavorData: [],
    _pickedCheesecakes: [],

    init: function() {
        $.get('/product/getDump').done(function (result) {
            Flavors._flavorData = result;
            $.each(Flavors._flavorData, function(i, v) {
                Pick.flavorCarousel.addFlavor(v);
            });
            Pick.flavorCarousel.init();
        });
    },

    getFlavorById: function(id) {
        var flavor;
        $.each(this._flavorData, function(i, v) {
            if (v.id == id) {
                flavor = v;
                return false;
            }
        });
        return flavor;
    },

    getUniquePickedCheesecakes: function() {
        return $.grep(this._pickedCheesecakes, function(v, i) {
            if(!v || !i) {
                return false;
            }
            if ($.inArray(v, Flavors._pickedCheesecakes) === i) {
                v.quantity = 1;
                return true;
            } else {
                v.quantity++;
                return false;
            }
        });
    },

    pickCheesecake: function(flavor) {
        var openSlot = this.findOpenCheesecakeSlot();
        if (openSlot) {
            this._pickedCheesecakes[openSlot] = flavor;
        }
        return openSlot;
    },

    removeCheesecake: function(slot) {
        this._pickedCheesecakes[slot] = null;
    },

    findOpenCheesecakeSlot: function() {
        for(var i = 1; i <= 8; i++) {
            if (!this._pickedCheesecakes[i]) {
                return i;
            }
        }
        return false;
    }

};

var Pick = {
    init: function() {
        $('.btn-show-nutrition-label').click(function() {
            $(this).hide();
            $('#more-info').addClass('show-nutrition-label')
        });

        $('#selected-cheesecake-btns .btn-more-info').click(function() {
            Pick.displayMoreInfo(Pick.flavorCarousel.getSelectedFlavor());
        });

        $('#selected-cheesecake-btns .btn-add').click(function() {
            Pick.pickCheesecake(Pick.flavorCarousel.getSelectedFlavor());
        });

        $("footer.pick").click(function() {
            NavigationManager.gotoSection('personalize');
        });
    },

    displayMoreInfo: function(flavor) {
        var moreInfoWindow = $('#more-info').removeClass('show-nutrition-label').modal();
        $('.btn-show-nutrition-label').show();
        moreInfoWindow.find('h3').text(flavor.name);
        moreInfoWindow.find('.staged-image').attr('src', flavor.stageImageUrl);
        moreInfoWindow.find('.description').text(flavor.description);
        moreInfoWindow.find('.ingredients').text(flavor.ingredients);
        moreInfoWindow.find('.allergens').text(flavor.allergens);
        moreInfoWindow.find('.nutrition-label').attr('src', flavor.nutritionLabelImageUrl);
    },

    pickCheesecake: function(flavor) {
        var flavor = Flavors.getFlavorById($('.flavor.active').attr('data-id'));
        var slot = Flavors.pickCheesecake(flavor);

        if (!slot) {
            return;
        }

        if (slot == 8) {
            $('#selected-cheesecake-btns .btn-add').addClass('disabled');
            $("footer.pick").removeClass('slide-down');
            NavigationManager.enableSection('personalize');
        }

        var parentContainer;
        if (slot <= 4) {
            parentContainer = $('#tray1');
        } else {
            parentContainer = $('#tray2');
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $(
            '<img class="cheesecake cheesecake' + slot + '" src="' + flavor.bareImageUrl + '">' +
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
                if (NavigationManager._currentSection != 'pick') {
                    return;
                }
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
                Flavors.removeCheesecake(slot);
                cheesecake.popover('hide').animate({top: '+=100'}, 500, function() {
                    cheesecake.remove();
                });
                $('.btn-success').removeClass('disabled');
                $("footer.pick").addClass('slide-down');
                disableSection('personalize');
            });

        $(document).click(function(e) {
            if(isVisible && clickedAway) {
                cheesecake.popover('hide');
                isVisible = clickedAway = false;
            } else {
                clickedAway = true;
            }
        });
    },

    flavorCarousel: {
        _element: $('#flavor-carousel'),
        init: function() {
            // See http://darsa.in/sly/examples/horizontal.html
            this._element.find('.well').sly({
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

                // Buttons
                prev: this._element.find('.arrow-left'),
                next: this._element.find('.arrow-right'),

                change: function() {}
            }).sly('on', 'change', this.preloadSelectedBareImage);
        },

        addFlavor: function(flavor) {
            this._element.find('.scroll').append(
                '<li class="flavor" data-id="' + flavor.id + '">' +
                    (flavor.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                    '<img src="' + flavor.stageImageUrl + '"/>' +
                    '<div class="flavor-label">' + flavor.name + '</div>' +
                '</li>'
            );
        },

        preloadSelectedBareImage: function() {
            var flavor = Pick.flavorCarousel.getSelectedFlavor();
            $('#hidden-image-loading-container').append(
                '<img src="' + flavor.bareImageUrl + '" />'
            );
        },

        getSelectedFlavor: function() {
            return Flavors.getFlavorById($('.flavor.active').attr('data-id'));
        }
    }
}

var Personalize = {
    init: function() {
        $('#gift-message').find('pre, .edit-message-label').click(this.makeEditable(true));
        $('#gift-message .btn-save').click(this.makeEditable(false));

        $("footer.personalize").click(function() {
            NavigationManager.gotoSection('pack');
        });
    },

    displayPickedCheesecakesInfo: function() {
        var flavorInfoContainer = $('#gift-message .flavor-info-container');
        flavorInfoContainer.empty();
        $.each(Flavors.getUniquePickedCheesecakes(), function(i, v) {
            flavorInfoContainer.append(
                '<div class="flavor-info">' +
                    '<h5>' + v.name + '</h5>' +
                    '<div class="blurb">' + v.description + '</div>' +
                '</div>')
        });
    },

    makeEditable: function(editable) {
        if (editable) {
            $('textarea').val($('pre').text());
            $('#gift-message .non-edit').addClass('hide');
            $('#gift-message .edit').removeClass('hide');
        } else {
            $('pre').text($('textarea').val());
            $('#gift-message .non-edit').removeClass('hide');
            $('#gift-message .edit').addClass('hide');
        }
    }
}

var Pack = {
    init: function() {
        jQuery.validator.addMethod("packArrivalDate", function() {return this.datePicker.validArrivalDate(new Date($('#datepicker').val()));}, "Please select a valid arrival date.");
        jQuery.validator.addMethod("packName", this.validName, "Please enter the recipient's name.");
        jQuery.validator.addMethod("packAddressLine1", this.validAddress, "Please enter the recipient's address");
        jQuery.validator.addMethod("packCity", this.validCity, "Please enter the recipient's city");
        jQuery.validator.addMethod("packState", this.validState, "Please enter the recipient's state");
        jQuery.validator.addMethod("packZip", this.validZip, "Please enter the recipient's zip code");

        $("#pack-form").validate({
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

        $('#label .zip').keyup(function() {
            if ($('#label .zip').val().length == 5) {
                $('footer.pack').removeClass('slide-down');
            } else {
                $('footer.pack').addClass('slide-down');
            }
        });

        $('footer.pack').click(function() {
            $("#pack-form").submit();
        })

        this.datePicker.init();
    },

    submit: function() {
        NavigationManager.gotoSection('pay');
    },

    validName: function(name) {
        return name;
    },

    validAddress: function(name) {
        return name;
    },

    validCity: function(city) {
        return city;
    },

    validState: function(state) {
        return (/^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[ANU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/).test(state.toUpperCase());
    },

    validZip: function(zip) {
        return (/^\d{5}$/).test(zip);
    },

    makeEditable: function(editable) {
        if (editable) {
            $('#label .ship-to').hide();
            $('#label .deliver-date').hide();
            $('#label input, #label label').show();
        } else {
            var addressString =
                $('#label .name').val() + '\n' +
                ($('#label .company').val() ? $('#label .company').val() + '\n' : '') +
                $('#label .address').val() + '\n' +
                ($('#label .address2').val() ? $('#label .address2').val() + '\n' : '') +
                $('#label .city').val() + ' ' + $('#label .state').val() + ' ' + $('#label .zip').val();
            $('#label .ship-to').text(addressString).show();
            $('#label .deliver-date').text($('#datepicker').val()).show();
            $('#label input, #label label').hide();
        }
    },

    datePicker: {
        init: function() {
            $('#datepicker').datepicker({
                format: 'mm/dd/yyyy',
                onRender: function(date) {
                    return !Pack.datePicker.validArrivalDate(date) ? '' : 'disabled';
                }
            }).data('datepicker').setValue(this.getFirstArrivalDate());
        },

        getFirstArrivalDate: function() {
            var startDate = new Date();
            startDate.setDate(startDate.getDate() + 1); // Earliest delivery is next day
            if (startDate.getUTCHours() >= 20) {
                startDate.setDate(startDate.getDate() + 1); // After 1PM, won't ship until next day
            }

            var daysToAdd = 0;
            switch (startDate.getDay()) {
                case 0: daysToAdd = 2; break; //Sunday - can't deliver until Tue
                case 1: daysToAdd = 1; break; //Monday - can't deliver until Tue
                case 6: daysToAdd = 3; break; //Saturday - can't deliver until Tue
            }
            startDate.setDate(startDate.getDate() + daysToAdd);
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        },

        validArrivalDate: function(date) {
            return this.getFirstArrivalDate().valueOf() <= date.valueOf() && $.inArray(date.getDay(), [0, 1, 6]) == -1;
        }
    }
};

var NavigationManager = {
    _enabledSections: [],
    _currentSection: '',
    _acceptScrolling: true,

    init: function() {
        // Goto first section
        this.enableSection('pick');
        this.gotoSection('pick');

        // Add hash handler
        $(window).on('hashchange', function() {
            NavigationManager._gotoSection(window.location.hash.substring(1));
        });

        // Add navigation click handlers
        $.each(['pick', 'personalize', 'pack', 'pay'], function(i, v) {
            NavigationManager._getNavElement(v).click(function() {
                NavigationManager.gotoSection(v);
            });
        });
    },

    disableSection: function(section) {
        var foundSection = false;
        this._enabledSections = $.grep(this._enabledSections, function(value) {
            if (value == section){
                foundSection = true;
            }
            return !foundSection || !this._getNavElement(value).addClass('disabled');
        });

    },

    enableSection: function(section) {
        if (!this._isEnabled(section)) {
            this._enabledSections.push(section);
            this._getNavElement(section).removeClass('disabled');
        }
    },

    _getNavElement: function(section) {
        return $('#side-nav [data-section="' + section + '"]');
    },

    _selectNavElement: function(section) {
        $('#side-nav > div').removeClass('selected');
        this._getNavElement(section).addClass('selected');
    },

    _isEnabled: function(section) {
        return $.inArray(section, this._enabledSections) >= 0;
    },

    gotoSection: function(section) {
        if(section == 'next') {
            section = enabledSections[enabledSections.indexOf(this._currentSection) + 1];
        } else if (section == 'prev') {
            section = enabledSections[enabledSections.indexOf(this._currentSection) - 1];
        }

        if (this._isEnabled(section)) {
            window.location.hash = section;
        }
    },

    _gotoSection: function(section) {
        if (!this._isEnabled(section) || this._currentSection === section) {
            return;
        }
        this._selectNavElement(section);

        var transitionFunction = this.sectionTransitions[section][this._currentSection];
        if (transitionFunction) {
            transitionFunction();
        } else {
            this.sectionTransitions[section]['default']();
        }

        this._currentSection = section;
    },

    scrollToTop: function() {
        this._acceptScrolling = false;
        $('html, body').animate({ scrollTop: 0 }, "slow", function() {
            this._acceptScrolling = true;
        });
    },

    sectionTransitions: {
        // To Pick
        pick: {
            // From everything else
            default: function() {
                $('body').removeClass('from-pick-to-personalize');
                $('#tray1, #tray2, #pick, footer.pick').show().addClass('fade-in');

            }
        },

        // To Personalize
        personalize: {
            // From Pick
            pick: function() {
                Utils.removeClassFromAll('fade-in');
                $('#tray1, #tray2, #pick, footer.pick, .shield, #styro-container, #gift-message, #pack').show();
                $('body').addClass('from-pick-to-personalize');
                $('#styro-container').afterAnimation(function() {
                    if (NavigationManager._currentSection == 'personalize') {
                        $('#tray1, #tray2, #pick, .shield').hide();
                    }
                });
            }
        },

        // To Pack
        pack: {
            // From Personalize
            personalize: function() {
                $('.fade-in').removeClass('fade-in');
                $('#personalize, footer.personalize, #box, #pay').show();
                $('body').addClass('from-personalize-to-pack');
            }
        }
    }

};

(function() {
    NavigationManager.init();
    Flavors.init();
    Pick.init();
    Personalize.init();
    Pack.init();
    Pay.init();

    $.fn.afterAnimation = function(afterAnimation) {
        return this.one('animationend animationend webkitAnimationEnd oanimationend MSAnimationEnd', afterAnimation);
    }

    var acceptScrolling = true;
    var preventScrolling = false;
    var consecutiveUpScrolls = 0;
    var consecutiveDownScrolls = 0;
    var isOrderComplete = false;
    var lastScrollTop = 0;
    $(document).bind('scroll', function(e) {
        console.log(e);
        var thisScrollTop = $(this).scrollTop();

        if (!acceptScrolling || preventScrolling || $('.modal').hasClass('in')) {
            e.preventDefault();
            lastScrollTop = thisScrollTop;
            return;
        }

        if (Utils.isMobile()) {
            if (thisScrollTop == 0) {
                gotoSection('prev');
            } else if (thisScrollTop == $(document).height() - $(window).height()) {
                gotoSection('next');

            }
        }

        if (lastScrollTop > thisScrollTop && $(window).scrollTop() <= 0) {
            e.preventDefault();
            consecutiveUpScrolls++;
            consecutiveDownScrolls = 0;
            if (consecutiveUpScrolls >= 3) {
                consecutiveUpScrolls = 0;
                gotoSection('prev');
            }
        } else if (lastScrollTop < thisScrollTop && $(window).scrollTop() + $(window).height() >= $(document).height()) {
            e.preventDefault();
            consecutiveDownScrolls++;
            consecutiveUpScrolls = 0;
            if (consecutiveDownScrolls >= 3) {
                consecutiveDownScrolls = 0;
                gotoSection('next');
            }
        }
        lastScrollTop = thisScrollTop;
    });



    var sectionTransitionFunctions = {
        fromPickToPersonalize: function(callback) {
            scrollToTop();
            //console.log(getUniquePickedCheesecakes());

            $('#pick').addClass('transparent').find('footer').addClass('slide-down');
            setTimeout(function() {
                $('#pick').hide();
                $('.shield').hide();
                $('#tray1').addClass('slide-up');
                setTimeout(function() {
                    $('#tray2').addClass('slide-left')
                    setTimeout(function() {
                        $('#styro-container').removeClass('hide');
                        $('#tray1').addClass('slide-down');
                        setTimeout(function() {
                            $('#styro-container').addClass('collapsed');
                            $('#gift-message').show();
                            $('#personalize').show();
                            setTimeout(function() {
                                $('.tray').hide();
                                $('#gift-message').addClass('slide-up');
                                $('#personalize').removeClass('transparent');
                                setTimeout(function() {
                                    $('footer.personalize ').removeClass('slide-down');
                                    enableSection('pack');
                                    callback && callback();
                                }, 2000);
                            }, 2000);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        },

        fromPersonalizeToPick: function(callback) {
            scrollToTop();
            $('footer.personalize').addClass('slide-down');
            setTimeout(function() {
                $('#gift-message').removeClass('slide-up');
                $('#personalize').addClass('transparent');
                setTimeout(function() {
                    $('.tray').show();
                    $('#styro-container').removeClass('collapsed');
                    setTimeout(function() {
                        $('#gift-message').hide();
                        $('#personalize').hide();
                        $("#tray1").removeClass('slide-down');
                         setTimeout(function() {
                            $('#styro-container').addClass('hide');
                            $("#tray2").removeClass('slide-left');
                            setTimeout(function() {
                                $("#tray1").removeClass('slide-up');
                                $("#pick").show();
                                setTimeout(function() {
                                    $('.shield').show();
                                    $("#pick").removeClass('transparent');
                                    setTimeout(function() {
                                        $('footer.pick').removeClass('slide-down');
                                        callback && callback();
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 1000);
                }, 500);
            }, 100);
        },

        fromPersonalizeToPack: function(callback) {
            scrollToTop();
            $('#personalize footer').addClass('slide-down');
            $('#gift-message').addClass('fold');
            setTimeout(function() {
                $('#gift-message').addClass('shrink');
                $('#box').show();
                $('#label').show();
                $('#personalize').addClass('transparent');
                $('#pack').show();
                setTimeout(function() {
                    $('#box').removeClass('slide-down');
                    $('#label').removeClass('slide-down');
                    $('#personalize').hide();
                    $('#pack').removeClass('transparent');
                    setTimeout(function() {
                        callback && callback();
                    }, 1500);
                }, 500);
            }, 1500);
        },

        fromPackToPersonalize: function(callback) {
            scrollToTop();
            $('#pack footer').addClass('slide-down');
            $('#label').addClass('slide-down');
            $('#box').addClass('slide-down');
            $('#personalize').show();
            $('#pack').addClass('transparent');
            setTimeout(function() {
                $('#label').hide();
                $('#box').hide();
                $('#gift-message').removeClass('shrink');
                $('#personalize').removeClass('transparent');
                $('#pack').hide();
                setTimeout(function() {
                    $('#gift-message').removeClass('fold');
                    setTimeout(function() {
                        $('#personalize footer').removeClass('slide-down');
                        callback && callback();
                    }, 1500);
                }, 500);
            }, 1000);
        },

        fromPackToPay: function(callback) {
            scrollToTop();
            $('#pack footer').addClass('slide-down');
            var addressString = $('#label .name').val() + '\n' +
                ($('#label .company').val() ? $('#label .company').val() + '\n' : '') +
                $('#label .address').val() + '\n' +
                ($('#label .address2').val() ? $('#label .address2').val() + '\n' : '') +
                $('#label .city').val() + ' ' + $('#label .state').val() + ' ' + $('#label .zip').val();

            $('#checkout-window ul').empty();
            $.each(getUniquePickedCheesecakes(), function(i, v) {
                $('#checkout-window ul').append(
                    '<li>' + v.quantity + 'x ' + v.name + '</li>'
                );
            });

            $('#label .deliver-date').text($('#datepicker').val()).show();
            $('#label .ship-to').text(addressString).show();
            $('#label input, #label label').hide();
            $('#box .flaps').addClass('transparent');
            $('#box .top').removeClass('transparent');

            setTimeout(function() {
                scrollToTop();
                $('#pack').addClass('transparent');
                $('#label').addClass('shrink');
                $('#box .tape').removeClass('transparent');
                $('#pay').show();
                setTimeout(function() {
                    $('#pack').hide();
                    $('#checkout-window').show();
                    $('#pay').removeClass('transparent');
                    setTimeout(function() {
                        $('#styro-container').hide();
                        $('#gift-message').hide();
                        $('#checkout-window').removeClass('transparent');
                        setTimeout(function() {
                            callback && callback();
                        }, 100);
                    }, 500);
                }, 1000);
            }, 500);
        },

        fromPayToPack: function(callback) {
            scrollToTop();
            $('#checkout-window').addClass('transparent');
            $('#pay').addClass('transparent');
            setTimeout(function() {
                $('#label').removeClass('shrink');
                $('#box .tape').addClass('transparent');
                $('#pack').show();
                $('#styro-container').show();
                $('#gift-message').show();
                setTimeout(function() {
                    $('#pay').hide();
                    $('#checkout-window').hide();
                    $('#box .flaps').removeClass('transparent');
                    $('#box .top').addClass('transparent');
                    $('#pack').removeClass('transparent');
                    setTimeout(function() {
                        $('#pack footer').removeClass('slide-down');
                        $('#label .deliver-date').hide();
                        $('#label .ship-to').hide();
                        $('#label input, #label label').show();
                        callback && callback();
                    }, 500);
                }, 500);
            }, 1000);
        },

        fromPayToOrderComplete: function(callback) {
            scrollToTop();
            $('#checkout-window').addClass('transparent');
            $('#pay').addClass('transparent');
            $('#pay footer').addClass('slide-down');
            $('#truck').show();
            setTimeout(function() {
                $('#truck').removeClass('slide-right');
                $('#order-complete').show();
                setTimeout(function() {
                    $('#pay').hide();
                    $('#checkout-window').hide();
                    $('#complete-package').addClass('enter-truck').css({left: $(window).width()});
                    setTimeout(function() {
                        $('#order-complete').removeClass('transparent');
                        setTimeout(function() {
                            $('#order-complete footer').removeClass('slide-down');
                            callback && callback();
                        }, 500);
                    }, 1000);
                }, 1000);
            }, 1000);

        }
    }
})()