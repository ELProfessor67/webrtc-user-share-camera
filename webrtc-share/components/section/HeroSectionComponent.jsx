'use client'
import React, { useState, useEffect } from 'react';

export const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="relative bg-gray-800 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-section-bg.png')",
            opacity: 0.5,
            backgroundSize: "cover"
          }}
        />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Videodesk.co.uk</h1>
            <p className="text-xl md:text-2xl mb-10">
              Connect Customer service calls with an instant video link and see what your customers see
            </p>
            <div className='flex gap-2 items-center'>
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

            <div className="flex space-x-2 mt-12">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${activeSlide === index ? 'bg-amber-500' : 'bg-white bg-opacity-50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
};