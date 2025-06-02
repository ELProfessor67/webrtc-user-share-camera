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
    // Add new state for message option
    const [messageOption, setMessageOption] = useState(''); // '' for no default selection
    const [defaultTextSize, setDefaultTextSize] = useState('14px'); // font size for default message
    const [tailoredTextSize, setTailoredTextSize] = useState('14px'); // font size for tailored message
    const [landlordName, setLandlordName] = useState("");
    const [useLogoAsProfile, setUseLogoAsProfile] = useState(false);
    const [redirectUrlDefault, setRedirectUrlDefault] = useState("");
    const [redirectUrlTailored, setRedirectUrlTailored] = useState("");
    const [profileShape, setProfileShape] = useState(""); // Changed from "square" to ""
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportQuery, setSupportQuery] = useState('');
    const [inviteEmails, setInviteEmails] = useState(['']);
    
    // New state for checkbox groups
    const [profileImageOption, setProfileImageOption] = useState(''); // 'landlord' or 'officer'
    const [redirectOption, setRedirectOption] = useState(''); // 'default' or 'tailored'

    const addEmailField = () => {
        setInviteEmails([...inviteEmails, '']);
    };

    const updateEmail = (index, value) => {
        const newEmails = [...inviteEmails];
        newEmails[index] = value;
        setInviteEmails(newEmails);
    };

    const value = {setResetOpen,setMessageOpen,setLandlordDialogOpen,setTickerOpen,setInviteOpen, setFeedbackOpen, setFaqOpen} 
  return (
    <DialogContext.Provider value={value}>
      {children}


      <DialogComponent open={resetOpen} setOpen={setResetOpen} isCloseable={true}>
        <div className="w-[340px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <div className="flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold">Reset Password</h2>
            </div>
            <button
              onClick={() => setResetOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
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
        </div>
      </DialogComponent>
      <DialogComponent open={messageOpen} setOpen={setMessageOpen} isCloseable={true}>
        <div className="w-[500px] max-h-[90vh] bg-purple-500 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <h2 className="text-lg font-semibold">Amend Message:</h2>
            <button
              onClick={() => setMessageOpen(false)}
              className="absolute right-4 text-white hover:text-gray-200 transition"
              aria-label="Close dialog"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {/* Default Message */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-sm text-black">Default message:</label>
                <select 
                  value={defaultTextSize} 
                  onChange={(e) => setDefaultTextSize(e.target.value)}
                  className="text-white bg-black border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="10px">10px</option>
                  <option value="12px">12px</option>
                  <option value="13px">13px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="22px">22px</option>
                  <option value="24px">24px</option>
                </select>
              </div>
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  checked={messageOption === 'default'}
                  onChange={() => setMessageOption('default')}
                  className="mt-1" 
                />
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" style={{ fontSize: defaultTextSize }}>
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
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-sm text-black">Or type tailored message:</label>
                <select 
                  value={tailoredTextSize} 
                  onChange={(e) => setTailoredTextSize(e.target.value)}
                  className="text-white bg-black border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="10px">10px</option>
                  <option value="12px">12px</option>
                  <option value="13px">13px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="22px">22px</option>
                  <option value="24px">24px</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="checkbox" 
                  checked={messageOption === 'tailored'}
                  onChange={() => setMessageOption('tailored')}
                  className="mt-1" 
                />
                <textarea
                  placeholder="Enter your message"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none ${messageOption === 'tailored' ? 'h-[6rem]' : 'h-[4rem]'}`}
                  style={{ fontSize: tailoredTextSize }}
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
        </div>
      </DialogComponent>

      <DialogComponent open={landlordDialogOpen} setOpen={setLandlordDialogOpen} isCloseable>
        <div className="w-[550px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <h2 className="text-base font-semibold">Add Landlord Name/Logo/Profile Image:</h2>
            <button
              onClick={() => setLandlordDialogOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
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
                <div className="flex relative items-center justify-center gap-2 w-[97%] p-4 h-[4rem] border border-gray-300 rounded-md ml-4">
                  <button className="absolute bottom-4 right-4 cursor-pointer"><img src="/icons/trash-red.svg" className="w-6 h-6" /></button>
                  <img src="/icons/material-symbols_upload-rounded.svg" />
                </div>
                <label className="text-black font-semibold flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={profileImageOption === 'landlord'}
                    onChange={() => setProfileImageOption(profileImageOption === 'landlord' ? '' : 'landlord')}
                  /> 
                  Use landlord logo for profile photo:
                </label>
              </div>
              <div className="flex items-start flex-col gap-2">
                <label className="text-black font-semibold flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={profileImageOption === 'officer'}
                    onChange={() => setProfileImageOption(profileImageOption === 'officer' ? '' : 'officer')}
                  /> 
                  Upload Officer image to use as profile photo:
                </label>
                <div className="flex relative items-center justify-center gap-2 w-[97%] p-4 h-[6.5rem] border border-gray-300 rounded-md ml-4">
                  <div className="absolute bottom-1 left-4 right-4 flex justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-black font-semibold flex items-center gap-2">Select Profile Shape:</label>
                      <label className="text-black font-semibold flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={profileShape === 'square'}
                          onChange={() => setProfileShape(profileShape === 'square' ? '' : 'square')}
                        />
                        Square
                      </label>
                      <label className="text-black font-semibold flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={profileShape === 'circle'}
                          onChange={() => setProfileShape(profileShape === 'circle' ? '' : 'circle')}
                        /> 
                        Circle
                      </label>
                    </div>
                    <button className="cursor-pointer"><img src="/icons/trash-red.svg" className="w-6 h-6" /></button>
                  </div>
                  <img src="/icons/material-symbols_upload-rounded.svg" />
                </div>
                <label className="text-black font-semibold flex items-center gap-2 ml-4">When video call ends, user is directed to the following website:</label>
              </div>


              <div className="flex items-start flex-col gap-2">
                <label className="text-black font-semibold flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={redirectOption === 'default'}
                    onChange={() => setRedirectOption(redirectOption === 'default' ? '' : 'default')}
                  /> 
                  Default:
                </label>
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    placeholder="www.videodesk.co.uk"
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none ml-4`}
                  />
                </div>
              </div>

              <div className="flex items-start flex-col gap-2">
                <label className="text-black font-semibold flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={redirectOption === 'tailored'}
                    onChange={() => setRedirectOption(redirectOption === 'tailored' ? '' : 'tailored')}
                  /> 
                  Tailored:
                </label>
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
        </div>
      </DialogComponent>

      <DialogComponent open={ticketOpen} setOpen={setTickerOpen} isCloseable={true}>
        <div className="w-[400px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <div className="flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold">Raise Support Ticket</h2>
            </div>
            <button
              onClick={() => setTickerOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {/* Textarea */}
            <div>
              <textarea
                placeholder="Enter support query"
                className="w-full h-40 px-4 py-2 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </DialogComponent>

      <DialogComponent open={inviteOpen} setOpen={setInviteOpen} isCloseable={true}>
        <div className="w-[360px] max-h-[90vh] bg-purple-500 rounded-2xl shadow-md relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 relative m-0">
            <div className="flex items-center gap-2">
              <img src="/icons/ri_user-add-line.svg" className="filter brightness-0 invert" />
              <h2 className="text-base font-semibold">Invite Co-Worker(s)</h2>
            </div>
            <button
              onClick={() => setInviteOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {/* Dynamic Email Fields */}
            <div className="space-y-3">
              {inviteEmails.map((email, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder={`${index + 1}. Enter email address for Co-worker`}
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                  {index === inviteEmails.length - 1 && (
                    <div className="flex justify-end items-center mt-3">
                      <button
                        onClick={addEmailField}
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-full cursor-pointer transition-colors shadow-lg relative"
                      >
                        <span className="absolute inset-0 flex items-center justify-center" style={{ top: '-2px' }}>
                          +
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              <textarea
                rows={3}
                defaultValue={`Hey, I'm using Videodesk , check it out here www.videodesk.co.uk`}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-y"
              />
            </div>

            {/* Invite Button */}
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full text-sm transition"
            >
              Invite
            </button>
          </div>
        </div>
      </DialogComponent>

      <DialogComponent open={feedbackOpen} setOpen={setFeedbackOpen} isCloseable={true}>
        <div className="w-[340px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <div className="flex items-center gap-2">
              <img src="/icons/ic_sharp-outlined-flag.svg" className="filter brightness-0 invert" />
              <h2 className="text-sm font-semibold">Give Feedback/Make Suggestions</h2>
            </div>
            <button
              onClick={() => setFeedbackOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {/* Feedback Field */}
            <textarea
              placeholder="Enter feedback/make suggestion..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg h-28 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send Button */}
            <button
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-full text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </DialogComponent>

      <DialogComponent open={faqOpen} setOpen={setFaqOpen} isCloseable={true}>
        <div className="rounded-2xl shadow-md max-h-[90vh] overflow-hidden bg-purple-500">
          {/* Header */}
          <div className="flex items-center justify-between bg-purple-500 text-white p-4 m-0">
            <span></span>
            <div className="flex items-center gap-2 justify-center">
              <img src="/icons/faq.svg" alt="FAQ" className="w-5 h-5 filter brightness-0 invert" />
              <h2 className="text-base font-semibold">FAQs</h2>
            </div>
            <button onClick={() => setFaqOpen(false)} aria-label="Close">
              <XIcon className="w-5 h-5 text-white hover:text-gray-200" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto bg-white rounded-b-2xl max-h-[calc(90vh-4rem)]">
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
        </div>
      </DialogComponent>
    </DialogContext.Provider>
  );
};

export default DialogProvider;
