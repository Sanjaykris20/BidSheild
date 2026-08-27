'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserPersona = 'BIDDER' | 'CLIENT' | 'ADMIN';

export interface PersonaProfile {
  role: UserPersona;
  name: string;
  title: string;
  organization: string;
  badge: string;
  initials: string;
  defaultPath: string;
}

export const PERSONA_PROFILES: Record<UserPersona, PersonaProfile> = {
  BIDDER: {
    role: 'BIDDER',
    name: 'TechCorp Solutions',
    title: 'Vendor / Bidder',
    organization: 'TechCorp Solutions Pvt Ltd',
    badge: 'Vendor Portal',
    initials: 'T',
    defaultPath: '/bidder/dashboard',
  },
  CLIENT: {
    role: 'CLIENT',
    name: 'P. Sharma (Officer)',
    title: 'Senior Procurement Officer',
    organization: 'Chennai Petroleum Corporation Ltd (CPCL)',
    badge: 'Procurement Desk',
    initials: 'P',
    defaultPath: '/client/dashboard',
  },
  ADMIN: {
    role: 'ADMIN',
    name: 'System Admin',
    title: 'System Administrator',
    organization: 'GeM Central Control Center',
    badge: 'Control Center',
    initials: 'A',
    defaultPath: '/admin/dashboard',
  },
};

interface AuthContextType {
  currentPersona: UserPersona | null;
  profile: PersonaProfile | null;
  loginAs: (persona: UserPersona) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<UserPersona | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Detect persona from current pathname if already on a sub-route
    if (pathname.startsWith('/bidder')) {
      setCurrentPersona('BIDDER');
    } else if (pathname.startsWith('/client')) {
      setCurrentPersona('CLIENT');
    } else if (pathname.startsWith('/admin')) {
      setCurrentPersona('ADMIN');
    }
  }, [pathname]);

  const loginAs = (persona: UserPersona) => {
    setCurrentPersona(persona);
    const profile = PERSONA_PROFILES[persona];
    router.push(profile.defaultPath);
  };

  const logout = () => {
    setCurrentPersona(null);
    router.push('/');
  };

  const profile = currentPersona ? PERSONA_PROFILES[currentPersona] : null;

  return (
    <AuthContext.Provider value={{ currentPersona, profile, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
