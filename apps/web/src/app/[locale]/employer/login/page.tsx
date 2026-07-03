'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function EmployerLoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main login page immediately
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}
