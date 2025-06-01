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
        <div className="mt-10">
          <form className="space-y-3">
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Your email address</label>
              <input
                type="text"
                placeholder="Enter your email address"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Your phone</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Best time to call</label>
              <div className="flex items-center justify-between w-full">
                <span className="text-blue-400 font-light">(Select a day)</span>
                <div className="flex items-center gap-5">
                  <p className="text-black">Today</p>
                  <input type="radio" name="day" />
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-black">Tomorrow</p>
                  <input type="radio" name="day" />
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-black">or Pick a date</p>
                  <label htmlFor="day" className={"cursor-pointer"}>
                    <Calendar1Icon className="text-gray-400" size={25} />
                  </label>
                  <input type="date" hidden id="day" />
                </div>
              </div>
              <div className="flex items-start flex-col w-full mt-3">
                <span className="text-blue-400 font-light">(Select a time)</span>
                <div className="flex items-start flex-1 w-full gap-7 justify-center">
                  <div className="flex items-center gap-8">
                    <div className="space-y-1">
                      <p className="text-black">Morning</p>
                      <p className="text-black">Lunch time</p>
                      <p className="text-black">Afternoon</p>
                      <p className="text-black">Early Evening</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-black flex items-center justify-between"><span>9.00AM</span> <span>-</span> <span>12 Noon</span></p>
                      <p className="text-black flex items-center justify-between"><span>12 Noon</span> <span>-</span> <span>2.00PM</span></p>
                      <p className="text-black flex items-center justify-between"><span>2.00PM</span> <span>-</span> <span>5.00PM</span></p>
                      <p className="text-black flex items-center justify-between"><span>5.00PM</span> <span>-</span> <span>6.00PM</span></p>
                    </div>
                    <div className="space-y-1 flex flex-col gap-3">
                      <input type="radio" name="time" />
                      <input type="radio" name="time" />
                      <input type="radio" name="time" />
                      <input type="radio" name="time" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-black">or Pick a time</p>
                    <div className="flex items-center gap-2">
                      {/* <input type="time" className={`w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none`} /> */}
                      <select
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 8; // 8 to 19
                          const display = hour.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={display}>
                              {display}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                      >
                        {Array.from({ length: 60 }, (_, i) => {
                          const hour = i; // 8 to 19
                          const display = hour.toString().padStart(2, '0');
                          return (
                            <option key={hour} value={display}>
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

            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Message</label>
              <textarea
                placeholder="Enter your message"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none h-[4rem]`}
              />
            </div>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
            >
              Send
            </button>
          </form>
        </div>
      </CustomDialog>

      <CustomDialog open={isMeetingOpen} setOpen={setISMeetingOpen} heading={"Book a Demo Meeting"}>
        <div className="mt-10">
          <form className="space-y-3">
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Your email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Pick a date & time</label>

              <div className="grid grid-cols-3 gap-2 w-full">
                <input
                  type="date"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
                />
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = i + 8; // 8 to 19
                    const display = hour.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={display}>
                        {display}
                      </option>
                    );
                  })}
                </select>


                <select
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const hour = i; // 8 to 19
                    const display = hour.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={display}>
                        {display}
                      </option>
                    );
                  })}
                </select>
              </div>

            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Message</label>
              <textarea
                placeholder="Enter your message"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none h-[4rem]`}
              />
            </div>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
            >
              Send
            </button>
          </form>
        </div>
      </CustomDialog>
    </>
  )
}
