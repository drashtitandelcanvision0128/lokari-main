'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();
    const interval = setInterval(checkTheme, 100);
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Agricultural economist with 15+ years of experience in digital transformation of farming communities.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Priya Sharma", 
      role: "CTO",
      bio: "Technology visionary specializing in blockchain and IoT applications for agricultural supply chains.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Amit Patel",
      role: "Head of Operations",
      bio: "Supply chain expert with extensive experience in agricultural logistics and warehouse management.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Sneha Reddy",
      role: "VP of Partnerships",
      bio: "Strategic relationship builder connecting farmers with institutional buyers and financial partners.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: "verified",
      title: "Trust & Transparency",
      description: "Every transaction and partnership is verified, creating a foundation of trust in the agricultural ecosystem."
    },
    {
      icon: "agriculture",
      title: "Farmer First",
      description: "We prioritize farmers' prosperity through fair pricing, direct market access, and digital empowerment."
    },
    {
      icon: "hub",
      title: "Connected Ecosystem",
      description: "Seamlessly connecting farmers, traders, warehouses, and logistics in one unified digital platform."
    },
    {
      icon: "trending_up",
      title: "Growth & Innovation",
      description: "Continuously evolving with cutting-edge technology to drive agricultural sector advancement."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Foundation",
      description: "Lokhari founded with a vision to digitize agricultural trade in India"
    },
    {
      year: "2021", 
      title: "Platform Launch",
      description: "First version of the marketplace connecting 500+ farmers with traders"
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Integrated warehouse and logistics solutions across 10 states"
    },
    {
      year: "2023",
      title: "Innovation",
      description: "Launched AI-powered market intelligence and blockchain-based receipts"
    },
    {
      year: "2024",
      title: "Scale",
      description: "50,000+ farmers, 1,200+ warehouses, and growing ecosystem"
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Agricultural Team Working" 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920&h=600&fit=crop"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDark ? 'from-[#0b5d68]/90 to-black/70' : 'from-[#0b5d68]/80 to-black/60'
          }`}></div>
        </div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl font-bold text-white leading-tight mb-6 tracking-tighter">
              Transforming <span className="text-[#2eb5c2]">Agricultural Trade</span>
            </h1>
            <p className="text-white/90 text-lg mb-8 font-body leading-relaxed">
              We're building India's most trusted digital agricultural marketplace, connecting farmers, traders, 
              warehouses, and logistics providers in a unified ecosystem that drives prosperity for all.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <button className="bg-[#e89151] hover:bg-[#d67a3a] text-white px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95">
                  Join Our Mission
                </button>
              </Link>
              <Link href="/listings">
                <button className={`px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
                  isDark ? 'border-white text-white hover:bg-white hover:text-[#0b5d68]' : 'border-white text-white hover:bg-white hover:text-[#0b5d68]'
                }`}>
                  Explore Marketplace
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`font-headline text-4xl font-bold mb-6 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
                Our Story
              </h2>
              <div className={`space-y-4 text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} leading-relaxed`}>
                <p>
                  Founded in 2020, Lokhari emerged from a simple observation: while agriculture forms the backbone 
                  of our economy, farmers and traders were still operating in fragmented, inefficient markets.
                </p>
                <p>
                  We set out to build a digital ecosystem that would bridge this gap - creating transparency, 
                  efficiency, and trust in agricultural trade. Today, we're proud to serve over 50,000 farmers 
                  and 1,200+ warehouse partners across India.
                </p>
                <p>
                  Our platform isn't just about transactions; it's about transforming lives through technology, 
                  ensuring farmers get fair prices, traders get reliable supply, and the entire agricultural 
                  value chain operates with unprecedented efficiency.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                alt="Agricultural Innovation" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&h=400&fit=crop"
              />
              <div className={`absolute -bottom-6 -right-6 ${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl p-6 shadow-xl border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="text-3xl font-bold text-[#2eb5c2] mb-2">50,000+</div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Farmers Empowered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-headline text-4xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
              Our Core Values
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              The principles that guide every decision we make and every feature we build
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <span className="material-symbols-outlined text-white text-3xl">{value.icon}</span>
                </div>
                <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                  {value.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-headline text-4xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
              Leadership Team
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              The visionaries and experts driving Lokhari's mission to revolutionize agricultural trade
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 mx-auto w-32 h-32">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto transition-all duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0b5d68]/20 to-[#2eb5c2]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className={`font-headline text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                  {member.name}
                </h3>
                <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-[#2eb5c2]' : 'text-[#e89151]'}`}>
                  {member.role}
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-headline text-4xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
              Our Journey
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              Key milestones in our mission to transform agricultural trade
            </p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className={`inline-block p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                    } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>
                        {milestone.year}
                      </div>
                      <h3 className={`font-headline text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                        {milestone.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#2eb5c2] rounded-full border-4 border-current"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 px-8 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0b5d68] via-[#2eb5c2] to-[#0b5d68]'}`}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-headline text-4xl font-bold text-white mb-6">
            Join the Agricultural Revolution
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of India's largest digital agricultural marketplace and transform the way farming communities trade and prosper.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <button className="bg-white text-[#0b5d68] px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95">
                Get Started Today
              </button>
            </Link>
            <Link href="/contact">
              <button className={`px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white text-white hover:bg-white hover:text-[#0b5d68]`}>
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
