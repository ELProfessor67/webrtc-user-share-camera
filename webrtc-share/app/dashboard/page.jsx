"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Archive, Trash2, Monitor, Smartphone, Save, History, ArchiveRestore, ExternalLink, FileSearch, MailIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutRequest } from "@/http/authHttp"
import { getAllMeetings, deleteMeeting } from "@/http/meetingHttp"
import { useUser } from "@/provider/UserProvider"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import axios from "axios"
import Link from "next/link"
import { DialogComponent } from "@/components/dialogs/DialogCompnent"
import { LockIcon, XIcon } from "lucide-react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Disclosure } from "@headlessui/react";


import {
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ClockIcon,
} from "@heroicons/react/20/solid";
import { useDialog } from "@/provider/DilogsProvider"

const residents = [
  {
    name: "Margaret Smith",
    address: "1 High Street, London, HT2 9TT",
    link: "https://www.videodesk.co.uk/video/1",
    time: "09.28 AM",
    date: "24/5/2025",
  },
  {
    name: "David Brown",
    address: "2 High Street, London, HT2 9TT",
    link: "https://www.videodesk.co.uk/video/2",
    time: "1.45 PM",
    date: "23/5/2025",
  },
  {
    name: "Mohammed Hussain",
    address: "3 High Street, London, HT2 9TT",
    link: "https://www.videodesk.co.uk/video/3",
    time: "11.40 AM",
    date: "22/5/2025",
  },
];

export default function Page() {
  const { user, isAuth, setIsAuth, setUser } = useUser();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);




  


  const {setResetOpen,setMessageOpen,setLandlordDialogOpen,setTickerOpen,setInviteOpen, setFeedbackOpen, setFaqOpen} = useDialog();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await getAllMeetings();
      setMeetings(response.data.meetings || []);
    } catch (error) {
      toast(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    try {
      await deleteMeeting(id);
      toast("Meeting deleted successfully");
      fetchMeetings(); // Refresh the list
    } catch (error) {
      toast(error?.response?.data?.message || error.message);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isAuth == false) {
      toast("Please Login First");
      return
    }

    setIsLoading(true);
    const res = await axios.get(`https://webrtc-user-share-camera.onrender.com/send-token?number=${phone}&email=${email}`);
    setToken(res.data.token);
    setOpen(true);
    setIsLoading(false);
  };
  const handleSend = () => {
    // Add your logic here (e.g., API call)
    if (!phone && !email) {
      alert('Please enter a mobile number or email address.');
      return;
    }
    console.log('Sending video link to:', phone || email);
  };

  return (
    <>
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between  p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <span className="text-gray-600">Your logo here</span>
            </div>
            <div className="flex items-center gap-2 flex-col">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <img src="/device-icons.png" alt="Videodesk" className="mt-2 w-20" />
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className={"bg-amber-500 text-white rounded-3xl flex items-center gap-2 text-xl"}>Actions <img src="/icons/arrow-down.svg"/></Button>
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
          </div>

          {/* User Profile and Launch Button */}
          <div className="flex items-center">
            <div className="flex items-start gap-2 bg-white p-4 flex-col">
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

              <div className="space-y-3 w-full">
                <div className="flex items-center gap-6 justify-start">
                  <p className="text-left mr-10">Logged In</p>
                  <span>:</span>
                  <p className="text-left">24 April 2025, 10.00am</p>
                </div>
                <div className="flex items-center gap-6 justify-start">
                  <p className="text-left mr-10">Last Log in</p>
                  <span>:</span>
                  <p className="text-left">23 April 2025, 9.00am</p>
                </div>
              </div>

            </div>
          </div>

          <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer" onClick={() => setShowForm(true)}>
            Launch new video link
          </Button>


          <div className="bg-white p-5 rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 font-semibold text-black">Resident name and address</th>
                  <th className="px-4 py-2 font-semibold text-black">Video Link</th>
                  <th className="px-4 py-2 font-semibold text-black">Time and Date</th>
                  <th className="px-4 py-2 font-semibold text-black text-right">Discard/Archive/Export/History</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((res, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b">
                    <td className="px-4 py-3">{index + 1}. {res.name}, {res.address}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={res.link}
                        className="text-blue-600 underline"
                        target="_blank"
                      >
                        www.Videodesk.co.uk/...
                      </Link>
                    </td>
                    <td className="px-4 py-3">{res.time} {res.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button title="Delete">
                          <img src="/icons/trash-red.svg" className="w-4 h-4" />
                        </button>
                        <button title="Download">
                          <img src="/icons/download.svg" className="w-4 h-4" />

                        </button>
                        <button title="Expand View">
                          <img src="/icons/icon-park_share.svg" className="w-5 h-5" />

                        </button>
                        <button title="History">
                          <img src="/icons/icon-park-outline_history-query.svg" className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {
        showForm &&
        <div className="h-screen w-screen bg-black/10 absolute top-0 left-0 right-0 bottom-0 px-16 flex items-center justify-center">
          <div className="mx-auto  bg-white rounded-xl shadow-md p-8 relative overflow-hidden relative">
            <h3 className="text-xl font-semibold mb-6 text-center">Enter your customer's mobile number or email address below to send an instant video link</h3>


            <button
              onClick={() => setShowForm(false)}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-800 absolute top-3 right-3 cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter customer mobile number"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 ${contactMethod === 'phone' ? 'bg-white' : 'bg-gray-100'
                    }`}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setContactMethod('phone');
                  }}
                  onClick={() => setContactMethod('phone')}
                />
              </div>

              <div className="self-center">
                <span className="text-gray-500">or</span>
              </div>

              <div className="flex-1 w-full">
                <input
                  type="email"
                  placeholder="Enter customer email address"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 ${contactMethod === 'email' ? 'bg-white' : 'bg-gray-100'
                    }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setContactMethod('email');
                  }}
                  onClick={() => setContactMethod('email')}
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <>Send<br />video link</>}

              </button>
            </form>
          </div>
        </div>
      }

      <DialogComponent open={open} setOpen={setOpen}>
        <div className="h-[33rem] p-16 flex flex-col items-center justify-center">
          <Image src="/paper-plane.png" alt="video-link-dialog-bg" className='object-contain' width={200} height={200} />
          <div className='mt-5'>
            <div className='flex items-start gap-2'>
              <img className='w-8 h-8' src='/icons/single-check.svg' />
              <div className='flex flex-col gap-0 mb-1'>
                <h2 className="text-2xl font-bold text-left">
                  Link sent successfully
                </h2>
                <p>Please wait a second for the user to accept...</p>
              </div>
            </div>
            <div className='flex items-start gap-2 mt-5'>
              <img className='w-8 h-8' src='/icons/double-check.svg' />
              <div className='flex flex-col gap-0 mb-1'>
                <h2 className="text-2xl font-bold text-left">
                  Link accepted by user
                </h2>
              </div>
            </div>
          </div>

          <Link href={`/room/admin/${token}`} className='bg-green-600 text-white font-medium py-2 cursor-pointer h-12 rounded-3xl mt-10 text-2xl block w-full text-center'>
            Join video session
          </Link>

          <div className='flex items-start mt-4 justify-center'>
            <p className='text-center'><strong className='text-red-400 whitespace-pre'>TIP - </strong> Ask the user to check their spam folder for the email link, if they can't see it!</p>
          </div>
        </div>
      </DialogComponent>

      

    </>
  )
}