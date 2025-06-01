'use client'
import React, { useState } from 'react';
import { DialogComponent } from '../dialogs/DialogCompnent';
import Image from 'next/image';
import { Button } from '../ui/button';
import axios from 'axios';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/provider/UserProvider';
import { toast } from 'sonner';
export const LaunchLinkSection = () => {
  const [contactMethod, setContactMethod] = useState('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuth } = useUser();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isAuth == false) {
      toast("Please Login First");
      return
    }

    setIsLoading(true);
    const res = await axios.get(`https://webrtc-user-share-camera.onrender.com/send-token?number=${phone}&email=${email}`);
    setToken(res.data?.token);
    setOpen(true);
    setIsLoading(false);
  };

  return (
    <>
      <section id="launch-link" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <a
              href="#launch"
              className="inline-block text-black font-bold py-3 px-8 rounded-full text-3xl transition-all transform hover:scale-105 mb-4"
            >
              Launch new video link
            </a>

            <div className="flex justify-center items-center space-x-2 mt-2">
              <a href="#login" className="text-blue-500 hover:underline">Log in</a>
              <span>or</span>
              <a href="#signup" className="text-blue-500 hover:underline">Sign up</a>
              <span>to launch a video link</span>
            </div>
          </div>

          <div className=" mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-8 relative overflow-hidden">
            <h3 className="text-xl font-semibold mb-6 text-center">Enter your customer's mobile number or email address below to send an instant video link</h3>

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

        <div className='flex items-center justify-center mt-10'>
          <img src="/devices.svg" alt="Videodesk" className="w-60 mb-2" />

        </div>
      </section>

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
              <p className='text-center'><strong className='text-red-400 whitespace-pre'>Tip - </strong> Ask the user to check their spam folder for the email link, if they can’t see it!</p>
          </div>
        </div>
      </DialogComponent>

    </>
  );
};