'use client';

import Link from 'next/link';
import { Shield, Check, Lock, Globe } from 'lucide-react';
import { AppNavbar } from '@/components/shared/app-navbar';

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'High-Level Security',
      description: 'Blockchain technology ensures every diploma is verified and cannot be forged',
    },
    {
      icon: Check,
      title: 'Instant Verification',
      description: 'Verify diplomas in just seconds through a transparent blockchain system',
    },
    {
      icon: Lock,
      title: 'Centralized Data',
      description: 'All academic diploma data is securely stored and accessible by the university',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Diploma holders can verify their credentials anywhere, anytime',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              SiakadChain
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Blockchain System for Secure and Transparent Academic Diploma Verification
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-accent transition-all duration-200 ease-out"
              >
                Search Diploma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why SiakadChain?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-all duration-200 ease-out"
                >
                  <Icon size={32} className="text-primary mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Search Diploma</h3>
              <p className="text-sm text-muted-foreground">
                Use the search feature to find diplomas based on the owner's name or Student ID (NIM)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Upload File</h3>
              <p className="text-sm text-muted-foreground">
                Upload your diploma file to be verified through the blockchain system
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Verification</h3>
              <p className="text-sm text-muted-foreground">
                Get instant verification results with complete information about your diploma
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Verify Your Diploma?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use the secure and trusted SiakadChain system to verify your academic credentials in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-accent transition-all duration-200 ease-out"
            >
              Start Searching
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}