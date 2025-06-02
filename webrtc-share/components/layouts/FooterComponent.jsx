"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Calendar1, Calendar1Icon, Send } from "lucide-react"
import { useState } from "react"
import CustomDialog from "../dialogs/CustomDialog"

export function Footer() {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isMeetingOpen, setISMeetingOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Section - Company Info */}
            <div className="space-y-4 flex items-center justify-center flex-col">
              <h2 className="text-2xl font-bold text-gray-900">Videodesk.co.uk</h2>
              <div className="space-y-2 text-gray-600 flex items-center justify-center flex-col">
                <div>
                  <span className="font-medium text-center">Phone number</span>
                </div>
                <div>
                  <span className="font-medium text-center">Email</span>
                </div>
              </div>
            </div>



            <div className="flex items-center justify-center flex-col gap-8">
              <Button className={"text-white bg-purple-500 flex items-center justify-between gap-2 cursor-pointer w-[12rem]"} onClick={() => setIsCallbackOpen(true)}>
                <span>Request a Callback</span>
                <Calendar />
              </Button>
              <Button className={"text-white bg-purple-500 flex items-center justify-between gap-2 cursor-pointer w-[12rem]"} onClick={() => setISMeetingOpen(true)}>
                <span>Book a Demo Meeting</span>
                <Calendar />
              </Button>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="space-y-3">
              <Link href="/about" className="block text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/how-it-works" className="block text-gray-600 hover:text-gray-900 transition-colors">
                How it works
              </Link>
              <Link href="/launch" className="block text-gray-600 hover:text-gray-900 transition-colors">
                Launch new video link
              </Link>
              <Link href="/pricing" className="block text-gray-600 hover:text-gray-900 transition-colors">
                Pricing and Plans
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <CustomDialog open={isCallbackOpen} setOpen={setIsCallbackOpen} heading={"Request a Callback"}>
        <div className="max-h-[80vh] overflow-y-auto">
          <form className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Your email address</label>
              <input
                type="text"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Your phone</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-start flex-col gap-4">
              <label className="text-gray-800 font-semibold text-sm">Best time to call</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-blue-600 font-medium text-sm">(Select a day)</span>
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                    <p className="text-gray-700 text-sm">Today</p>
                    <input type="radio" name="day" className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                    <p className="text-gray-700 text-sm">Tomorrow</p>
                    <input type="radio" name="day" className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-start gap-2 flex-col">
                    <p className="text-gray-700 text-sm">or Pick a date:</p>
                    <input type="date" id="day" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 text-sm"/>
                  </div>
                </div>
                <div className="flex items-start flex-1 w-full gap-3">
                  <div className="flex items-start gap-4 bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm font-medium h-6 flex items-center w-20">Morning</p>
                      <p className="text-gray-700 text-sm font-medium h-6 flex items-center w-20">Lunch time</p>
                      <p className="text-gray-700 text-sm font-medium h-6 flex items-center w-20">Afternoon</p>
                      <p className="text-gray-700 text-sm font-medium h-6 flex items-center w-20 whitespace-pre">Early Evening</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-black flex items-center justify-between gap-2"><span>9.00 AM</span> <span>-</span> <span>12 Noon</span></p>
                      <p className="text-black flex items-center justify-between gap-2"><span>12 Noon</span> <span>-</span> <span>2.00 PM</span></p>
                      <p className="text-black flex items-center justify-between gap-2"><span>2.00 PM</span> <span>-</span> <span>5.00 PM</span></p>
                      <p className="text-black flex items-center justify-between gap-2"><span>5.00 PM</span> <span>-</span> <span>6.00 PM</span></p>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <div className="h-6 flex items-center">
                        <input type="radio" name="time" className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="h-6 flex items-center">
                        <input type="radio" name="time" className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="h-6 flex items-center">
                        <input type="radio" name="time" className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="h-6 flex items-center">
                        <input type="radio" name="time" className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm font-medium mb-2">or Pick a time</p>
                    <div className="flex items-center gap-2">
                      <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 text-sm bg-white">
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 8;
                          const display = hour.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={display}>
                              {display}
                            </option>
                          );
                        })}
                      </select>
                      <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 text-sm bg-white">
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i;
                          const display = minute.toString().padStart(2, '0');
                          return (
                            <option key={minute} value={display}>
                              {display}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Message</label>
              <textarea
                placeholder="Enter your message"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm h-24 resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Send Request
            </button>
          </form>
        </div>
      </CustomDialog>

      <CustomDialog open={isMeetingOpen} setOpen={setISMeetingOpen} heading={"Book a Demo Meeting"}>
        <div className="max-h-[80vh] overflow-y-auto">
          <form className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Your email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Pick a date & time</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-3 gap-3 w-full">
                  <input
                    type="date"
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm"
                  />
                  <select className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm">
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 8;
                      const display = hour.toString().padStart(2, '0');
                      return (
                        <option key={hour} value={display}>
                          {display}:00
                        </option>
                      );
                    })}
                  </select>
                  <select className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm">
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i;
                      const display = minute.toString().padStart(2, '0');
                      return (
                        <option key={minute} value={display}>
                          {display}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-start flex-col gap-3">
              <label className="text-gray-800 font-semibold text-sm">Message</label>
              <textarea
                placeholder="Enter your message"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm h-24 resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Book Meeting
            </button>
          </form>
        </div>
      </CustomDialog>
    </>
  )
}
