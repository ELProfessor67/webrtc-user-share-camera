import React from 'react';


const Step = ({ number, title, description }) => {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

export const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Sign up in a few steps",
      description: "With no payment card needed"
    },
    {
      number: 2,
      title: "Enter your customer's mobile number or email",
      description: "And send a video link instantly"
    },
    {
      number: 3,
      title: "View live video, take video snapshots or image",
      description: "See exactly what your customer sees"
    },
    {
      number: 4,
      title: "Send the link to any colleague, your contractor or any system",
      description: "Collaborate and solve problems faster"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-amber-400">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">How it works</h2>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-2 relative z-10">
            {steps.map((step, index) => (
              <Step
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
          
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-0 right-0 h-0.5 bg-gray-300 z-0">
            <div className="absolute -top-1 left-1/4 w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="absolute -top-1 left-2/4 w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="absolute -top-1 left-3/4 w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};