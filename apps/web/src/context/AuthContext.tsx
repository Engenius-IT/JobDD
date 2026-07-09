'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';

// Define User type (matches shared-types somewhat, but simplified for frontend context)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  companyName?: string;
  companyLogo?: string;
  companyId?: string;
  companyPackagePlanName?: 'PRO' | 'PREMIUM' | 'VIP' | 'DEFAULT'; // เพิ่ม property นี้
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    // เมื่อโหลด user จาก localStorage ให้พยายาม parse companyPackagePlanName ด้วย
    if (storedUser && storedToken) {
      try {
        setUserState(JSON.parse(storedUser));
        
        // ดึงข้อมูลโปรไฟล์ล่าสุดเพื่ออัปเดตสิทธิ์แพ็กเกจ
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Refresh failed');
        })
        .then((userData) => {
          localStorage.setItem('user', JSON.stringify(userData));
          setUserState(userData);
        })
        .catch(() => {});
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    // เมื่อ login ให้เก็บ companyPackagePlanName ลง localStorage ด้วย
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUserState(userData);

    // Redirect based on role
    if (userData.role === 'JOBSEEKER') {
      router.push('/profilefull');
    } else if (userData.role === 'EMPLOYER' || userData.role === 'ADMIN') {
      // ADMIN should also go to employer dashboard as requested to see employer view
      router.push('/employer/dashboard');
    } else {
      router.push('/'); // Fallback
    }
  };

  const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  setUserState(null);
  
  // ใช้ตัวนี้ยิงตรงเข้าหน้าใหม่ เคลียร์ State เก่าในแรมทิ้งทั้งหมด 
  window.location.href = '/th/login'; 
};

  const setUser = (userData: User | null) => {
    // เมื่อ set user ให้เก็บ companyPackagePlanName ลง localStorage ด้วย
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
