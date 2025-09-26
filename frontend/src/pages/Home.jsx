import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import HowItWorksSection from "../components/HowItWorksSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Home() {
  const features = [
    {
      title: "AI-Guided First-Aid Support",
      description:
        "Intelligent chatbot providing immediate coping strategies and crisis intervention with professional referral capabilities",
      icon: "🤖",
    },
    {
      title: "Confidential Booking System",
      description: "Secure appointment scheduling with on-campus counsellors and mental health helplines",
      icon: "📅",
    },
    {
      title: "Psychoeducational Hub",
      description:
        "Comprehensive library of videos, audio resources, and wellness guides in multiple regional languages",
      icon: "📚",
    },
    {
      title: "Peer Support Platform",
      description: "Moderated community forum connecting students with trained peer volunteers for mutual support",
      icon: "👥",
    },
    {
      title: "Analytics Dashboard",
      description: "Anonymous data insights enabling administrators to identify trends and plan targeted interventions",
      icon: "📊",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Students Supported" },
    { number: "24/7", label: "Available Support" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "50+", label: "Partner Universities" },
  ];

  const testimonials = [
    {
      quote:
        "CalmConnect helped me through my toughest semester. The AI support was there when I needed it most at 2 AM.",
      author: "Sarah M.",
      role: "Psychology Student",
    },
    {
      quote: "The peer support platform connected me with others who understood exactly what I was going through.",
      author: "Alex K.",
      role: "Engineering Student",
    },
    {
      quote: "Booking counseling sessions became so much easier and private. No more awkward phone calls.",
      author: "Jamie L.",
      role: "Medical Student",
    },
  ];

  return (
    <div className="bg-black min-h-screen text-gray-200">
      <HeroSection />
      <StatsSection stats={stats} />
      <FeaturesSection features={features} />
      <TestimonialsSection testimonials={testimonials} />
      <HowItWorksSection />
      <CTASection />
      
    </div>
  );
}
