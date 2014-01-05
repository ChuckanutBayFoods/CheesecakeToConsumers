PackManager = function(elementSelectors, order, onPackComplete) {
    var form = $(elementSelectors.main);
    var isValid = false;
    var datePicker = new DatePicker($('#datepicker'));

    form.find('.edit').click($.proxy(function() {
        isValid = false;
        this.makeEditable(true);
        S.setScrollTop(Constants.Boundaries.PACK_TO_PAY.position());
    }, this));

    form.find('.arrival-date').val(order.label.deliverdate());
    form.find('.name').val(order.label.name());
    form.find('.company').val(order.label.company());
    form.find('.address').val(order.label.address());
    form.find('.address2').val(order.label.address2());
    form.find('.city').val(order.label.city());
    form.find('.state').val(order.label.state());
    form.find('.zip').val(order.label.zip());


    jQuery.validator.addMethod('packArrivalDate', function() {
        // This is the format expected by the back-end.
        order.label.deliverdate(datePicker.getValue());
        return datePicker.validArrivalDate();
    }, 'Select a valid arrival date.');

    var recipientPrefix = 'Enter the recipient\'s ';
    jQuery.validator.addMethod('packName', function(name) {
        order.label.name(name);
        return name;
    }, recipientPrefix + 'name.');

    jQuery.validator.addMethod('packCompany', function(company) {
        order.label.company(company);
        return true;
    }, recipientPrefix + 'company.');

    jQuery.validator.addMethod('packAddressLine1', function(address) {
        order.label.address(address);
        return address;
    }, recipientPrefix + 'address');

    jQuery.validator.addMethod('packAddressLine2', function(address2) {
        order.label.address2(address2);
        return true;
    }, recipientPrefix + 'address');

    jQuery.validator.addMethod('packCity', function(city) {
        order.label.city(city);
        return city;
    }, recipientPrefix + 'city');

    jQuery.validator.addMethod('packState', function(state) {
        order.label.state(state);
        return (/^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[ANU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/).test(state.toUpperCase());
    }, recipientPrefix + 'state');

    jQuery.validator.addMethod('packZip', function(zip) {
        order.label.zip(zip);
        return (/^\d{5}$/).test(zip);
    }, recipientPrefix + 'zip code');

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
            errorContainer.toggleClass('in', error !== undefined).toggleClass('out', error === undefined);
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
};