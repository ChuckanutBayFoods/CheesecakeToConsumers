Hello ${sale.giver.name},

Your cheesecakes for ${sale.recipient.name} have left the bakery and shipped!  They will arrive on ${sale.customerFriendlyArrivalDate}.

Details for order #${sale.id}:

= Shipment Details =
${sale.shippingMethod.name}
Tracking #: ${sale.shipmentTrackingNumber}
Tracking URL: ${sale.shippingMethod.trackingUrlPrefix}${sale.shipmentTrackingNumber}

<g:render template="/emails/orderDetailsTextTemplate" model="[sale:sale]"/>

If you have any questions, don't hesitate to email ${customerServiceEmailAddress}.

Again, from all of us up here in Ferndale, Washington, thank you for your business.
--Chuckanut Bay Foods and the givecheasecakes.com team
