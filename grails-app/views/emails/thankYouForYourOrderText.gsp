Hello ${sale.giver.name},

A delightful gift is just around the corner!  This email confirms that we have received your order for ${sale.recipient.name}.  

Details for order #${sale.id}:

= Recipient = 
${sale.recipient.name}<% if (sale.recipient.companyName)%>
${sale.recipient.companyName}
${sale.recipient.addressLine1}<% if (sale.recipient.addressLine2)%>
${sale.recipient.addressLine2}
${sale.recipient.city}, ${sale.recipient.state}  ${sale.recipient.zipCode}<% if (sale.recipient.phoneNumber)%>
${sale.recipient.phoneNumber}

= Cheesecakes =<% sale.saleItems.each { saleItem -> %>
• ${saleItem.quantity} ${saleItem.product.name}<%}%>

= Gift Message =
${sale.giftMessage}

= Arrival Date =
${sale.customerFriendlyArrivalDate}

Your credit card has been charged ${price}.

If you have any questions, don't hesitate to email ${customerServiceEmailAddress}.

From all of us up here in Ferndale, Washington, we greatly appreciate your business.  We'll get baking and packing, and we'll send you another email with a tracking number once your order has shipped.

Thanks again,
--Chuckanut Bay Foods and the givecheasecakes.com team
