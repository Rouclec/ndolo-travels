import { type NextRequest, NextResponse } from "next/server"
import { sendTicketViaWhatsApp } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (implement based on Campay documentation)
    const signature = request.headers.get("x-campay-signature")

    // Validate the webhook payload
    if (!body.reference || !body.status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { reference, status, amount, phone, external_reference } = body

    if (status === "SUCCESSFUL") {
      // Payment was successful
      console.log(`Payment successful for reference: ${reference}`)

      // Here you would:
      // 1. Update booking status in database
      // 2. Send WhatsApp ticket
      // 3. Send confirmation email if provided

      // Example: Send WhatsApp ticket
      if (phone) {
        const bookingDetails = {
          bookingId: external_reference || reference,
          from: "Buea", // You'd get this from your database
          to: "Douala",
          date: new Date().toLocaleDateString(),
          time: "08:00 AM",
          passengerName: "John Doe", // From database
          amount: `${amount} FCFA`,
        }

        await sendTicketViaWhatsApp(phone, bookingDetails)
      }

      return NextResponse.json({ status: "success" })
    } else if (status === "FAILED") {
      // Payment failed
      console.log(`Payment failed for reference: ${reference}`)

      // Here you would:
      // 1. Update booking status to failed
      // 2. Optionally send failure notification

      return NextResponse.json({ status: "failed" })
    }

    return NextResponse.json({ status: "received" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Verify webhook signature (implement based on Campay's documentation)
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // This would implement Campay's signature verification
  // Return true if signature is valid
  return true
}
