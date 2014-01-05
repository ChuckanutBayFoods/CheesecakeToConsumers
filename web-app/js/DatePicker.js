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
    };

    this.validArrivalDate = function(date) {
        date = date || this.getValue();
        return this.getFirstArrivalDate().valueOf() <= date.valueOf() && $.inArray(date.getDay(), [0, 1, 6]) == -1;
    };

    element.datepicker({
        format: 'mm/dd/yyyy',
        onRender: $.proxy(function(date) {
            return this.validArrivalDate(date) ? '' : 'disabled';
        }, this)
    }).data('datepicker').setValue(this.getFirstArrivalDate());
};