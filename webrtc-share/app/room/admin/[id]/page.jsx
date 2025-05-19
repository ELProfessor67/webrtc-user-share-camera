"use client"
import { useState, useRef, use } from "react"
import Image from "next/image"
import { Camera, Trash2, ImageIcon, Plus, Maximize2, VideoIcon, PlayIcon } from "lucide-react"
import useWebRTC from "@/hooks/useWebRTC"

export default function Page({ params }) {
  const { id } = use(params);
  const [targetTime, setTargetTime] = useState("Emergency 24 Hours")
  const [showDropdown, setShowDropdown] = useState(false)
  const videoRef = useRef(null);
  const { handleDisconnect, isConnected, screenshots, recordings, recordingActive, takeScreenshot, takeRecording,startPeerConnection, handleVideoPlay, showVideoPlayError } = useWebRTC(true, id, videoRef);



  return (
    
    <div className="max-w-6xl mx-auto p-4 py-10 font-sans">
      <button onClick={startPeerConnection}>Start Peer Connection</button>
      <div className="gap-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Column */}
        <div className="space-y-6 flex gap-5">
          <div className="flex-1 relative">
            {/* Logo and User */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-gray-900 flex items-center">
                  <VideoIcon className="mr-2" />
                  <span>Videonary.com</span>
                </a>
              </div>
            </div>

            {/* User Greeting */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src="https://i.pravatar.cc/300"
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hello,</p>
                <p className="font-semibold">Sharon</p>
              </div>
            </div>

            {/* Live Video */}
            <div className="relative">
              <div className="h-[32.5rem] w-[90%] bg-gray-200 rounded-md overflow-hidden relative">
                <video ref={videoRef} autoPlay className="w-full h-full object-cover absolute top-0 left-0" />
                {showVideoPlayError && (
                  <button onClick={handleVideoPlay} className=" bg-yellow-500 p-3 rounded-full text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><PlayIcon className="w-6 h-6" /></button>
                )}
              </div>
              <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 text-sm font-medium">{isConnected ? "Live" : "Disconnected"}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-10">
            {/* Video Recording Section */}
            <div>
              <h2 className="text-lg font-medium mb-3">Video Recording :</h2>
              <div className="grid grid-cols-2 gap-3">
                {
                  recordings.length === 0 && (
                    <h1>No recordings</h1>
                  )
                }
                {
                  recordings.map((recording, index) => (
                    <div className="aspect-square bg-gray-200 rounded-md flex flex-col items-center justify-center relative">
                      <video src={recording} controls className="w-full h-full object-cover absolute top-0 left-0" />
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <button className="p-1 hover:bg-gray-300 rounded">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-300 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                }

              </div>
            </div>

            {/* Image Screenshot Section */}
            <div>
              <h2 className="text-lg font-medium mb-3">Image screenshot :</h2>
              <div className="grid grid-cols-2 gap-3">
                {
                  screenshots.length === 0 && (
                    <h1>No screenshots</h1>
                  )
                }

                {
                  screenshots.map((screenshot, index) => (
                    <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center relative">
                      <img
                        src={screenshot}
                        alt="screenshot"
                        className="w-full h-full object-cover absolute top-0 left-0 z-0" // Set z-0 to make it behind
                      />
                      <div className="absolute bottom-2 right-2 flex gap-1 z-10"> {/* Set z-10 to bring it on top */}
                        <button className="p-1 hover:bg-gray-50 rounded text-white">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-50 rounded text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>


        {/* Right Column */}
        <div className="space-y-6">
          {/* Resident Information */}
          <div>
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="residentName" className="block text-lg font-medium mb-2">
                  Resident Name :
                </label>
                <input
                  id="residentName"
                  type="text"
                  placeholder="Enter resident's name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="residentAddress" className="block text-lg font-medium mb-2">
                  Resident Address :
                </label>
                <input
                  id="residentAddress"
                  type="text"
                  placeholder="Enter resident's address"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="postCode" className="block text-lg font-medium mb-2">
                Post code :
              </label>
              <input
                id="postCode"
                type="text"
                placeholder="Enter post code"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          {/* Repair Details */}
          <div>
            <label htmlFor="repairDetails" className="block text-lg font-medium mb-2">
              Repair details :
            </label>
            <textarea
              id="repairDetails"
              placeholder="Description of repair"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Target Time */}
          <div className="relative">
            <label htmlFor="targetTime" className="block text-lg font-medium mb-2">
              Target time :
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between p-3 bg-orange-100 rounded-md text-left"
                >
                  <span>{targetTime}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <ul>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Emergency 24 Hours")
                          setShowDropdown(false)
                        }}
                      >
                        Emergency 24 Hours
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Urgent (7 Days)")
                          setShowDropdown(false)
                        }}
                      >
                        Urgent (7 Days)
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Routine (28 Days)")
                          setShowDropdown(false)
                        }}
                      >
                        Routine (28 Days)
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Generate Link Button */}
          <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors mt-8">
            Generate page link to send to contractor
          </button>
          <p className="text-center text-gray-600 mt-2">(Copy and paste link to your job ticket or any system)</p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="grid grid-cols-3 gap-4 mt-10">
        <button onClick={takeRecording} disabled={!isConnected} className="disabled:opacity-50 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-md transition-colors">
          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </span>
          {
            recordingActive ? "Stop Recording" : "Take Recording"
          }
        </button>

        <button onClick={takeScreenshot} disabled={!isConnected} className="disabled:opacity-50 flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors">
          <Maximize2 className="w-5 h-5" />
          Take Screenshot Image
        </button>

        <button onClick={handleDisconnect} disabled={!isConnected} className="bg-red-500 disabled:opacity-50 hover:bg-red-600 text-white font-medium py-4 rounded-md transition-colors">
          End Video Call
        </button>
      </div>
    </div >
  )
}
