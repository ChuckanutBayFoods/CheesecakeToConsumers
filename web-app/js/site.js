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
            test();

            function test() {
                acceptScrolling = false;
                if (currentSectionIndex - targetSectionIndex > 0) {
                    sectionTransitionFunctions['from' + capitalise(currentSection) + 'To' + capitalise(enabledSections[currentSectionIndex - 1])](function() {
                        currentSectionIndex--;
                        test();
                        acceptScrolling = true;
                    });
                }

                if (currentSectionIndex - targetSectionIndex < 0) {
                    sectionTransitionFunctions['from' + capitalise(currentSection) + 'To' + capitalise(enabledSections[currentSectionIndex + 1])](function() {
                        currentSectionIndex++;
                        test();
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
        enabledSections = $.grep(enabledSections, function(value) {
            return value != section;
        });
        getNavElement(section).addClass('disabled');

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

    $('.btn-success').click(function() {
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

    function findOpenCheesecakeSlot() {
        for(var i = 1; i <= 8; i++) {
            if (!pickedCheesecakes[i]) {
                return i;
            }
        }
    }

    function setupCheesecakePopover() {

    }

    $('.questions > a').popover({
        placement: 'bottom',
        content: $('.questions-content').html(),
        html: true
    });
})();

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
                        callback();
                    });
                });
            });
        }).find('footer').addClass('slide-down');
    },

    fromPersonalizeToPick: function(callback) {
        $('#styro-container').removeClass('collapsed');
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
    }
}