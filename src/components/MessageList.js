import React from 'react';
import { UserIcon } from '@heroicons/react/24/solid';

const MessageList = ({ messages, isLoading }) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageContent = (content) => {
    // Simple formatting for line breaks
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.is_bot ? 'justify-start' : 'justify-end'}`}
        >
          <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${
            message.is_bot ? 'flex-row' : 'flex-row-reverse'
          }`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 ${
              message.is_bot ? 'mr-3' : 'ml-3'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.is_bot 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {message.is_bot ? (
                  <span className="text-sm font-bold">AI</span>
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className={`px-4 py-2 rounded-lg ${
              message.is_bot
                ? 'bg-white border border-gray-200 text-gray-800'
                : 'bg-blue-600 text-white'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {formatMessageContent(message.content)}
              </div>
              <div className={`text-xs mt-1 ${
                message.is_bot ? 'text-gray-500' : 'text-blue-100'
              }`}>
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex flex-row">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;