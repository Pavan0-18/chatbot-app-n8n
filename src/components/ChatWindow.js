import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_CHAT_MESSAGES, 
  INSERT_MESSAGE, 
  SEND_MESSAGE_ACTION,
  SUBSCRIBE_TO_MESSAGES 
} from '../graphql/queries';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import MessageList from './MessageList';

const ChatWindow = ({ chatId, onUpdateTitle }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Query for initial messages
  const { data: chatData, loading: messagesLoading } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId },
    skip: !chatId
  });

  // Subscription for real-time messages
  const { data: subscriptionData } = useSubscription(SUBSCRIBE_TO_MESSAGES, {
    variables: { chatId },
    skip: !chatId
  });

  // Mutations
  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION);

  // Use subscription data if available, otherwise use query data
  const messages = subscriptionData?.messages || chatData?.chats_by_pk?.messages || [];
  const chatTitle = chatData?.chats_by_pk?.title;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      // First, insert the user message
      await insertMessage({
        variables: {
          chatId,
          content: userMessage,
          isBot: false
        }
      });

      // Update chat title if it's still "New Chat" and this is the first message
      if (chatTitle && chatTitle.startsWith('New Chat') && messages.length === 0) {
        const newTitle = userMessage.length > 50 
          ? userMessage.substring(0, 50) + '...' 
          : userMessage;
        onUpdateTitle(chatId, newTitle);
      }

      // Call the Hasura action to get bot response
      const response = await sendMessageAction({
        variables: {
          chatId,
          message: userMessage
        }
      });

      if (!response.data?.sendMessage?.success) {
        throw new Error(response.data?.sendMessage?.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Insert an error message
      await insertMessage({
        variables: {
          chatId,
          content: 'Sorry, I encountered an error. Please try again.',
          isBot: true
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {chatTitle || 'Chat'}
        </h2>
        <p className="text-sm text-gray-500">
          {messages.length} messages
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600">
                Send a message to begin chatting with the AI assistant
              </p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[48px] max-h-32"
              rows="1"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
            )}
          </button>
        </form>
        
        {isLoading && (
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span>AI is typing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;