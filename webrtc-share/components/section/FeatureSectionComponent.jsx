import React from 'react';
import { MessageCircle, Search, Languages, DollarSign, Users, CircleOffIcon, LanguagesIcon, SearchIcon } from 'lucide-react';



const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      {/* <h3 className="font-semibold mb-2">{title}</h3> */}
      <p className="text-gray-600">{title} {description}</p>
    </div>
  );
};

export const FeaturesSection = () => {
  const features = [
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "Make conversations faster and easier",
      description: "See what your customers see"
    },
    {
      icon: <Search className="w-8 h-8 text-white" />,
      title: "Diagnose faults 3x faster",
      description: "Get visual confirmation of issues"
    },
    {
      icon: <Languages className="w-8 h-8 text-white" />,
      title: "Support customers whose first language isn't English",
      description: "Visual communication bridges language barriers"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-white" />,
      title: "Save time and money with accurate diagnostics",
      description: "Reduce service calls and improve first-time resolution"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "See what your ",
      description: "customers see"
    },
    {
      icon: <CircleOffIcon className="w-8 h-8 text-white" />,
      title: "Record videos and images of",
      description: "your screen, your way"
    },
    {
      icon: <LanguagesIcon className="w-8 h-8 text-white" />,
      title: "Support customers whose first ",
      description: "language isn't english"
    },
    {
      icon: <SearchIcon className="w-8 h-8 text-white" />,
      title: "Capture and share crucial ",
      description: "information visually"
    },

    

  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Connect with your customers with an instant video link
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
        <div className="flex justify-center items-center flex-col mt-8">
        <img src="/device-icons.png" alt="Videodesk" className="w-60 mb-2" />
        <h2 className="text-3xl font-bold mb-12 text-center text-black">Connect. Engage. Support.</h2>
        </div>
      </div>
    </section>
  );
};