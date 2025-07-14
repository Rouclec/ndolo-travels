"use server"

interface CampayPaymentRequest {
  amount: string
  currency: string
  from: string
  description: string
  external_reference: string
}

interface CampayPaymentResponse {
  reference: string
  ussd_code: string
  operator: string
  status: string
}

export async function initiateCampayPayment(paymentData: CampayPaymentRequest): Promise<CampayPaymentResponse> {
  try {
    const response = await fetch("https://api.campay.net/collect/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.CAMPAY_API_KEY}`,
      },
      body: JSON.stringify({
        ...paymentData,
        currency: "XAF", // Central African Franc
      }),
    })

    if (!response.ok) {
      throw new Error("Payment initiation failed")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Campay payment error:", error)
    throw new Error("Payment service unavailable")
  }
}

export async function checkCampayPaymentStatus(reference: string): Promise<{ status: string }> {
  try {
    const response = await fetch(`https://api.campay.net/transaction/${reference}/`, {
      headers: {
        Authorization: `Token ${process.env.CAMPAY_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error("Status check failed")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Campay status check error:", error)
    throw new Error("Status check unavailable")
  }
}
