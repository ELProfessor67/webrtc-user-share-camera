"use client"
import { DialogComponent } from '@/components/dialogs/DialogCompnent';
import React, { createContext, useState, useContext } from 'react';
import { FileText, Archive, Trash2, Monitor, Smartphone, Save, History, ArchiveRestore, ExternalLink, FileSearch, MailIcon, Loader2, LockIcon, XIcon } from "lucide-react"
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

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
  

export const DialogProvider = ({ children }) => {
    const [resetOpen, setResetOpen] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);
    const [landlordDialogOpen, setLandlordDialogOpen] = useState(false);
    const [ticketOpen, setTickerOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(false);
    const [checked, setIsCheked] = useState(false)
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false); 
    const [landlordName, setLandlordName] = useState("");
    const [useLogoAsProfile, setUseLogoAsProfile] = useState(false);
    const [redirectUrlDefault, setRedirectUrlDefault] = useState("");
    const [redirectUrlTailored, setRedirectUrlTailored] = useState("");
    const [profileShape, setProfileShape] = useState("square");
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportQuery, setSupportQuery] = useState('');


    const value = {setResetOpen,setMessageOpen,setLandlordDialogOpen,setTickerOpen,setInviteOpen, setFeedbackOpen, setFaqOpen} 
  return (
    <DialogContext.Provider value={value}>
      {children}


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
            </div>
            <div className="flex gap-2">
              <input type="checkbox" className="mt-1" onChange={() => setIsCheked(prev => !prev)} />
              <textarea
                placeholder="Enter your message"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none ${checked ? 'h-[6rem]' : 'h-[4rem]'}`}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => { }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-full text-sm transition"
          >
            Save
          </button>
        </div>
      </DialogComponent>

      <DialogComponent open={landlordDialogOpen} setOpen={setLandlordDialogOpen} isCloseable>
        <div className="w-[550px] rounded-2xl bg-white shadow-md p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base  font-semibold">Add Landlord Name/Logo/Profile Image:</h2>
            </div>
            <button
              onClick={() => setLandlordDialogOpen(false)}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-800"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold">Landlord Name:</label>
              <div className="flex items-center gap-2 w-full">
                <input type="checkbox" />
                <input
                  type="text"
                  placeholder="Type here"
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Upload Landlord logo to use on dashboard:</label>
              <div className="flex relative items-center justify-center gap-2 w-[97%] p-4 h-[8rem] border border-gray-300 rounded-md ml-4">
                <button className="absolute bottom-4 right-4 cursor-pointer"><img src="/icons/trash-red.svg" className="w-6 h-6" /></button>
                <img src="/icons/material-symbols_upload-rounded.svg" />
              </div>
              <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Use logo for profile photo:</label>
            </div>
            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Upload Officer image to use as profile photo:</label>
              <div className="flex relative items-center justify-center gap-2 w-[97%] p-4 h-[8rem] border border-gray-300 rounded-md ml-4">
                <div className="absolute bottom-1 left-4 right-4 flex justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-black font-semibold flex items-center gap-2">Select Profile Shape:</label>
                    <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" />Square</label>
                    <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Circle</label>
                  </div>
                  <button className="cursor-pointer"><img src="/icons/trash-red.svg" className="w-6 h-6" /></button>
                </div>
                <img src="/icons/material-symbols_upload-rounded.svg" />
              </div>
              <label className="text-black font-semibold flex items-center gap-2 ml-4">When video call ends, user is directed to the following website:</label>
            </div>


            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Default:</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="www.videodesk.co.uk"
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none ml-4`}
                />
              </div>
            </div>

            <div className="flex items-start flex-col gap-2">
              <label className="text-black font-semibold flex items-center gap-2"><input type="checkbox" /> Tailored:</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="www."
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none ml-4`}
                />
              </div>
            </div>
          </div>



          {/* Send Button */}
          <button
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-full text-sm font-medium"
          >
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
          <div className="flex items-center gap-2 justify-center">
            <img src="/icons/ri_user-add-line.svg" />
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
              <img src="/icons/ic_sharp-outlined-flag.svg" />
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
        <div className="rounded-2xl  shadow-md p-5 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span></span>
            <div className="flex items-center gap-2 justify-center">
              <img src="/icons/faq.svg" alt="FAQ" className="w-5 h-5" /> {/* Replace with your icon or HeroIcon */}
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
    </DialogContext.Provider>
  );
};

export default DialogProvider;
