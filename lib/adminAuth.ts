export interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  loginTime: string;
}

export const getAdminSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const session = localStorage.getItem('adminSession');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error parsing admin session:', error);
    return null;
  }
};

export const isAdminAuthenticated = (): boolean => {
  const session = getAdminSession();
  if (!session?.isAuthenticated) return false;
  
  // Check if session is not older than 24 hours
  const loginTime = new Date(session.loginTime);
  const now = new Date();
  const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
};

export const clearAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminSession');
};

export const redirectIfNotAdmin = (): void => {
  if (!isAdminAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin-login';
    }
  }
};
