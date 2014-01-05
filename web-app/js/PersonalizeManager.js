PersonalizeManager = function(elementSelectors, order, onPersonalizeComplete) {
    var mainElement = $(elementSelectors.main);
    mainElement.find('.edit-message-label').click($.proxy(function() { this.makeEditable(true); }, this));
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
                '</div>');
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
    };
};