Order = function() {
    var Cheesecakes = function() {
        var cheesecakeSlots = [];

        // TODO: add comments
        this.getUnique = function() {
            var idMap = {};
            return $.grep(cheesecakeSlots, function(v, i) {

                // ignore open slots
                if(!v) {
                    return false;
                }

                if (!idMap[v.id]) { // This is the first occurrence of the flavor v
                    v.quantity = 1;
                    idMap[v.id] = v;
                    return true;
                } else { // We have seen this flavor before
                    idMap[v.id].quantity++;
                    return false;
                }
            });
        };

        this.openSlots = function() {
            var openSlots = 0;
            for(var i = 0; i < Constants.NUM_CHEESECAKE_SLOTS; i++) {
                if (!cheesecakeSlots[i]) {
                    openSlots++;
                }
            }
            return openSlots;
        };

        this.isFull = function() {
            return this.openSlots() === 0;
        };

        this.add = function(flavor) {
            for(var i = 0; i < Constants.NUM_CHEESECAKE_SLOTS; i++) {
                if (!cheesecakeSlots[i]) {
                    cheesecakeSlots[i] = flavor;
                    return i;
                }
            }
            return false;
        };

        this.remove = function(slot) {
            var removedCheesecake = cheesecakeSlots[slot];
            cheesecakeSlots[slot] = undefined;
            return removedCheesecake;
        };

        this.all = function(cheesecakes) {
            if (cheesecakes) {
                cheesecakeSlots = cheesecakes;
                return this;
            }
            return cheesecakeSlots;
        };
    };
    this.cheesecakes = new Cheesecakes();

    this.giftMessage = [
        'Grandma Jane,',
        '',
        'Happy 83rd birthday!  Thank you for another year of fun, joy, and love.  We hope you enjoy this all natural delicious dessert!',
        '',
        'With much love,',
        'Jack and Jill'
    ].join('\n');

    var Label = function() {
        this.name        = function(name) { return Utils.getSetProp('_name', name, this); };
        this.company     = function(company) { return Utils.getSetProp('_company', company, this); };
        this.address     = function(address) { return Utils.getSetProp('_address', address, this); };
        this.address2    = function(address2) { return Utils.getSetProp('_address2', address2, this); };
        this.city        = function(city) { return Utils.getSetProp('_city', city, this); };
        this.state       = function(state) { return Utils.getSetProp('_state', (state || '').toUpperCase(), this); };
        this.zip         = function(zip) { return Utils.getSetProp('_zip', zip, this); };
        this.deliverdate = function(deliverdate) { return Utils.getSetProp('_deliverdate', deliverdate, this); };

        this.all = function(data) {
            if (data) {
                this.name(data.name);
                this.company(data.company);
                this.address(data.address);
                this.address2(data.address2);
                this.city(data.city);
                this.state(data.state);
                this.zip(data.zip);
                this.deliverdate(data.deliverdate);
                return this;
            } else {
                return {
                    name: this.name(),
                    company: this.company(),
                    address: this.address(),
                    address2: this.address2(),
                    city: this.city(),
                    state: this.state(),
                    zip: this.zip(),
                    deliverdate: this.deliverdate()
                };
            }
        };
    };
    this.label = new Label();

    var BillingInfo = function() {
        this.name           = function(name) { return Utils.getSetProp('_name', name, this); };
        this.email          = function(email) { return Utils.getSetProp('_email', email, this); };
        this.stripeToken    = function(stripeToken) { return Utils.getSetProp('_stripeToken', stripeToken, this); };

        this.all = function(data) {
            if (data) {
                this.name(data.name);
                this.email(data.email);
                this.stripeToken(data.stripeToken);
                return this;
            } else {
                return {
                    name: this.name(),
                    email: this.email(),
                    stripeToken: this.stripeToken()
                };
            }
        };
    };
    this.billingInfo = new BillingInfo();

    this.toString = function() {
        return JSON.stringify({
            cheesecakes: this.cheesecakes.all(),
            giftMessage: this.giftMessage,
            label: this.label.all(),
            billingInfo: this.billingInfo.all()
        });
    };

    this.parse = function(string) {
        if (string && string !== 'undefined') {
            order = JSON.parse(string);
            this.cheesecakes.all(order.cheesecakes);
            this.giftMessage = order.giftMessage;
            this.label.all(order.label);
            this.billingInfo.all(order.billingInfo);
        }
        return this;
    };
};