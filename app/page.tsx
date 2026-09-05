'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/Navbar';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { TrustAndPrivacy } from '@/components/TrustAndPrivacy';
import { Preferences, UserPreferencesData } from '@/components/Preferences';
import { GoogleStack } from '@/components/GoogleStack';
import { CaseStudiesExplorer } from '@/components/CaseStudiesExplorer';
import { CloudLuminary } from '@/components/CloudLuminary';
import { MapsExplorerModal } from '@/components/MapsExplorerModal';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'landing' | 'sanctuary' | 'privacy' | 'preferences' | 'stack' | 'case-studies'>('landing');
  const [initialThought, setInitialThought] = useState('');
  const [mapsModalOpen, setMapsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && activeTab === 'landing') {
        setActiveTab('sanctuary');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleBeginReflection = (thought: string) => {
    setInitialThought(thought);
    setActiveTab('sanctuary');
  };

  const handleNavigate = (tab: 'landing' | 'sanctuary' | 'privacy' | 'preferences' | 'stack' | 'case-studies') => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    setActiveTab(user ? 'sanctuary' : 'landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded bg-[#6B8E9B] flex items-center justify-center text-white font-serif italic text-lg shadow-xs animate-pulse">
          S
        </div>
        <div className="space-y-1 text-center font-sans">
          <p className="font-serif text-[#2C3539] text-base">Serene AI</p>
          <p className="text-xs text-[#6B8E9B]">Quietly preparing your sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#2C3539] font-sans relative">
      <Navbar
        user={user}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenMaps={() => setMapsModalOpen(true)}
        onSignOut={() => {
          setUser(null);
          setActiveTab('landing');
        }}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === 'landing' && (
          <LandingPage
            onSignedIn={() => setActiveTab('sanctuary')}
            onBeginReflection={handleBeginReflection}
            onNavigateToPrivacy={() => setActiveTab('privacy')}
            onNavigateToPreferences={() => setActiveTab('preferences')}
            onNavigateToStack={() => setActiveTab('stack')}
            onNavigateToCaseStudies={() => setActiveTab('case-studies')}
          />
        )}

        {activeTab === 'sanctuary' && (
          <Dashboard
            user={user}
            initialPrompt={initialThought}
            onOpenMaps={() => setMapsModalOpen(true)}
            onOpenPrivacy={() => setActiveTab('privacy')}
            onOpenPreferences={() => setActiveTab('preferences')}
          />
        )}

        {activeTab === 'privacy' && (
          <TrustAndPrivacy onBack={handleBack} />
        )}

        {activeTab === 'preferences' && (
          <Preferences onBack={handleBack} />
        )}

        {activeTab === 'stack' && (
          <GoogleStack 
            onBack={handleBack} 
            onNavigateToCaseStudies={() => setActiveTab('case-studies')}
          />
        )}

        {activeTab === 'case-studies' && (
          <CaseStudiesExplorer onBack={handleBack} />
        )}
      </main>

      {/* The Cloud Luminary: Ambient Architecture Pollinator */}
      <CloudLuminary
        activeTab={activeTab}
        onActivate={() => setActiveTab('case-studies')}
      />

      {/* Global Google Maps Agent Launcher */}
      <MapsExplorerModal
        isOpen={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
      />
    </div>
  );
}
