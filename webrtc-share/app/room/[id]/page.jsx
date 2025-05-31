"use client"
import { Button } from '@/components/ui/button'
import React, { useState,use, useRef }  from 'react'
import { PhoneCall } from 'lucide-react'
import { DialogComponent } from '@/components/dialogs/DialogCompnent'
import Image from 'next/image'
import useWebRTC from '@/hooks/useWebRTC'
const page = ({params}) => {
  const {id} = use(params);
  const [open, setOpen] = useState(true);
  const videoRef = useRef(null);
  const {localStream, remoteStream, socket, socketConnection, handleDisconnect, startPeerConnection} = useWebRTC(false, id, videoRef);
  
  const handleStrt = () => {
    try {
      setOpen(false);
      startPeerConnection();
    } catch (error) {
      console.error('Error starting peer connection:', error);
    }
  }

  return (
    <>
      <div className='w-[100vw] h-[100vh] relative overflow-hidden'>
        <video ref={videoRef} autoPlay className="w-full h-full object-cover absolute top-0 left-0" />

        {
          !open && (
            <Button onClick={handleDisconnect} className='absolute bottom-40 right-[50%] translate-x-[50%] text-white bg-red-400 rounded-md hover:bg-red-600 cursor-pointer text-xl'>
              End Video Call
            </Button>
          )
        }
      </div>

      <DialogComponent open={open} setOpen={setOpen}>
        <div className="h-[33rem] w-[350px] p-3 flex flex-col items-center justify-center gap-5">
          <Image src="/paper-plane.svg" alt="video-link-dialog-bg" className='object-contain' width={200} height={200} />
          <h2 className="text-xl font-bold mt-10 text-center">
          Landlord name/logo here
          </h2>

          <button className='bg-green-600 text-white font-medium py-0 cursor-pointer  rounded-3xl mt-10 text-lg block w-full outline-none' onClick={handleStrt}>
          Tap to allow video <br/> session now
          </button>

          <img src="/device-icons.png" alt="Videodesk" className="w-30 mt-10" />
        </div>
      </DialogComponent>
    </>
  )
}

export default page