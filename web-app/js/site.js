(function() {

    var flavorData;
    $.get('/product/getDump').done(function (result) {
        console.log(result);
        flavorData = result;
        $.each(flavorData, function(i, v) {
            $('#flavor-carousel .scroll').append(
                '<li class="flavor" data-id="' + v.id + '">' +
                    (v.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                    '<img src="' + v.stageImageUrl + '"/>' +
                    '<div class="flavor-label">' + v.name + '</div>' +
                    '</li>'
            );
        });

        // See http://darsa.in/sly/examples/horizontal.html
        $('#flavor-carousel .well').sly({
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
            prev: $('#flavor-carousel .arrow-left'),
            next: $('#flavor-carousel .arrow-right')
        });
    });

    var pickedCheesecakes = [];
    var enabledSections = ['pick'];
    var sectionChangeQueue = [];


    var hashProgramaticallyChanged = true;
    window.location.hash = 'pick';
    $(window).on('hashchange', function() {
        var hash = window.location.hash.substring(1);

        //console.log("hash changed "+hashProgramaticallyChanged+"     hash " + hash);
        !hashProgramaticallyChanged && hash && hash != '#' && gotoSection(hash);
        hashProgramaticallyChanged = false;

        $('#side-nav > div').removeClass('selected');
        getNavElement(hash).addClass('selected');
    });

    var acceptScrolling = true;
    var preventScrolling = false;
    var consecutiveUpScrolls = 0;
    var consecutiveDownScrolls = 0;
    var isOrderComplete = false;
    $('html').bind('mousewheel', function(e) {
        if (!acceptScrolling || preventScrolling || $('.modal').hasClass('in')) {
            e.preventDefault();
            return;
        }

        if (e.originalEvent.wheelDelta > 0 && $(window).scrollTop() < 10) {
            consecutiveUpScrolls++;
            consecutiveDownScrolls = 0;
            if (consecutiveUpScrolls >= 3) {
                consecutiveUpScrolls = 0;
                gotoSection('prev');
            }
        } else if ($(window).scrollTop() + $(window).height() + 10 >= $(document).height()) {
            consecutiveDownScrolls++;
            consecutiveUpScrolls = 0;
            if (consecutiveDownScrolls >= 3) {
                consecutiveDownScrolls = 0;
                gotoSection('next');
            }
        }
    });

    function scrollToTop() {
        acceptScrolling = false;
        $('html, body').animate({ scrollTop: 0 }, "slow", function() {
            acceptScrolling = true;
        });
    }

    function gotoSection(section) {
        if (isOrderComplete) {
            location.reload();
        }

        if (sectionChangeQueue.length > 0) {
            var currentTargetSection = sectionChangeQueue[sectionChangeQueue.length - 1];
            var currentTargetSectionIndex = enabledSections.indexOf[currentTargetSection];
            var finalTargetSectionIndex = enabledSections.indexOf(section);
            while (currentTargetSectionIndex - finalTargetSectionIndex > 0) {
                currentTargetSectionIndex --;
                sectionChangeQueue.push(enabledSections[currentTargetSectionIndex]);
            }
            while (currentTargetSectionIndex - finalTargetSectionIndex < 0) {
                currentTargetSectionIndex ++;
                sectionChangeQueue.push(enabledSections[currentTargetSectionIndex]);
            }
            if (currentTargetSection === section) {
                return;
            }
            sectionChangeQueue.push(section);
            //console.log(sectionChangeQueue);
            return;
        }

        var currentSection = getCurrentSection();
        if(section == 'next') {
            section = enabledSections[enabledSections.indexOf(currentSection) + 1];
        } else if (section == 'prev') {
            section = enabledSections[enabledSections.indexOf(currentSection) - 1];
        }


        if ($.inArray(section, enabledSections) == -1) {
            return;
        }

        hashProgramaticallyChanged = true;
        window.location.hash = section;

        var currentSectionIndex = enabledSections.indexOf(currentSection);
        var targetSectionIndex = enabledSections.indexOf(section);

        sectionChangeQueue.unshift(section);

        advanceSection();

        function advanceSection() {
            acceptScrolling = false;
            if (currentSectionIndex - targetSectionIndex > 0) {
                console.log('from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex - 1]));
                sectionTransitionFunctions['from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex - 1])](function() {
                    currentSectionIndex--;
                    advanceSection();
                    acceptScrolling = true;
                    if (sectionChangeQueue[0] == section) {
                        sectionChangeQueue.shift();
                        gotoNextSectionInQueue();
                    }
                });
            }

            if (currentSectionIndex - targetSectionIndex < 0) {
                console.log('from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex + 1]));
                sectionTransitionFunctions['from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex + 1])](function() {
                    currentSectionIndex++;
                    advanceSection();
                    acceptScrolling = true;
                    if (sectionChangeQueue[0] == section) {
                        sectionChangeQueue.shift();
                        gotoNextSectionInQueue();
                    }
                });
            }
        }
    }

    function gotoNextSectionInQueue() {
        //console.log(sectionChangeQueue.length > 0 ? sectionChangeQueue[0] : 'empty queue');
        sectionChangeQueue.length > 0 && gotoSection(sectionChangeQueue.shift());
    }

    function capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getCurrentSection() {
        return $('#side-nav .selected').attr('data-section');
    }

    function disableSection(section) {
        var foundSection = false;
        enabledSections = $.grep(enabledSections, function(value) {
            if (value == section){
                foundSection = true;
            }
            return !foundSection || !getNavElement(value).addClass('disabled');
        });

    }

    function enableSection(section) {
        if ($.inArray(section, enabledSections) == -1) {
            enabledSections.push(section);
            getNavElement(section).removeClass('disabled');
        }
    }

    function getNavElement(section) {
        return $('#side-nav [data-section="' + section + '"]');
    }

    $.each(['pick', 'personalize', 'pack', 'pay'], function(i, v) {
        getNavElement(v).click(function() {
            gotoSection(v);
        });
    });

    $('.questions > a').popover({
        placement: 'bottom',
        content: $('.questions-content').html(),
        html: true
    });

    function getUniquePickedCheesecakes() {
        return $.grep(pickedCheesecakes, function(v, i) {
            if(!v || !i) {
                return false;
            }
            if ($.inArray(v ,pickedCheesecakes) === i) {
                v.quantity = 1;
                return true;
            } else {
                v.quantity++;
                return false;
            }
        });
    }

    function getFlavorById(id) {
        var flavor;
        $.each(flavorData, function(i, v) {
            if (v.id == id) {
                flavor = v;
                return false;
            }
        });
        return flavor;
    }

    function displayMoreInfo(flavor) {
        var moreInfoWindow = $('#more-info').removeClass('show-nutrition-label').modal();
        $('.btn-show-nutrition-label').show();
        moreInfoWindow.find('h3').text(flavor.name);
        moreInfoWindow.find('.staged-image').attr('src', flavor.stageImageUrl);
        moreInfoWindow.find('.description').text(flavor.description);
        moreInfoWindow.find('.ingredients').text(flavor.ingredients);
        moreInfoWindow.find('.allergens').text(flavor.allergens);
        moreInfoWindow.find('.nutrition-label').attr('src', flavor.nutritionLabelImageUrl);
    }

    $('.btn-show-nutrition-label').click(function() {
        $(this).hide();
        $('#more-info').addClass('show-nutrition-label')
    });

    $('#selected-cheesecake-btns .btn-more-info').click(function() {
        displayMoreInfo(getFlavorById($('.flavor.active').attr('data-id')));
    });

    $('#selected-cheesecake-btns .btn-add').click(function() {
        var flavor = getFlavorById($('.flavor.active').attr('data-id'));
        var openSlot = findOpenCheesecakeSlot();
        if (!openSlot) {
            return;
        }
        pickedCheesecakes[openSlot] = flavor;

        var parentContainer;
        if (openSlot <= 4) {
            parentContainer = $('#tray1');
        } else {
            parentContainer = $('#tray2');
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $('<img class="cheesecake cheesecake' + openSlot + '" src="' + flavor.bareImageUrl + '">' +
            '<a href="#" class="cheesecake-event-catcher cheesecake cheesecake' + openSlot + '"><img src="' + flavor.bareImageUrl + '" /></a>')
            .appendTo(parentContainer)
            .animate({top: '-=100'}, 500)
            .popover({
                placement: 'top',
                content: function() {
                    return $(
                        '<div class="flavor-label">' + flavor.name + '</div>' +
                        '<div class="btn-container btn-container' + openSlot + '">' +
                            '<div class="btn btn-more-info">More info</div>' +
                            '<div class="btn btn-remove btn-danger">Remove</div>' +
                        '</div>').data('flavor', flavor);
                },
                html: true,
                trigger: 'manual'
            })
            .click(function(e) {
                if (getCurrentSection() != 'pick') {
                    return;
                }
                $(this).popover('show');
                clickedAway = false;
                isVisible = true;
                e.preventDefault();
                $('.popover').bind('click',function() {
                    clickedAway = false;
                });
            });

        cheesecake.parent().delegate('.btn-container' + openSlot + ' .btn-more-info', 'click', function() {
            displayMoreInfo($(this).parent().data('flavor'));
        }).delegate('.btn-container' + openSlot + ' .btn-remove', 'click', function() {
            pickedCheesecakes[openSlot] = null;
            cheesecake.popover('hide').animate({top: '+=100'}, 500, function() {
                cheesecake.remove();
            });
            $('.btn-success').removeClass('disabled');
            $("#pick footer").addClass('slide-down');
            disableSection('personalize');
        });

        $(document).click(function(e) {
            if(isVisible && clickedAway) {
                cheesecake.popover('hide');
                isVisible = clickedAway = false;
            }
            else {
                clickedAway = true;
            }
        });

        if (!findOpenCheesecakeSlot()) {
            $(this).addClass('disabled');
            $("#pick footer").removeClass('slide-down');
            enableSection('personalize');
        }
    });

    $("#pick footer").click(function() {
        gotoSection('personalize');
    });

    $("#personalize footer").click(function() {
        gotoSection('pack');
    });

    $("#pack footer").click(function() {
        gotoSection('pay');
    });

    $("#order-complete footer").click(function() {
        location.reload();
    });

    var performLabelValidation = false;
    $('#label input').keyup(function() {
        if ($('#label .zip').val().length == 5) {
            performLabelValidation = true;
        }
        if (performLabelValidation) {
            validateLabel();
        }
    });

    function validateLabel() {
        labelTooltips.hideAll();

        setTimeout(function() {
            if (!validArrivalDate(new Date($('#datepicker').val()))) {
                labelTooltips.datePicker.show();
                disableNextSection();
                return;
            }

            if (!$('#label .name').val()) {
                labelTooltips.name.show();
                disableNextSection();
                return;
            }

            if (!$('#label .address').val()) {
                labelTooltips.address.show();
                disableNextSection();
                return;
            }

            if (!$('#label .city').val()) {
                labelTooltips.city.show();
                disableNextSection();
                return;
            }

            if ($('#label .state').val().length != 2) {
                labelTooltips.state.show();
                disableNextSection();
                return;
            }

            if ($('#label .zip').val().length != 5 || !parseInt($('#label .zip').val())) {
                labelTooltips.zip.show();
                disableNextSection();
                return;
            }

            enableNextSection();

            function enableNextSection() {
                enableSection('pay');
                $('#pack footer').removeClass('slide-down');
            }

            function disableNextSection() {
                disableSection('pay');
                $('#pack footer').addClass('slide-down');
            }
        }, 500);
    }

    function findOpenCheesecakeSlot() {
        for(var i = 1; i <= 8; i++) {
            if (!pickedCheesecakes[i]) {
                return i;
            }
        }
    }

    $('.questions > a').popover({
        placement: 'bottom',
        content: $('.questions-content').html(),
        html: true
    });

    $('#gift-message').find('pre, .edit-message-label').click(function() {
        $('textarea').val($('pre').text());
        $('#gift-message .non-edit').addClass('hide');
        $('#gift-message .edit').removeClass('hide');
    });

    $('#gift-message .btn-save').click(function() {
        $('pre').text($('textarea').val());
        $('#gift-message .non-edit').removeClass('hide');
        $('#gift-message .edit').addClass('hide');
    });

    var labelTooltips = {
        datePicker: $('#datepicker').tooltip({
            title: 'Select valid delivery date',
            placement: 'right',
            trigger: 'manual'
        }).data('tooltip'),

        name: $('#label .name').tooltip({
            title: 'Enter a recipient',
            trigger: 'manual'
        }).data('tooltip'),

        address: $('#label .address').tooltip({
            title: 'Enter an address',
            trigger: 'manual'
        }).data('tooltip'),

        city: $('#label .city').tooltip({
            title: 'Enter a city',
            placement: 'bottom',
            trigger: 'manual'
        }).data('tooltip'),

        state: $('#label .state').tooltip({
            title: 'Enter a state',
            placement: 'bottom',
            trigger: 'manual'
        }).data('tooltip'),

        zip: $('#label .zip').tooltip({
            title: 'Enter a valid zip code',
            placement: 'bottom',
            trigger: 'manual'
        }).data('tooltip'),

        hideAll: function() {
            this.datePicker.hide();
            this.name.hide();
            this.address.hide();
            this.city.hide();
            this.state.hide();
            this.zip.hide();
        }
    }

    var sectionTransitionFunctions = {
        fromPickToPersonalize: function(callback) {
            scrollToTop();
            //console.log(getUniquePickedCheesecakes());
            $('#gift-message .flavor-info-container').empty();
            $.each(getUniquePickedCheesecakes(), function(i, v) {
                $('#gift-message .flavor-info-container').append(
                    '<div class="flavor-info">' +
                        '<h5>' + v.name + '</h5>' +
                        '<div class="blurb">' + v.description + '</h5>' +
                    '</div>')
            });
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
                                    $('#personalize footer').removeClass('slide-down');
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
            $('#personalize footer').addClass('slide-down');
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
                                        $('#pick footer').removeClass('slide-down');
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

    function validArrivalDate(date) {
        return startDate.valueOf() <= date.valueOf() && $.inArray(date.getDay(), [0, 1, 6]) == -1;
    }

    function getStartDate() {
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
    }

    var startDate = getStartDate();
    $('#datepicker').datepicker({
        format: 'mm/dd/yyyy',
        onRender: function(date) {
            return !validArrivalDate(date) ? 'disabled' : '';
        }
    }).data('datepicker').setValue(startDate);

    $.get('/swipe/getPublishableKey').done(function(result) {
        Stripe.setPublishableKey(result);
    });

    $(document).ready(function() {
        function addInputNames() {
            // Not ideal, but jQuery's validate plugin requires fields to have names
            // so we add them at the last possible minute, in case any javascript
            // exceptions have caused other parts of the script to fail.
            $(".card-number").attr("name", "card-number")
            $(".card-cvc").attr("name", "card-cvc")
            $(".card-expiry-year").attr("name", "card-expiry-year")
        }

        function removeInputNames() {
            $(".card-number").removeAttr("name")
            $(".card-cvc").removeAttr("name")
            $(".card-expiry-year").removeAttr("name")
        }

        function submit(form) {
            // remove the input field names for security
            // we do this *before* anything else which might throw an exception
            removeInputNames(); // THIS IS IMPORTANT!

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
                    addInputNames();
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

        // add custom rules for credit card validating
        jQuery.validator.addMethod("cardNumber", Stripe.validateCardNumber, "Please enter a valid card number");
        jQuery.validator.addMethod("cardCVC", Stripe.validateCVC, "Please enter a valid security code");
        jQuery.validator.addMethod("cardExpiry", function() {
            return Stripe.validateExpiry($(".card-expiry-month").val(),
                $(".card-expiry-year").val())
        }, "Please enter a valid expiration");

        // We use the jQuery validate plugin to validate required params on submit
        $("#example-form").validate({
            submitHandler: submit,
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

        // adding the input field names is the last step, in case an earlier step errors
        addInputNames();
    });

    function paymentComplete() {
        sectionTransitionFunctions.fromPayToOrderComplete();
        isOrderComplete = true;
        $('#order-complete .email').text($('#checkout-window .email').val());
        $('#order-complete .recipient').text($('#label input.name').val());
        $('#order-complete .delivery-date').text(moment($('#label #datepicker').val()).format('MMMM Do YYYY'));
    }

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    for (var i = 0; i < 12; i++) {
        $(".card-expiry-year").append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"));
        $(".card-expiry-month").append($("<option value='"+i+"' "+(month === i ? "selected" : "")+">"+i+"</option>"));
    }

    scrollToTop();
})()