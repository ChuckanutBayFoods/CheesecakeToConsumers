/**
 * Created with JetBrains WebStorm.
 * User: mitchellloeppky
 * Date: 9/14/13
 * Time: 1:02 PM
 * To change this template use File | Settings | File Templates.
 */
(function() {

    var programScrolling = false;

    $('#side-nav > div').click(function() {
        $('#side-nav > div').removeClass('selected');
        $(this).addClass('selected');
    });

    $('.questions').click(function() {
        $('.questions > a').popover({
            placement: 'bottom',
            content: $('.questions-content').html(),
            html: true
        });
    });

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

//    $('#flavor-carousel .arrow-left').click(function() {
//        $('#flavor-carousel .selected').prev().click();
//    })
//
//    $('#flavor-carousel .arrow-right').click(function() {
//        $('#flavor-carousel .selected').next().click();
//    })
//
//    $('#flavor-carousel .scroll').scroll(function(e) {
//        if (!programScrolling) {
//            $(this).find('.selected').removeClass('selected');
//        }
//    });
//
//    $('#flavor-carousel .scroll > *').click(function() {
//        var clickedFlavor = $(this);
//        if (!clickedFlavor.hasClass('selected')) {
//            clickedFlavor.siblings().removeClass('selected');
//            clickedFlavor.addClass('selected');
//            programScrolling = true;
//            var scrollTo = $('.scroll').scrollLeft() + ($(this).offset().left - $('.scroll').offset().left) + ($(this).width() - $('.scroll').width())/2;
//            $('#flavor-carousel .scroll').animate({scrollLeft: scrollTo}, 700, function() {
//                setTimeout(function() {programScrolling = false;}, 100);
//            });
//        }
//    });
})();