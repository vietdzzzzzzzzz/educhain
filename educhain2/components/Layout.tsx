
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

// Lazy-load ChatBot and fall back to no-op component if import fails (tránh crash toàn trang)
const SafeChatBot = lazy(async () => {
  try {
    return await import('./ChatBot');
  } catch (e) {
    console.error('ChatBot load error:', e);
    return { default: () => null };
  }
});

const Layout: React.FC = () => {
  const { user } = useAuth();
  const [chatEnabled, setChatEnabled] = useState(false);

  // Chỉ bật chatbot nếu có user để tránh render khi chưa login, và tránh import sớm
  useEffect(() => {
    if (user) setChatEnabled(true);
  }, [user]);

  if (!user) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-hidden relative">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
        {/* EduBot AI Assistant */}
        {chatEnabled && (
          <Suspense fallback={null}>
            <SafeChatBot />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default Layout;
