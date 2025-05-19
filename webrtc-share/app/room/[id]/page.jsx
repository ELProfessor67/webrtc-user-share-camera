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
      <div className='w-[100vw] h-[100vh] relative'>
        <video ref={videoRef} autoPlay className="w-full h-full object-cover absolute top-0 left-0" />

        {
          !open && (
            <Button onClick={handleDisconnect} className='absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] text-white bg-red-400 rounded-md hover:bg-red-600 cursor-pointer text-xl'>
              End Video Call
            </Button>
          )
        }
      </div>

      <DialogComponent open={open} setOpen={setOpen}>
        <div className="h-[33rem] p-4 flex flex-col items-center justify-center">
          <Image src="/paper-plane.png" alt="video-link-dialog-bg" className='object-contain' width={200} height={200} />
          <h2 className="text-3xl font-bold mt-10 text-center">
            Videonary
          </h2>

          <Button className='bg-green-600 text-white font-medium py-0 cursor-pointer h-12 rounded-3xl mt-10 text-2xl block w-full' onClick={handleStrt}>
            Join video session
          </Button>
        </div>
      </DialogComponent>
    </>
  )
}

export default page