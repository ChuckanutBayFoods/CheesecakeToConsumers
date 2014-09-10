/**
 * URLS to the backend APIs.
 */
app.constant('URLS', {
    PRODUCT : {
        GET_DUMP : '/product/getDump'
    },
    STRIPE : {
        GET_PUBLISHABLE_KEY : '/stripe/getPublishableKey',
        CHARGE : '/stripe/charge'
    }
});