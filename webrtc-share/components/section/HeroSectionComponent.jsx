'use client'
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"

export const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = React.useState();




  useEffect(() => {
    if (!api) {
      return
    }
    setActiveSlide(api.selectedScrollSnap())
    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <>

      <section className="relative bg-gray-800 text-white h-[31rem]">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            <CarouselItem>
              <div className='relative w-full h-full'>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/hero-section-bg.png')",
                    opacity: 0.5,
                    backgroundSize: "cover"
                  }}
                />
                <div className="mx-auto relative z-10 h-[31rem] px-10 flex flex-col justify-center">
                  <div className="max-w-2xl">
                    <div className='mb-10 ml-14 translate-y-[50px]'>
                      <h1 className="text-4xl md:text-5xl font-bold mb-6">Videodesk.co.uk</h1>
                      <p className="text-lg font-normal">
                        Connect Customer service calls with an <br /> instant video link and see what your <br /> customers see
                      </p>
                    </div>
                    <span id="about" className='translate-y-[5rem] block'></span>

                    <div className='flex gap-2 items-center translate-y-[100px]'>

                      <a
                        href="#how-it-works"
                        className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105"
                      >
                        How it works
                      </a>
                      <a
                        href="#signup"
                        className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105"
                      >
                        Sign up in 3 easy steps!
                      </a>
                    </div>
                  </div>



                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className='relative w-full h-full'>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/slide-2-bg.png')",
                    opacity: 0.5,
                    backgroundSize: "cover"
                  }}
                />
                <div className="mx-auto relative z-10 h-[31rem] px-10 flex flex-col justify-center">
                  <div className="max-w-2xl">
                    <div className='mb-10 translate-y-[50px]'>
                      <h1 className="text-6xl font-bold mb-6">Videodesk.co.uk</h1>
                    </div>


                    <div className='p-4 py-4 bg-gradient-to-b from-amber-200 to-amber-500 translate-y-[4rem] -translate-x-10 pl-10 shape w-fit pr-28'>
                      <h1 className='text-white text-3xl font-bold w-fit'>See what your customers see!</h1>
                      <h3 className='p-2 text-white bg-red-600 font-medium text-lg w-fit mt-4'>Driving successfull customer engagement</h3>
                    </div>
                  </div>



                </div>
              </div>
            </CarouselItem>




            <CarouselItem>
              <div className='relative w-full h-full'>
                <div className="mx-auto relative z-10 h-[31rem]  flex flex-row bg-[#f9f9f9]">
                  <div className='flex-[60%] flex flex-col p-10'>
                    <h1 className='text-black text-4xl font-semibold mt-0'>Built for Social Landlords</h1>
                    <h1 className='text-5xl font-bold w-fit p-2 bg-amber-400 text-white mt-10 pr-8'>Embrace the power <br /> of instant video.</h1>
                    <p className='text-black text-2xl font-normal whitespace-pre mt-6'>Reduce service calls and <br /><strong>improve first-time resolution</strong> for <br />repairs reporting.</p>
                    <div className="flex justify-start items-start flex-col mt-8">
                      <img src="/devices.svg" alt="Videodesk" className="w-60 mb-2" />
                      <h2 className="text-xl font-bold mb-12 text-center text-black">Connect. Engage. Support.</h2>
                    </div>
                  </div>
                  <img src='/slide-3.png' className='flex-[40%] translate-x-8' />
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>


        <div className="flex space-x-2 mt-12 absolute bottom-10 left-[50%] -translate-x-[50%]">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${activeSlide === index ? 'bg-amber-500' : 'bg-gray-300 bg-opacity-50'
                }`}
            />
          ))}
        </div>
      </section>


    </>
  );
};