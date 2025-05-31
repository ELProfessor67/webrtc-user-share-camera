"use client"
import { useState, useRef, use } from "react"
import Image from "next/image"
import { Camera, Trash2, ImageIcon, Plus, Maximize2, VideoIcon, PlayIcon, Save, Edit, Minimize2, Expand, ZoomIn, ZoomOut } from "lucide-react"
import useWebRTC from "@/hooks/useWebRTC"
import { createRequest } from "@/http/meetingHttp"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDialog } from "@/provider/DilogsProvider"
import { Button } from "@/components/ui/button"
import { logoutRequest } from "@/http/authHttp"
import { useUser } from "@/provider/UserProvider"

export default function Page({ params }) {
  const { id } = use(params);
  const [targetTime, setTargetTime] = useState("Emergency 24 Hours")
  const [showDropdown, setShowDropdown] = useState(false)
  const [residentName, setResidentName] = useState("")
  const [residentAddress, setResidentAddress] = useState("")
  const [postCode, setPostCode] = useState("")
  const [repairDetails, setRepairDetails] = useState("")
  const videoRef = useRef(null);
  const { handleDisconnect, isConnected, screenshots, recordings, recordingActive, takeScreenshot, takeRecording, startPeerConnection, handleVideoPlay, showVideoPlayError } = useWebRTC(true, id, videoRef);
  const {setResetOpen,setMessageOpen,setLandlordDialogOpen,setTickerOpen,setInviteOpen, setFeedbackOpen, setFaqOpen} = useDialog();
  const { user, isAuth, setIsAuth, setUser } = useUser();
  const handleSave = async () => {
    try {
      const formData = {
        meeting_id: id,
        name: residentName,
        address: residentAddress,
        post_code: postCode,
        repair_detail: repairDetails,
        target_time: targetTime
      };

      const response = await createRequest(formData);
      toast(response.data.message)

    } catch (error) {
      toast(error?.response?.data?.message || error.message)
    }
  }



  const handleLogout = async () => {
    try {
      const res = await logoutRequest();
      toast("Logout Successfull", {
        description: res.data.message
      });
      setIsAuth(false);
      setUser(null);
    } catch (error) {
      toast("Logout Unsuccessfull", {
        description: error?.response?.data?.message || error.message
      });
    }
  }

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
                  <span>Videodesk.co.uk</span>
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
            <div className="relative  w-[270px]">
              <div className="h-[480px]  w-[270px] bg-gray-200 rounded-md overflow-hidden relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain absolute top-0 left-0" />
                {showVideoPlayError && (
                  <button onClick={handleVideoPlay} className=" bg-yellow-500 p-3 rounded-full text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><PlayIcon className="w-6 h-6" /></button>
                )}
              </div>
              <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 text-sm font-medium">{isConnected ? "Live" : "Disconnected"}</div>
              <div className="absolute bottom-2 left-[50%] -translate-x-[50%] text-white px-3 py-1 text-sm font-medium flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-red-600 block"></span>
                <span className="text-white text-lg">1:20</span>
              </div>

              <div className="absolute bottom-2 right-0 text-white px-3 py-1 text-sm font-medium flex items-center gap-3 flex-col">
                <button className="p-1 rounded text-white cursor-pointer">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-1 rounded text-white cursor-pointer">
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-5 mt-5">

              <button onClick={takeRecording} disabled={!isConnected} className="disabled:opacity-50 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-md transition-colors w-[270px]">
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </span>
                {
                  recordingActive ? "Stop Recording" : "Take Recording"
                }
              </button>

              <button onClick={takeScreenshot} disabled={!isConnected} className="disabled:opacity-50 flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors w-[270px]">
                <Maximize2 className="w-5 h-5" />
                Take Screenshot Image
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-10">
            {/* Video Recording Section */}
            <div className="">
              <label htmlFor="residentName" className="block text-lg font-medium mb-5">
                Resident Name :
              </label>
              <input
                id="residentName"
                type="text"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="Enter resident's name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
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
                    <div>
                      <img src="/icons/ci_label.svg" />
                      <div className="aspect-square bg-gray-200 rounded-md flex flex-col items-center justify-center relative">
                        <div className="absolute top-2 right-2 flex gap-1 z-10"> {/* Set z-10 to bring it on top */}
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Minimize2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-50 rounded text-white">
                            <Expand className="w-4 h-4" />
                          </button>
                        </div>
                        <video src={recording} controls className="w-full h-full object-cover absolute top-0 left-0" />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Save className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                    <div>
                      <img src="/icons/ci_label.svg" />
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center relative">
                        <div className="absolute top-2 right-2 flex gap-1 z-10"> {/* Set z-10 to bring it on top */}

                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Minimize2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-50 rounded text-white">
                            <Expand className="w-4 h-4" />
                          </button>
                        </div>
                        <img
                          src={screenshot}
                          alt="screenshot"
                          className="w-full h-full object-cover absolute top-0 left-0 z-0" // Set z-0 to make it behind
                        />
                        <div className="absolute bottom-2 right-2 flex gap-1 z-10"> {/* Set z-10 to bring it on top */}
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-300 rounded text-white">
                            <Save className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-50 rounded text-white">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                <div className="flex items-center justify-between mb-3">

                  <label htmlFor="residentAddress" className="block text-lg font-medium mb-2">
                    Resident Address :
                  </label>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className={"bg-amber-500 text-white rounded-3xl flex items-center gap-2 text-xl"}>Actions <img src="/icons/arrow-down.svg" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={'bg-white border-none shadow-sm'}>
                      <DropdownMenuItem>
                        <button className='bg-none border-none cursor-pointer' onClick={handleLogout}>Logout</button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Dashboard</DropdownMenuItem>
                      <DropdownMenuItem>

                        <button className='bg-none border-none cursor-pointer' onClick={() => setTickerOpen(true)}>Raise Support Ticket</button>
                      </DropdownMenuItem>
                      <DropdownMenuItem><button className='bg-none border-none cursor-pointer' onClick={() => setResetOpen(true)}>Reset Password</button></DropdownMenuItem>
                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setInviteOpen(true)}>Invite Coworkers</button></DropdownMenuItem>
                      <DropdownMenuItem><button className='bg-none border-none cursor-pointer' onClick={() => setMessageOpen(true)}>Amend Message</button></DropdownMenuItem>
                      <DropdownMenuItem> <button className='bg-none border-none cursor-pointer text-left' onClick={() => setLandlordDialogOpen(true)}>Add Landlord Name/Logo/ <br />Profile Image </button></DropdownMenuItem>

                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setFaqOpen(true)}>FAQ's</button></DropdownMenuItem>
                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setFeedbackOpen(true)}>Give Feedback</button></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
                <input
                  id="residentAddress"
                  type="text"
                  value={residentAddress}
                  onChange={(e) => setResidentAddress(e.target.value)}
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
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
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
              value={repairDetails}
              onChange={(e) => setRepairDetails(e.target.value)}
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
          <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors mt-8 mb-2 flex flex-col gap-1 items-center justify-center">
            <span>Create Share Link</span>
            <span className="text-xs font-normal">to send to Contractor/Supplier or Co-workers</span>
          </button>
          <p className="text-center text-gray-600 mt-0 text-sm">(Copy and paste link to your job ticket or any system)</p>

          <div className="w-full flex items-center gap-4">
            <button onClick={handleDisconnect} disabled={!isConnected} className="bg-red-500 disabled:opacity-50 hover:bg-red-600 text-white font-medium py-4 rounded-md transition-colors flex-1 whitespace-pre">
              End Video Call <br /> (Without Saving)
            </button>
            <button onClick={handleSave} disabled={!isConnected} className="bg-green-500 disabled:opacity-50 hover:bg-green-600 text-white font-medium py-4 rounded-md transition-colors flex-1 whitespace-pre">
              End Video and <br />
              Save Images
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs mt-5">User : Sharon Smith 24 May 2025, 10.00 am</p>
    </div>
  )
}
