'use client'
import React, { useState, useEffect } from 'react';

export const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      backgroundImage: "url('/hero-section-bg.png')",
      content: (
        <div className="mx-auto relative z-10 min-h-[85vh] px-10 flex flex-col justify-center">
          <div className="max-w-2xl">
            <div className='mb-10 ml-14 translate-y-[50px]'>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Videodesk.co.uk</h1>
              <p className="text-lg font-normal">
                Connect inbound or outbound customer service calls with <br />
                instant video links and see what your customers see <br />
                in real time
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
      )
    },
    {
      id: 2,
      backgroundImage: "url('/slide-2-bg.png')",
      content: (
        <div className="mx-auto relative z-10 min-h-[85vh] px-10 flex flex-col justify-center">
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
      )
    },
    {
      id: 3,
      backgroundImage: "bg-[#f9f9f9]",
      content: (
        <div className="mx-auto relative z-10 h-[85vh] flex flex-row bg-[#f9f9f9]">
          <div className='flex-[70%] flex flex-col p-10 pl-20'>
            <h1 className='text-black text-4xl font-semibold mt-0'>Built for Social Landlords</h1>
            <h1 className='text-5xl font-bold w-fit p-2 bg-amber-400 text-white mt-10 pr-8'>Embrace the power <br /> of instant video.</h1>
            <p className='text-black text-2xl font-normal whitespace-pre mt-6'>Reduce service calls and <br /><strong>improve first-time resolution</strong> for <br />repairs reporting.</p>
            <div className="flex justify-start items-start flex-col mt-8">
              <img src="/devices.svg" alt="Videodesk" className="w-60 mb-2" />
              <h2 className="text-xl font-bold mb-12 text-center text-black">Connect. Engage. Support.</h2>
            </div>
          </div>
          <img src='/slide-3.png' className='flex-[30%]' style={{ transform: 'translateX(-50px) translateY(10px)' }} />
        </div>
      )
    }
  ];

  useEffect(() => {
    const autoPlay = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(autoPlay);
  }, [slides.length]);

  return (
    <>
      <section className="relative bg-gray-800 text-white min-h-[85vh] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: slide.backgroundImage.startsWith('url') ? slide.backgroundImage : '',
                opacity: slide.backgroundImage.startsWith('url') ? 0.5 : 1,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat"
              }}
            />
            {slide.content}
          </div>
        ))}

        <div className="flex space-x-2 mt-12 absolute bottom-10 left-[50%] -translate-x-[50%] z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                activeSlide === index ? 'bg-amber-500' : 'bg-gray-300 bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
};