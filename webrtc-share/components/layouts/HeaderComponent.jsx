import React from 'react';
import { VideoIcon } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center flex-col">
          <a href="/" className="text-2xl font-bold text-gray-900 flex items-center">
            <VideoIcon className="mr-2" />
            <span>Videodesk.co.uk</span>
          </a>
          <img src="/device-icons.png" alt="Videodesk" className="mt-2 w-20" />
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors">
            About
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors">
            How it works
          </a>
          <a href="#launch-link" className="text-gray-700 hover:text-gray-900 transition-colors">
            Launch new video link
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
            Pricing
          </a>
          <a href="#login" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-full transition-colors">
            Log in
          </a>
          <a 
            href="#signup" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-full transition-colors"
          >
            Sign up in 3 easy steps!
          </a>
        </nav>
        
        <button className="md:hidden text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};