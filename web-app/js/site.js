/**
 * Created with JetBrains WebStorm.
 * User: mitchellloeppky
 * Date: 9/14/13
 * Time: 1:02 PM
 * To change this template use File | Settings | File Templates.
 */
(function() {

    var pickedCheesecakes = [];
    var enabledSections = ['pick'];

    var acceptScrolling = true;
    $('html').bind('mousewheel', function(e) {
        if (!acceptScrolling) {
            return;
        }

        if (e.originalEvent.wheelDelta > 0) {
            gotoSection('prev');
        } else {
            gotoSection('next');
        }
    });

    function gotoSection(section) {
        var currentSection = getCurrentSection();
        if(section == 'next') {
            section = enabledSections[enabledSections.indexOf(currentSection) + 1];
        } else if (section == 'prev') {
            section = enabledSections[enabledSections.indexOf(currentSection) - 1];
        }
        var gotoNavElement = getNavElement(section);

        if ($.inArray(section, enabledSections) != -1) {
            var currentSectionIndex = enabledSections.indexOf(currentSection);
            var targetSectionIndex = enabledSections.indexOf(section);

            $('#side-nav > div').removeClass('selected');
            gotoNavElement.addClass('selected');
            advanceSection();

            function advanceSection() {
                acceptScrolling = false;
                if (currentSectionIndex - targetSectionIndex > 0) {
                    sectionTransitionFunctions['from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex - 1])](function() {
                        currentSectionIndex--;
                        advanceSection();
                        acceptScrolling = true;
                    });
                }

                if (currentSectionIndex - targetSectionIndex < 0) {
                    sectionTransitionFunctions['from' + capitalise(enabledSections[currentSectionIndex]) + 'To' + capitalise(enabledSections[currentSectionIndex + 1])](function() {
                        currentSectionIndex++;
                        advanceSection();
                        acceptScrolling = true;
                    });
                }
            }
        }
    }

    function capitalise(string)
    {
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

    $.each(flavorData, function(i, v) {
           $('#flavor-carousel .scroll').append(
               '<li class="flavor" data-id="' + v.id + '">' +
                    '<img src="' + v.platedImage + '"/>' +
                    '<div class="flavor-label">' + v.name + '</div>' +
                '</li>'
           );
    })

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

    $('.btn-add').click(function() {
        var flavor = getFlavorById($('.flavor.active').attr('data-id'));
        var openSlot = findOpenCheesecakeSlot();
        if (!openSlot) {
            return;
        }
        pickedCheesecakes[openSlot] = flavor;

        var parentContainer;
        if (openSlot <= 4) {
            parentContainer = $('#box1');
        } else {
            parentContainer = $('#box2');
        }

        var clickedAway = false;
        var isVisible = false;

        var cheesecake = $('<img class="cheesecake cheesecake' + openSlot + '" src="' + flavor.nonPlatedImage + '">' +
            '<a href="#" class="cheesecake-event-catcher cheesecake cheesecake' + openSlot + '"><img src="' + flavor.nonPlatedImage + '" /></a>')
            .appendTo(parentContainer)
            .animate({top: '-=100'}, 500)
            .popover({
                placement: 'top',
                content: function() {
                    return $('<div class="btn-container btn-container' + openSlot + '">' +
                            '<div class="btn btn-more-info">More info</div>' +
                            '<div class="btn btn-remove btn-danger">Remove</div>' +
                        '</div>');
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
            console.log(flavor);
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

    $('#label input').keyup(function() {
        if ($('#label .zip').val().length == 5) {
            labelTooltips.hideAll();

            setTimeout(function() {
                if (!validArrivalDate(new Date($('#datepicker').val()))) {
                    labelTooltips.datePicker.show();
                    return;
                }

                if (!$('#label .name').val()) {
                    labelTooltips.name.show();
                    return;
                }

                if (!$('#label .address').val()) {
                    labelTooltips.address.show();
                    return;
                }

                if (!$('#label .city').val()) {
                    labelTooltips.city.show();
                    return;
                }

                if ($('#label .state').val().length != 2) {
                    labelTooltips.state.show();
                    return;
                }

                if ($('#label .zip').val().length != 5 || !parseInt($('#label .zip').val())) {
                    labelTooltips.zip.show();
                    return;
                }
                enableSection('pay');
                $('#pack footer').removeClass('slide-down');
            }, 500);
        } else {
            disableSection('pay');
            $('#pack footer').addClass('slide-down');
        }
    });

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
            $('#pick').animate({opacity: '0'}, 1000, function() {
                $('#pick').hide();
                $('.shield').hide();
                $('#box1').animate({top:'-=200'}, 500, function() {
                    $('#box2').animate({left:'0'}, 500, function() {
                        $('#styro-container').removeClass('hide')
                        $('#box1').animate({top:'+=50'}, 500, function() {
                            $('#styro-container').addClass('collapsed');
                            $('#gift-message').show();
                            setTimeout(function() {
                                $('.box').hide();
                                $('#gift-message').addClass('slide-up');
                                setTimeout(function() {
                                    $('#personalize footer').removeClass('slide-down');
                                    enableSection('pack');
                                    callback();
                                }, 2000)
                            }, 2000);
                        });
                    });
                });
            }).find('footer').addClass('slide-down');
        },

        fromPersonalizeToPick: function(callback) {
            $('#personalize footer').addClass('slide-down');
            setTimeout(function() {
                $('#gift-message').removeClass('slide-up');
                setTimeout(function() {
                    $('.box').show();
                    $('#styro-container').removeClass('collapsed');
                    setTimeout(function() {
                        $('#gift-message').hide();
                        $("#box1").animate({top:'-=50'}, 500, function() {
                            $('#styro-container').addClass('hide')
                            $("#box2").animate({left:'600'}, 500, function() {
                                $("#box1").animate({top:'+=200'}, 500, function() {
                                    $('.shield').show();
                                    $("#pick").show().animate({opacity: '1'}, 1000, function() {
                                        $('#pick footer').removeClass('slide-down');
                                        callback();
                                    });
                                });
                            });
                        });
                    }, 1000);
                }, 1000);
            }, 1000);
        },

        fromPersonalizeToPack: function(callback) {
            $('#personalize footer').addClass('slide-down');
            $('#gift-message').addClass('fold');
            setTimeout(function() {
                $('#gift-message').addClass('shrink');
                $('#box').show();
                $('#label').show();
                setTimeout(function() {
                    $('#box').removeClass('slide-down');
                    $('#label').removeClass('slide-down');
                    setTimeout(function() {
                        callback();
                    }, 2000);
                }, 1000);
            }, 2000);
        },

        fromPackToPersonalize: function(callback) {
            $('#pack footer').addClass('slide-down');
            $('#label').addClass('slide-down');
            $('#box').addClass('slide-down');
            setTimeout(function() {
                $('#label').hide();
                $('#box').hide();
                $('#gift-message').removeClass('shrink');
                setTimeout(function() {
                    $('#gift-message').removeClass('fold');
                    setTimeout(function() {
                        $('#personalize footer').removeClass('slide-down');
                        callback();
                    }, 2000);
                }, 1000);
            }, 1000);
        },

        fromPackToPay: function(callback) {
            $('#pack footer').addClass('slide-down');
            var addressString = $('#label .name').val() + '\n' +
                $('#label .address').val() + '\n' +
                $('#label .city').val() + ' ' + $('#label .city').val() + ' ' + $('#label .zip').val();

            $('#label .deliver-date').text($('#datepicker').val()).show();
            $('#label .ship-to').text(addressString.toUpperCase()).show();
            $('#label input').hide();
            $('#box .flaps').addClass('transparent');
            $('#box .top').removeClass('transparent');
            setTimeout(function() {
                $('#label').addClass('shrink');
                $('#box .tape').removeClass('transparent');
                setTimeout(function() {
                    callback();
                }, 1000);
            }, 1000);
        },

        fromPayToPack: function(callback) {
            $('#pay footer').addClass('slide-down');
            $('#label').removeClass('shrink');
            $('#box .tape').addClass('transparent');
            setTimeout(function() {
                $('#box .flaps').removeClass('transparent');
                $('#box .top').addClass('transparent');
                setTimeout(function() {
                    $('#label .deliver-date').hide();
                    $('#label .ship-to').hide();
                    $('#label input').show();
                    callback();
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
        format: 'mm-dd-yyyy',
        onRender: function(date) {
            return !validArrivalDate(date) ? 'disabled' : '';
        }
    }).data('datepicker').setValue(startDate);
})();