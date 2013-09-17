/**
 * Created with JetBrains WebStorm.
 * User: mitchellloeppky
 * Date: 9/14/13
 * Time: 1:02 PM
 * To change this template use File | Settings | File Templates.
 */
(function() {

    var flavorData;
    $.get('../product/getDump').done(function (result) {
        console.log(result);
        flavorData = result;
        $.each(flavorData, function(i, v) {
            $('#flavor-carousel .scroll').append(
                '<li class="flavor" data-id="' + v.id + '">' +
                    (v.isGlutenFree ? '<img class="gf-icon" src="../img/gluten-free-icon.png" />' : '') +
                    '<img src="../img/very-berry.png">' + //' + v.platedImage + '"/>' +
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
    $('html').bind('mousewheel', function(e) {
        if (!acceptScrolling || $('.modal').hasClass('in')) {
            return;
        }

        if (e.originalEvent.wheelDelta > 0 && $(window).scrollTop() < 10) {
            gotoSection('prev');
        } else if ($(window).scrollTop() + $(window).height() + 10 >= $(document).height()) {
            gotoSection('next');
        }
    });

    function gotoSection(section) {
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
        moreInfoWindow.find('.description').text(flavor.description);
        moreInfoWindow.find('.ingredients').text(flavor.ingredients);
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

        var cheesecake = $('<img class="cheesecake cheesecake' + openSlot + '" src="' + flavor.nonPlatedImage + '">' +
            '<a href="#" class="cheesecake-event-catcher cheesecake cheesecake' + openSlot + '"><img src="' + flavor.nonPlatedImage + '" /></a>')
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
                            setTimeout(function() {
                                $('.tray').hide();
                                $('#gift-message').addClass('slide-up');
                                $('#personalize').removeClass('transparent');
                                setTimeout(function() {
                                    $('#personalize footer').removeClass('slide-down');
                                    enableSection('pack');
                                    callback();
                                }, 2000);
                            }, 2000);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        },

        fromPersonalizeToPick: function(callback) {
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
                                        callback();
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 1000);
                }, 500);
            }, 100);
        },

        fromPersonalizeToPack: function(callback) {
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
                        callback();
                    }, 1500);
                }, 500);
            }, 1500);
        },

        fromPackToPersonalize: function(callback) {
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
                        callback();
                    }, 1500);
                }, 500);
            }, 1000);
        },

        fromPackToPay: function(callback) {
            $('#pack footer').addClass('slide-down');
            var addressString = $('#label .name').val() + '\n' +
                ($('#label .company').val() ? $('#label .company').val() + '\n' : '') +
                $('#label .address').val() + '\n' +
                ($('#label .address2').val() ? $('#label .address2').val() + '\n' : '') +
                $('#label .city').val() + ' ' + $('#label .state').val() + ' ' + $('#label .zip').val();

            $('#label .deliver-date').text($('#datepicker').val()).show();
            $('#label .ship-to').text(addressString).show();
            $('#label input, #label label').hide();
            $('#box .flaps').addClass('transparent');
            $('#box .top').removeClass('transparent');
            setTimeout(function() {
                $('#pack').addClass('transparent');
                $('#label').addClass('shrink');
                $('#box .tape').removeClass('transparent');
                setTimeout(function() {
                    $('#pack').hide();
                    callback();
                }, 1000);
            }, 500);
        },

        fromPayToPack: function(callback) {
            $('#pay footer').addClass('slide-down');
            $('#label').removeClass('shrink');
            $('#box .tape').addClass('transparent');
            $('#pack').show();
            setTimeout(function() {
                $('#box .flaps').removeClass('transparent');
                $('#box .top').addClass('transparent');
                $('#pack').removeClass('transparent');
                setTimeout(function() {
                    $('#pack footer').removeClass('slide-down');
                    $('#label .deliver-date').hide();
                    $('#label .ship-to').hide();
                    $('#label input, #label label').show();
                    callback();
                }, 500);
            }, 500);
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