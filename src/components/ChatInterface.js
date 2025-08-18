import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSignOut, useUserId } from '@nhost/react';
import { 
  GET_CHATS, 
  CREATE_CHAT, 
  DELETE_CHAT,
  UPDATE_CHAT_TITLE 
} from '../graphql/queries';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const ChatInterface = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userId = useUserId();
  const { signOut } = useSignOut();

  const { data: chatsData, loading: chatsLoading, error: chatsError } = useQuery(GET_CHATS);
  const [createChat, { loading: createChatLoading }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    onCompleted: (data) => {
      setSelectedChatId(data.insert_chats_one.id);
    }
  });

  const [deleteChat] = useMutation(DELETE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    onCompleted: () => {
      if (selectedChatId) {
        setSelectedChatId(null);
      }
    }
  });

  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE);

  const handleCreateChat = async () => {
    try {
      await createChat({
        variables: {
          title: `New Chat ${new Date().toLocaleTimeString()}`
        }
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat({
          variables: { chatId }
        });
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleUpdateChatTitle = async (chatId, newTitle) => {
    try {
      await updateChatTitle({
        variables: {
          chatId,
          title: newTitle
        }
      });
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  if (chatsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600">
          <h2 className="text-lg font-semibold">Error loading chats</h2>
          <p>{chatsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <>
              <h1 className="text-xl font-bold text-gray-800">Chats</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCreateChat}
                  disabled={createChatLoading}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  title="New Chat"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  title="Sign Out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-4 h-4 flex flex-col justify-between">
              <div className="h-0.5 bg-gray-600"></div>
              <div className="h-0.5 bg-gray-600"></div>
              <div className="h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>

        {/* Chat List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <ChatList
                chats={chatsData?.chats || []}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
                onDeleteChat={handleDeleteChat}
                onUpdateTitle={handleUpdateChatTitle}
              />
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatWindow 
            chatId={selectedChatId} 
            onUpdateTitle={handleUpdateChatTitle}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Chat</h2>
              <p className="text-gray-600 mb-6">Select a chat or create a new one to get started</p>
              <button
                onClick={handleCreateChat}
                disabled={createChatLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;