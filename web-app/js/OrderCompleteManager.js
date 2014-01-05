OrderCompleteManager = function(elementSelectors, order) {
    var element = $(elementSelectors.main);
    element.find('.new-order').click(function() {
        location.reload();
    });

    this.refreshSummaryFields = function() {
        element.find('.email').text(order.billingInfo.email());
        element.find('.recipient').text(order.label.name());
        element.find('.delivery-date').text(moment(order.label.deliverdate()).format('MMMM Do YYYY'));
    };
};