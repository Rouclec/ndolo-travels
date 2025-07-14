"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Bot, MessageCircle, Smartphone, Settings, Download } from "lucide-react"
import WhatsAppPreferences from "@/components/whatsapp-preferences"
import PhoneInput from "@/components/phone-input"
import PaymentProcessing from "@/components/payment-processing"
import { sendTicketViaWhatsApp, sendWelcomeMessage } from "@/lib/whatsapp"
import jsPDF from "jspdf" // Import jspdf
import QRCode from "qrcode" // Import qrcode

export default function BusTicketingApp() {
  const [currentView, setCurrentView] = useState("search")
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  })
  const [showChatbot, setShowChatbot] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [whatsappOptIn, setWhatsappOptIn] = useState(false)
  const [userPhone, setUserPhone] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [showWhatsAppPrefs, setShowWhatsAppPrefs] = useState(false)
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false)
  const [passengerData, setPassengerData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  })
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<any>(null)

  // AI Chatbot state
  const [chatHistory, setChatHistory] = useState([
    { type: "ai", text: "👋 Hello! I'm your AI travel assistant. How can I help you today?" },
    { type: "ai", text: "You can select an option below or type your question." },
  ])
  const [userMessage, setUserMessage] = useState("")

  const handleAIChatOption = (option: string) => {
    let aiResponse = ""
    switch (option) {
      case "find_routes":
        aiResponse =
          "To find routes, please use the 'Find Your Journey' search form on the main page. Enter your origin, destination, and date to see available buses."
        break
      case "check_schedules":
        aiResponse =
          "You can check schedules by performing a search on the main page. The results will show departure times and durations for each bus."
        break
      case "booking_assistance":
        aiResponse =
          "For booking assistance, ensure all passenger details are correctly filled on the booking page. If you face issues, try refreshing the page or contact support."
        break
      case "payment_support":
        aiResponse =
          "For payment issues, please ensure you have sufficient funds and dial the USSD code provided on the payment screen. If problems persist, contact your mobile money provider."
        break
      default:
        aiResponse = "I'm sorry, I didn't understand that. Please select an option or rephrase your question."
    }
    setChatHistory((prev) => [...prev, { type: "user", text: option }, { type: "ai", text: aiResponse }])
    setUserMessage("") // Clear input after selection
  }

  const handleSendMessage = () => {
    if (userMessage.trim() === "") return
    setChatHistory((prev) => [...prev, { type: "user", text: userMessage }])
    // Simulate AI response for typed messages (can be expanded with actual AI model)
    const lowerCaseMessage = userMessage.toLowerCase()
    let aiResponse =
      "I'm still learning to understand complex questions. Please try selecting an option or ask a simpler question."
    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      aiResponse = "Hello there! How can I assist you with your travel plans today?"
    } else if (lowerCaseMessage.includes("ticket")) {
      aiResponse = "Are you looking to book a ticket, or do you need help with an existing ticket?"
    } else if (lowerCaseMessage.includes("payment")) {
      aiResponse =
        "For payment issues, please ensure you have sufficient funds and dial the USSD code provided on the payment screen."
    }
    setChatHistory((prev) => [...prev, { type: "ai", text: aiResponse }])
    setUserMessage("")
  }

  const popularRoutes = [
    { from: "Buea", to: "Douala", price: "1500 FCFA", duration: "1h 45m", available: 20 },
    { from: "Buea", to: "Yaoundé", price: "3500 FCFA", duration: "4h 30m", available: 12 },
    { from: "Douala", to: "Yaoundé", price: "2500 FCFA", duration: "3h 30m", available: 15 },
    { from: "Yaoundé", to: "Bamenda", price: "4000 FCFA", duration: "5h 45m", available: 8 },
    { from: "Douala", to: "Bafoussam", price: "3500 FCFA", duration: "4h 15m", available: 12 },
    { from: "Yaoundé", to: "Ngaoundéré", price: "6500 FCFA", duration: "8h 20m", available: 5 },
  ]

  const aiRecommendations = [
    "🤖 Based on your search, I recommend booking the 7:00 AM departure for better prices!",
    "💡 Tip: Tuesday and Wednesday have 15% lower fares on this route",
    "⚡ Only 3 seats left at this price - book now to secure your spot!",
  ]

  const handleSearch = () => {
    setCurrentView("results")
  }

  const handleBooking = (route: any) => {
    setCurrentView("booking")
  }

  const handleDownloadTicket = async () => {
    if (!confirmedBookingDetails) return

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(22)
    doc.text("NdoloTravel E-Ticket", 105, 20, { align: "center" })

    // Add booking details
    doc.setFontSize(12)
    let yPos = 40
    const addDetail = (label: string, value: string) => {
      doc.text(`${label}:`, 20, yPos)
      doc.setFont("helvetica", "bold")
      doc.text(value, 60, yPos)
      doc.setFont("helvetica", "normal")
      yPos += 10
    }

    addDetail("Booking ID", confirmedBookingDetails.bookingId)
    addDetail("Route", `${confirmedBookingDetails.from} → ${confirmedBookingDetails.to}`)
    addDetail("Date", confirmedBookingDetails.date)
    addDetail("Time", confirmedBookingDetails.time)
    addDetail("Passenger", confirmedBookingDetails.passengerName)
    addDetail("Amount Paid", confirmedBookingDetails.amount)

    // Add important notes
    yPos += 15
    doc.setFontSize(10)
    doc.text("Important Notes:", 20, yPos)
    yPos += 7
    doc.text("• Show this ticket to the driver.", 20, yPos)
    yPos += 7
    doc.text("• Arrive 15 minutes before departure.", 20, yPos)
    yPos += 7
    doc.text("• Keep your phone charged for verification.", 20, yPos)

    // Generate QR Code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(confirmedBookingDetails.bookingId, {
        width: 150,
        margin: 2,
      })
      doc.addImage(qrCodeDataUrl, "PNG", 75, yPos + 10, 60, 60) // x, y, width, height
      doc.setFontSize(10)
      doc.text("Scan for Validation", 105, yPos + 75, { align: "center" })
    } catch (err) {
      console.error("Failed to generate QR code:", err)
      doc.text("QR Code could not be generated.", 105, yPos + 10, { align: "center" })
    }

    // Save the PDF
    doc.save(`NdoloTravel_Ticket_${confirmedBookingDetails.bookingId}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">NdoloTravel</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChatbot(!showChatbot)}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </Button>
              {!isRegistered ? (
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                  <PhoneInput value={userPhone} onChange={setUserPhone} placeholder="6XX XXX XXX" />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (userPhone) {
                        setIsRegistered(true)
                      }
                    }}
                    disabled={!userPhone}
                    className="w-full sm:w-auto"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="text-sm text-gray-600">📱 {userPhone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsRegistered(false)
                      setUserPhone("")
                    }}
                  >
                    Change
                  </Button>
                  {isRegistered && (
                    <Button variant="ghost" size="sm" onClick={() => setShowWhatsAppPrefs(true)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {currentView === "search" && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Journey with NdoloTravel</h2>
            <p className="text-xl text-gray-600 mb-8">Smart, fast, and reliable bus booking for Cameroon</p>
            {/* Search Form */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Find Your Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label htmlFor="from">From</Label>
                    <Select onValueChange={(value) => setSearchData({ ...searchData, from: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buea">Buea</SelectItem>
                        {searchData.to !== "douala" && <SelectItem value="douala">Douala</SelectItem>}
                        {searchData.to !== "yaounde" && <SelectItem value="yaounde">Yaoundé</SelectItem>}
                        {searchData.to !== "bamenda" && <SelectItem value="bamenda">Bamenda</SelectItem>}
                        {searchData.to !== "bafoussam" && <SelectItem value="bafoussam">Bafoussam</SelectItem>}
                        {searchData.to !== "ngaoundere" && <SelectItem value="ngaoundéré">Ngaoundéré</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="to">To</Label>
                    <Select onValueChange={(value) => setSearchData({ ...searchData, to: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {searchData.from !== "buea" && <SelectItem value="buea">Buea</SelectItem>}
                        {searchData.from !== "douala" && <SelectItem value="douala">Douala</SelectItem>}
                        {searchData.from !== "yaounde" && <SelectItem value="yaounde">Yaoundé</SelectItem>}
                        {searchData.from !== "bamenda" && <SelectItem value="bamenda">Bamenda</SelectItem>}
                        {searchData.from !== "bafoussam" && <SelectItem value="bafoussam">Bafoussam</SelectItem>}
                        {searchData.from !== "ngaoundere" && <SelectItem value="ngaoundéré">Ngaoundéré</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passengers">Passengers</Label>
                    <Select onValueChange={(value) => setSearchData({ ...searchData, passengers: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Passenger</SelectItem>
                        <SelectItem value="2">2 Passengers</SelectItem>
                        <SelectItem value="3">3 Passengers</SelectItem>
                        <SelectItem value="4">4+ Passengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSearch} className="w-full md:w-auto" size="lg">
                  Search Buses
                </Button>
              </CardContent>
            </Card>
            {/* AI Recommendations */}
            <div className="mt-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>AI Recommendations</span>
              </h3>
              <div className="space-y-2">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
            {/* Popular Routes */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Popular Routes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularRoutes.map((route, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {route.from} → {route.to}
                          </p>
                          <p className="text-sm text-gray-600">{route.duration}</p>
                        </div>
                        <Badge variant="secondary">{route.available} seats</Badge>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{route.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {currentView === "results" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Buses</h2>
              <Button variant="outline" onClick={() => setCurrentView("search")}>
                New Search
              </Button>
            </div>

            <div className="space-y-4">
              {popularRoutes.map((route, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-lg font-semibold">{route.from}</div>
                          <div className="text-gray-400">→</div>
                          <div className="text-lg font-semibold">{route.to}</div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{route.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{route.available} seats available</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{route.price}</div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                        <Button onClick={() => handleBooking(route)}>Book Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {currentView === "booking" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Passenger Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={passengerData.firstName}
                      onChange={(e) => setPassengerData({ ...passengerData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={passengerData.lastName}
                      onChange={(e) => setPassengerData({ ...passengerData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <PhoneInput
                    value={passengerData.phone}
                    onChange={(value) => setPassengerData({ ...passengerData, phone: value })}
                    label="Phone Number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={passengerData.email}
                    onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>WhatsApp Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="whatsapp-optin"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="whatsapp-optin" className="text-sm">
                      📱 Send me booking updates, travel tips, and special offers via WhatsApp
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    You can unsubscribe anytime by sending "STOP" to our WhatsApp number
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant={selectedPayment === "mtn" ? "default" : "outline"}
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setSelectedPayment("mtn")}
                  >
                    <Smartphone className="w-6 h-6" />
                    <span>MTN Mobile Money</span>
                  </Button>
                  <Button
                    variant={selectedPayment === "orange" ? "default" : "outline"}
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setSelectedPayment("orange")}
                  >
                    <Smartphone className="w-6 h-6" />
                    <span>Orange Money</span>
                  </Button>
                </div>
                {selectedPayment && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓{" "}
                      {selectedPayment === "mtn"
                        ? "MTN Mobile Money"
                        : selectedPayment === "orange"
                          ? "Orange Money"
                          : "Card Payment"}{" "}
                      selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setCurrentView("results")} className="flex-1">
                Back
              </Button>
              <Button className="flex-1" disabled={!selectedPayment} onClick={() => setShowPaymentProcessing(true)}>
                Complete Booking {selectedPayment ? "" : "(Select Payment Method)"}
              </Button>
            </div>
          </div>
        )}

        {/* Booking Confirmation */}
        {currentView === "confirmation" && confirmedBookingDetails && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600">Your ticket has been booked successfully</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold">{confirmedBookingDetails.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-semibold">
                      {confirmedBookingDetails.from} → {confirmedBookingDetails.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{confirmedBookingDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-semibold">
                      {selectedPayment === "mtn"
                        ? "MTN Mobile Money"
                        : selectedPayment === "orange"
                          ? "Orange Money"
                          : "Card Payment"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg">{confirmedBookingDetails.amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">WhatsApp Delivery</span>
              </div>
              <p className="text-sm text-blue-700">
                Your ticket will be sent to your WhatsApp within 2 minutes
                {whatsappOptIn && " • You'll also receive travel updates and offers"}
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={handleDownloadTicket} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Ticket (PDF)
              </Button>
              <Button onClick={() => setCurrentView("search")} className="w-full">
                Book Another Trip
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </div>

      {showPaymentProcessing && (
        <PaymentProcessing
          paymentMethod={selectedPayment}
          amount="2500 FCFA" // This should ideally come from the selected route
          phoneNumber={passengerData.phone}
          onSuccess={() => {
            setShowPaymentProcessing(false)
            const newBookingId = `NT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            const details = {
              bookingId: newBookingId,
              from: searchData.from || "Douala", // Use searchData for dynamic values
              to: searchData.to || "Yaoundé", // Use searchData for dynamic values
              date: searchData.date || "Today",
              time: "08:00 AM", // Placeholder, should be dynamic
              passengerName: `${passengerData.firstName} ${passengerData.lastName}`,
              amount: "2500 FCFA", // Placeholder, should be dynamic
            }
            setConfirmedBookingDetails(details) // Store details for confirmation and download
            setCurrentView("confirmation")
            // Send WhatsApp messages
            if (passengerData.firstName) {
              sendWelcomeMessage(passengerData.phone, passengerData.firstName)
              sendTicketViaWhatsApp(passengerData.phone, details) // Pass the stored details
            }
          }}
          onCancel={() => setShowPaymentProcessing(false)}
        />
      )}

      {/* AI Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChatbot(false)}
              className="text-white hover:bg-blue-700"
            >
              ×
            </Button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  msg.type === "user"
                    ? "bg-blue-100 text-blue-800 ml-auto max-w-[80%]"
                    : "bg-gray-100 text-gray-800 mr-auto max-w-[80%]"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleAIChatOption("find_routes")}>
                Find Routes
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAIChatOption("check_schedules")}>
                Check Schedules
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAIChatOption("booking_assistance")}>
                Booking Assistance
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAIChatOption("payment_support")}>
                Payment Support
              </Button>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage()
                }}
              />
              <Button size="sm" onClick={handleSendMessage}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose NdoloTravel?</h2>
            <p className="text-xl text-gray-600">Built for Cameroon, powered by AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Smart recommendations and 24/7 AI assistant support</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Money</h3>
              <p className="text-gray-600">Pay with MTN Mobile Money, Orange Money, or cards</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Tickets</h3>
              <p className="text-gray-600">Receive your tickets directly on WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
      {/* WhatsApp Preferences Modal */}
      {showWhatsAppPrefs && <WhatsAppPreferences phoneNumber={userPhone} onClose={() => setShowWhatsAppPrefs(false)} />}
    </div>
  )
}
