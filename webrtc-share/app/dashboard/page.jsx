"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Archive, Trash2, Monitor, Smartphone, Save, History, ArchiveRestore, ExternalLink, FileSearch, MailIcon } from "lucide-react"
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
                  <DropdownMenuItem>Reset Password</DropdownMenuItem>
                  <DropdownMenuItem>Amend Message</DropdownMenuItem>
                  <DropdownMenuItem>Add Landlord Name/Logo/Profile Image</DropdownMenuItem>
                  <DropdownMenuItem>Give Feedback</DropdownMenuItem>
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


          <div className="bg-white p-4 mb-8">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2 font-bold text-gray-800">Resident name and address</th>
                  <th className="px-4 py-2 font-bold text-gray-800">Video Link</th>
                  <th className="px-4 py-2 font-bold text-gray-800">Time and Date</th>
                  <th className="px-4 py-2 font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center">Loading...</td>
                  </tr>
                ) : meetings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center">No meetings found</td>
                  </tr>
                ) : (
                  meetings.map((meeting, index) => (
                    <tr className="border-none" key={meeting._id}>
                      <td className="px-4 py-2">{index + 1}. {meeting.name}, {meeting.address}</td>
                      <td className="px-4 py-2">
                        <Link href={`/room/admin/${meeting.meeting_id}`} className="text-blue-600 underline cursor-pointer">
                          www.videodesk.co.uk/room/{meeting.meeting_id}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{new Date(meeting.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button 
                          onClick={() => handleDeleteMeeting(meeting._id)}
                          className="text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-black cursor-pointer">
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <Link href={`/room/admin/${meeting.meeting_id}`} className="text-black cursor-pointer">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button className="text-black cursor-pointer">
                          <FileSearch className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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


      <DialogComponent open={ticketOpen} setOpen={setTickerOpen} isCloseable={true}>
        <div className="flex items-center gap-3">
          <MailIcon />
          <h2 className="text-lg text-black font-bold">Raise Support Ticket</h2>
        </div>

        <div className="flex items-start flex-col gap-2">
          <textarea
            placeholder="Enter Support query"
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none h-[10rem]`}
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
        >
          Send
        </button>
      </DialogComponent>
    </>
  )
}
