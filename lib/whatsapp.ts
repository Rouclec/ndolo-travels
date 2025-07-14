"use server"

interface WhatsAppMessage {
  to: string
  message: string
  mediaUrl?: string
}

export async function sendWhatsAppMessage({ to, message, mediaUrl }: WhatsAppMessage) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER // e.g., "whatsapp:+14155238886"

    const body = new URLSearchParams({
      From: whatsappNumber!,
      To: `whatsapp:${to}`,
      Body: message,
    })

    if (mediaUrl) {
      body.append("MediaUrl", mediaUrl)
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error("WhatsApp message failed")
    }

    const result = await response.json()
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("WhatsApp sending error:", error)
    return { success: false, error: error.message }
  }
}

export async function sendTicketViaWhatsApp(phoneNumber: string, bookingDetails: any) {
  const ticketMessage = `
🎫 *BusTicket AI - Your Ticket*

*Booking ID:* ${bookingDetails.bookingId}
*Route:* ${bookingDetails.from} → ${bookingDetails.to}
*Date:* ${bookingDetails.date}
*Time:* ${bookingDetails.time}
*Seat:* ${bookingDetails.seat || "Not assigned"}
*Passenger:* ${bookingDetails.passengerName}
*Amount:* ${bookingDetails.amount}

*Important:*
• Show this message to the driver
• Arrive 15 minutes before departure
• Keep your phone charged for verification

*Need help?* Reply to this message or call our support.

Safe travels! 🚌
  `.trim()

  return await sendWhatsAppMessage({
    to: phoneNumber,
    message: ticketMessage,
  })
}

export async function sendWelcomeMessage(phoneNumber: string, firstName: string) {
  const welcomeMessage = `
👋 Welcome to BusTicket AI, ${firstName}!

Thanks for choosing us for your travel needs. Here's what you can expect:

✅ Instant ticket delivery via WhatsApp
🤖 24/7 AI assistant support
💰 Best prices with smart recommendations
📱 Easy mobile money payments

*Quick Commands:*
• Reply "HELP" for assistance
• Reply "STOP" to unsubscribe from offers
• Reply "BOOKINGS" to see your trips

Happy travels! 🚌
  `.trim()

  return await sendWhatsAppMessage({
    to: phoneNumber,
    message: welcomeMessage,
  })
}
