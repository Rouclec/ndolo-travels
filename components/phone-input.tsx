"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

const countryCodes = [
  { code: "+237", country: "Cameroon", flag: "🇨🇲" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+225", country: "Ivory Coast", flag: "🇨🇮" },
  { code: "+221", country: "Senegal", flag: "🇸🇳" },
]

export default function PhoneInput({
  value,
  onChange,
  placeholder = "6XX XXX XXX",
  label,
  required = false,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("+237")
  const [phoneNumber, setPhoneNumber] = useState("")

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone)
    onChange(`${countryCode} ${phone}`)
  }

  const handleCountryChange = (code: string) => {
    setCountryCode(code)
    onChange(`${code} ${phoneNumber}`)
  }

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex space-x-2 w-full">
        <Select value={countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-24 sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center space-x-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          required={required}
        />
      </div>
    </div>
  )
}
