import { Header } from '@/components/layouts/HeaderComponent'
import { HeroSection } from '@/components/section/HeroSectionComponent'
import { AboutSection } from '@/components/section/AboutSectionComponents'
import { FeaturesSection } from '@/components/section/FeatureSectionComponent'
import { HowItWorksSection } from '@/components/section/HowItsWorkSectionComponent'
import { LaunchLinkSection } from '@/components/section/LunchLinkSectionComponent'
import { Footer } from '@/components/layouts/FooterComponent'
import React from 'react'

const page = () => {
  

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <LaunchLinkSection />
        <Footer />
    </div>
  )
}

export default page