import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useEffect } from 'react';
import { publicAnonKey } from '/utils/supabase/info';

// Clean up invalid tokens on app startup
function cleanupInvalidTokens() {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    try {
      // Validate token format and expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      
      if (Date.now() >= expirationTime) {
        console.log('Cleaning up expired token on app startup');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.log('Cleaning up invalid token on app startup');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }
  
  // Verify publicAnonKey is available
  if (!publicAnonKey) {
    console.error('CRITICAL: publicAnonKey is not available!');
  } else {
    console.log('✅ Public anon key loaded:', publicAnonKey.substring(0, 30) + '...');
  }
}

export default function App() {
  useEffect(() => {
    cleanupInvalidTokens();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}