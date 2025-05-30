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

const faqs = [
  "What is Videodesk?",
  "How do I use Videodesk?",
  "How do I send a video link?",
  "Can I take videos in the call?",
  "Can I take screenshots in the call?",
  "How do I generate page links to saved videos and images?",
  "What does the actions button do?",
  "How do I provide feedback to Videodesk?",
  "Can Videodesk develop other solutions and apps?",
];
import {
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ClockIcon,
} from "@heroicons/react/20/solid";

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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [ticketOpen, setTickerOpen] = useState(false);
  const [supportQuery, setSupportQuery] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
    const [resetOpen, setResetOpen] = useState(false);
const [resetEmail, setResetEmail] = useState('');
const [resetLoading, setResetLoading] = useState(false);
const [messageOpen, setMessageOpen] = useState(true);

  const [landlordName, setLandlordName] = useState("");
const [useLogoAsProfile, setUseLogoAsProfile] = useState(false);
const [redirectUrlDefault, setRedirectUrlDefault] = useState("");
const [redirectUrlTailored, setRedirectUrlTailored] = useState("");
const [profileShape, setProfileShape] = useState("square"); 

const [landlordDialogOpen, setLandlordDialogOpen] = useState(false);
const [inviteOpen, setInviteOpen] = useState(false);
const [feedbackOpen, setFeedbackOpen] = useState(false);
const [faqOpen, setFaqOpen] = useState(false);

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
                  <Button className={"bg-amber-500 text-white rounded-3xl"}>Action</Button>
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
                   <DropdownMenuItem > <button className='bg-none border-none cursor-pointer'onClick={() => setInviteOpen(true)}>Invite Coworkers</button></DropdownMenuItem>
                  <DropdownMenuItem><button className='bg-none border-none cursor-pointer' onClick={() => setMessageOpen(true)}>Amend Message</button></DropdownMenuItem>
                  <DropdownMenuItem> <button className='bg-none border-none cursor-pointer' onClick={() => setLandlordDialogOpen(true)}>Add Landlord Name / Logo / Profile Image </button></DropdownMenuItem>
               
                    <DropdownMenuItem > <button className='bg-none border-none cursor-pointer'onClick={() => setFaqOpen(true)}>FAQ's</button></DropdownMenuItem>
                    <DropdownMenuItem > <button className='bg-none border-none cursor-pointer'onClick={() => setFeedbackOpen(true)}>feed back</button></DropdownMenuItem>
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
                    <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
                  </button>
                  <button title="Download">
                    <ArrowDownTrayIcon className="w-5 h-5 text-black hover:text-gray-700" />
                  </button>
                  <button title="Expand View">
                    <ArrowsPointingOutIcon className="w-5 h-5 text-black hover:text-gray-700" />
                  </button>
                  <button title="History">
                    <ClockIcon className="w-5 h-5 text-black hover:text-gray-700" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>



          <div className="relative w-full rounded-lg">
            <img
              src="/dashboard.png"
              alt="Business meeting with three people discussing documents"
              className="w-full h-[20rem] rounded-md object-cover"
            />
          </div>


          {
            showForm &&
            <div className=" mx-auto bg-white rounded-xl shadow-md p-8 relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-6">Customer details:</h3>

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
          }
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
  <label className="block mb-3 text-[16px] font-medium text-gray-800">
    Customer details :
  </label>
  <div className="flex items-center justify-center gap-3">
    <input
      type="text"
      placeholder="Enter customer mobile number"
      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />
    <span className="text-gray-500 font-medium">or</span>
    <input
      type="email"
      placeholder="Enter customer email address"
      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <button
      onClick={handleSend}
      className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-green-600 leading-tight text-center"
    >
      Send <br /> video link
    </button>
  </div>
</div>


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
            <p className='text-center'><strong className='text-red-400 whitespace-pre'>TIP - </strong> Ask the user to check their spam folder for the email link, if they can't see it!</p>
          </div>
        </div>
      </DialogComponent>

<DialogComponent open={resetOpen} setOpen={setResetOpen} isCloseable={true}>
  <div className="w-[340px] rounded-2xl bg-white shadow-md p-5">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <LockIcon className="w-5 h-5 text-gray-700" />
        <h2 className="text-base font-semibold">Reset Password</h2>
      </div>
      <button
        onClick={() => setResetOpen(false)}
        aria-label="Close"
        className="text-gray-500 hover:text-gray-800"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>

    {/* Fields */}
    <div className="space-y-3">
      <input
        type="password"
        placeholder="Enter current password"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <input
        type="password"
        placeholder="Enter new password"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <p className="text-xs text-red-500 -mt-1">
        Minimum 8 characters including 1 capital, 1 lower case and 1 special character
      </p>
      <input
        type="password"
        placeholder="Retype new password"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Type secret account recovery word"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      />
    </div>

    {/* Save Button */}
    <button className="mt-4 w-full bg-green-500 text-white py-2 rounded-full text-sm font-medium">
      Save new password
    </button>

    {/* Forgot Link */}
    <div className="text-center mt-3">
      <button className="text-sm text-blue-600 hover:underline">
        Forgot Password?
      </button>
    </div>
  </div>
</DialogComponent>
<DialogComponent open={messageOpen} setOpen={setMessageOpen} isCloseable={true}>
  <div className="w-[500px] bg-white rounded-2xl p-6 shadow-md">
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-black">Amend Message:</h2>
      <button
        onClick={() => setMessageOpen(false)}
        className="text-black hover:text-gray-600 transition"
        aria-label="Close dialog"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>

    {/* Default Message */}
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="font-medium text-sm text-black">Default message:</label>
        <select className="bg-black text-white text-xs px-2 py-1 rounded-md">
          <option>Text size: 12</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" defaultChecked className="mt-1" />
        <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
          <p>Please click on the link below to connect with your landlord</p>
          <a
            href="https://www.videodesk.co.uk/xyz91dasd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            www.Videodesk.co.uk/xyz91dasd
          </a>
        </div>
      </div>
    </div>

    {/* Tailored Message */}
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <label className="font-medium text-sm text-black">Or type tailored message:</label>
        <select className="bg-black text-white text-xs px-2 py-1 rounded-md">
          <option>Text size: 12</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div className="flex gap-2">
        <input type="checkbox" className="mt-1" />
        <textarea
          placeholder="Type here"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* Save Button */}
    <button
      onClick={() => {}}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-full text-sm transition"
    >
      Save
    </button>
  </div>
</DialogComponent>
<DialogComponent open={landlordDialogOpen} setOpen={setLandlordDialogOpen} isCloseable>
  <div className="w-[320px] mx-auto bg-white rounded-2xl p-4 space-y-3 shadow-lg">
    <h2 className="text-base font-semibold text-center">Add Landlord Info</h2>

    {/* Landlord Name */}
    <div>
      <label className="text-xs font-medium block mb-1">Landlord Name:</label>
      <input
        type="text"
        placeholder="Type here"
        className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>

    {/* Upload Landlord Logo */}
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" />
        Upload Landlord logo
      </label>
      <div className="border border-dashed border-gray-400 p-3 rounded-lg text-center bg-gray-50">
        <span className="text-xl text-gray-500">⬆️</span>
      </div>
      <button className="text-red-500 text-xs flex items-center gap-1">🗑 Remove</button>
    </div>

    {/* Use logo for profile photo */}
    <label className="flex items-center gap-1 text-xs">
      <input type="checkbox" />
      Use logo as profile photo
    </label>

    {/* Upload Officer Image */}
    <div>
      <label className="flex items-center gap-1 text-xs mb-1">
        <input type="checkbox" />
        Officer image for profile:
      </label>
      <img
        src="/your-image.jpg"
        alt="Profile Preview"
        className="w-14 h-14 object-cover rounded-lg border mx-auto"
      />
    </div>

    {/* Profile Shape */}
    <div>
      <label className="text-xs font-medium block mb-1">Profile Shape:</label>
      <div className="flex justify-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input type="radio" name="shape" value="square" />
          Square
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="shape" value="circle" />
          Circle
        </label>
      </div>
    </div>

    {/* Redirect URLs */}
    <div>
      <label className="text-xs font-medium block mb-1">
        On call end, redirect to:
      </label>
      <input
        type="text"
        placeholder="e.g. www.videodesk.co.uk"
        className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md mb-1"
      />
      <input
        type="text"
        placeholder="Tailored e.g. www..."
        className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md"
      />
    </div>

    {/* Save Button */}
    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 rounded-full text-xs transition">
      Save
    </button>
  </div>
</DialogComponent>
<DialogComponent open={ticketOpen} setOpen={setTickerOpen} isCloseable={true}>
  <div className="w-[400px] rounded-2xl bg-white shadow-md p-5 space-y-5 relative">
    {/* Close Button */}
    <button
      onClick={() => setTickerOpen(false)}
      aria-label="Close"
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
    >
      <XIcon className="w-4 h-4" />
    </button>

    {/* Header */}
    <div className="flex items-center gap-2">
      <MailIcon className="w-5 h-5 text-gray-700" />
      <h2 className="text-lg font-bold text-black">Raise Support Ticket</h2>
    </div>

    {/* Textarea */}
    <div>
      <textarea
        placeholder="Enter support query"
        className="w-full h-40 px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-full text-sm transition"
    >
      Send
    </button>
  </div>
</DialogComponent>
<DialogComponent open={inviteOpen} setOpen={setInviteOpen} isCloseable={true}>
  <div className="w-[360px] bg-white rounded-2xl shadow-md p-5 relative space-y-4">
    {/* Close Button */}
    <button
      onClick={() => setInviteOpen(false)}
      aria-label="Close"
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
    >
      <XIcon className="w-4 h-4" />
    </button>

    {/* Header */}
    <div className="flex items-center gap-2">
      
      <h2 className="text-base font-semibold text-black">Invite Co-Worker(s)</h2>
    </div>

    {/* Input Fields */}
    <div className="space-y-3">
      <input
        type="email"
        placeholder="1. Enter email address for Co-worker"
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <input
        type="email"
        placeholder="2. Enter email address for Co-worker"
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <input
        type="email"
        placeholder="3. Enter email address for Co-worker"
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
      />
      <textarea
        rows={3}
        defaultValue={`Hey, I'm using Videodesk , check it out here www.videodesk.co.uk`}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none"
      />
    </div>

    {/* Invite Button */}
    <button
      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full text-sm transition"
    >
      Invite
    </button>
  </div>
</DialogComponent>
<DialogComponent open={feedbackOpen} setOpen={setFeedbackOpen} isCloseable={true}>
  <div className="w-[340px] rounded-2xl bg-white shadow-md p-5">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">

        <h2 className="text-base font-semibold">Give Feedback/Make Suggestions</h2>
      </div>
      <button
        onClick={() => setFeedbackOpen(false)}
        aria-label="Close"
        className="text-gray-500 hover:text-gray-800"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>

    {/* Feedback Field */}
    <textarea
      placeholder="Enter feedback/make suggestion..."
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Send Button */}
    <button
      className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-full text-sm font-medium"
    >
      Send
    </button>
  </div>
</DialogComponent>

<DialogComponent open={faqOpen} setOpen={setFaqOpen} isCloseable={true}>
  <div className="w-[360px] rounded-2xl bg-white shadow-md p-5 max-h-[90vh] overflow-y-auto">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img src="/faq-icon.svg" alt="FAQ" className="w-5 h-5" /> {/* Replace with your icon or HeroIcon */}
        <h2 className="text-base font-semibold">FAQs</h2>
      </div>
      <button onClick={() => setFaqOpen(false)} aria-label="Close">
        <XIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" />
      </button>
    </div>

    {/* FAQ Accordion List */}
    <div className="space-y-2">
      {faqs.map((question, index) => (
        <Disclosure key={index}>
          {({ open }) => (
            <div className="rounded-md bg-yellow-500">
              <Disclosure.Button className="flex justify-between items-center w-full px-4 py-2 text-left text-black font-medium focus:outline-none">
                <span>{question}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-2 text-sm text-black bg-yellow-100">
                This is the answer for: <strong>{question}</strong>. You can customize this.
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  </div>
   </DialogComponent>

    </>
  )
}