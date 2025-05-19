import React from 'react';
import { VideoIcon, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-12 bg-gray-100 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="mb-6 md:mb-0">
            <a href="/" className="text-2xl font-bold text-gray-900 flex items-center mb-4">
              <VideoIcon className="mr-2" />
              <span>Videonary.com</span>
            </a>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-gray-600">Phone number</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-gray-600">Email</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium mb-3">About</h4>
            </div>
            <div>
              <h4 className="font-medium mb-3">How it works</h4>
            </div>
            <div>
              <h4 className="font-medium mb-3">Launch new video link</h4>
            </div>
            <div>
              <h4 className="font-medium mb-3">Pricing</h4>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Videonary.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};