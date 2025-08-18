import React from 'react';
import { useAuthenticationStatus } from '@nhost/react';
import Auth from './Auth';
import ChatInterface from './ChatInterface';

const ChatApp = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <ChatInterface /> : <Auth />;
};

export default ChatApp;