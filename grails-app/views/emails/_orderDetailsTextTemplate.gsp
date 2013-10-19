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