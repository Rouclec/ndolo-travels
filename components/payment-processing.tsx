"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Smartphone, AlertCircle, CheckCircle } from "lucide-react"

interface PaymentProcessingProps {
  paymentMethod: string
  amount: string
  phoneNumber: string
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentProcessing({
  paymentMethod,
  amount,
  phoneNumber,
  onSuccess,
  onCancel,
}: PaymentProcessingProps) {
  const [status, setStatus] = useState<"processing" | "waiting" | "success" | "failed">("processing")
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setStatus("waiting")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (status === "waiting" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setStatus("failed")
    }
  }, [status, countdown])

  const getUSSDCode = () => {
    switch (paymentMethod) {
      case "mtn":
        return "*126#"
      case "orange":
        return "#150#" // Orange Money Cameroon USSD code
      default:
        return ""
    }
  }

  const getProviderName = () => {
    switch (paymentMethod) {
      case "mtn":
        return "MTN Mobile Money"
      case "orange":
        return "Orange Money"
      default:
        return ""
    }
  }

  const handleTryAgain = () => {
    setStatus("processing")
    setCountdown(60)
    // Here you would retry the payment with Campay
  }

  const handleConfirmPayment = () => {
    setStatus("success")
    // Automatically proceed to confirmation after 2 seconds
    setTimeout(() => {
      onSuccess()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Payment Processing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "processing" && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600">Initiating {getProviderName()} payment...</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Amount:</strong> {amount}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Phone:</strong> {phoneNumber}
                </p>
              </div>
            </div>
          )}

          {status === "waiting" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confirm Payment on Your Phone</h3>
              <p className="text-gray-600 mb-4">A payment request has been sent to your {getProviderName()} account</p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>If you don't see a popup, dial:</strong>
                </p>
                <div className="text-2xl font-bold text-yellow-900 mb-2">{getUSSDCode()}</div>
                <p className="text-xs text-yellow-700">Follow the prompts to complete your payment</p>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Waiting for confirmation... {countdown}s</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleConfirmPayment} className="w-full">
                  I've Completed the Payment
                </Button>
                <Button variant="outline" onClick={handleTryAgain} className="w-full bg-transparent">
                  Resend Payment Request
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your booking has been confirmed</p>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-green-600" />
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">Payment was not completed within the time limit</p>
              <div className="space-y-2">
                <Button onClick={handleTryAgain} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={onCancel} className="w-full bg-transparent">
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}

          {status !== "success" && (
            <Button variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
