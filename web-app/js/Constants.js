Constants = {

    NUM_CHEESECAKE_SLOTS: 8,

    Urls : {
        STRIPE_GET_PUBLISHABLE_KEY: '/stripe/getPublishableKey',
        STRIPE_CHARGE: '/stripe/charge',
        PRODUCT_GET_DUMP: '/product/getDump'
    },

    Boundaries : {
        PICK_TO_PERSONALIZE: {
            name: 'PICK_TO_PERSONALIZE',
            friendlyName: 'pick',
            position: function() {
                return Utils.getSectionHeight() * 1 - 2 * Utils.getViewportHeight() + $('header').height();
            }
        },
        PERSONALIZE_TO_PACK: {
            name: 'PERSONALIZE_TO_PACK',
            friendlyName: 'personalize',
            position: function() {
                return Utils.getSectionHeight() * 2 - 2 * Utils.getViewportHeight();
            }
        },
        PACK_TO_PAY: {
            name: 'PACK_TO_PAY',
            friendlyName: 'pack',
            position: function() {
                return Utils.getSectionHeight() * 3 - 2 * Utils.getViewportHeight();
            }
        },
        PAY_TO_ORDER_COMPLETE: {
            name: 'PAY_TO_ORDER_COMPLETE',
            friendlyName: 'pay',
            position: function() {
                return Utils.getSectionHeight() * 4 - 2 * Utils.getViewportHeight();
            }
        },
        END: {
            name: 'END',
            friendlyName: 'orderComplete',
            position: function() {
                return Utils.getSectionHeight() * 5 - 2 * Utils.getViewportHeight();
            }
        }
    }
};