"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MessageCircle, Bell, BellOff } from "lucide-react"

interface WhatsAppPreferencesProps {
  phoneNumber: string
  onClose: () => void
}

export default function WhatsAppPreferences({ phoneNumber, onClose }: WhatsAppPreferencesProps) {
  const [preferences, setPreferences] = useState({
    bookingUpdates: true,
    travelTips: true,
    specialOffers: true,
    routeAlerts: false,
    priceDrops: true,
  })

  const handleSave = () => {
    // Here you would save preferences to your backend
    console.log("Saving WhatsApp preferences:", preferences)
    onClose()
  }

  const handleUnsubscribeAll = () => {
    setPreferences({
      bookingUpdates: true, // Keep booking updates as they're essential
      travelTips: false,
      specialOffers: false,
      routeAlerts: false,
      priceDrops: false,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp Notifications</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Manage your notification preferences for {phoneNumber}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Booking Updates</Label>
                <p className="text-xs text-gray-500">Essential booking confirmations and changes</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.bookingUpdates}
                onChange={(e) => setPreferences({ ...preferences, bookingUpdates: e.target.checked })}
                disabled // Always enabled for essential updates
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Travel Tips</Label>
                <p className="text-xs text-gray-500">Helpful travel advice and route information</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.travelTips}
                onChange={(e) => setPreferences({ ...preferences, travelTips: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Special Offers</Label>
                <p className="text-xs text-gray-500">Discounts and promotional deals</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.specialOffers}
                onChange={(e) => setPreferences({ ...preferences, specialOffers: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Route Alerts</Label>
                <p className="text-xs text-gray-500">Traffic updates and route changes</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.routeAlerts}
                onChange={(e) => setPreferences({ ...preferences, routeAlerts: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Price Drops</Label>
                <p className="text-xs text-gray-500">Notifications when prices decrease</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.priceDrops}
                onChange={(e) => setPreferences({ ...preferences, priceDrops: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                💡 <strong>Quick Unsubscribe:</strong> Send "STOP" to our WhatsApp number anytime to unsubscribe from
                all marketing messages
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleUnsubscribeAll} className="flex-1 bg-transparent">
                <BellOff className="w-4 h-4 mr-2" />
                Unsubscribe All
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Bell className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
