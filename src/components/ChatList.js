import React, { useState } from 'react';
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
const ChatList = ({ chats, selectedChatId, onSelectChat, onDeleteChat, onUpdateTitle }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== '') {
      await onUpdateTitle(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateTitle = (title, maxLength = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-4xl mb-2">🗨️</div>
        <p>No chats yet</p>
        <p className="text-sm">Create your first chat to get started</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedChatId === chat.id
              ? 'bg-blue-50 border-l-4 border-blue-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => !editingChatId && onSelectChat(chat.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {editingChatId === chat.id ? (
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-gray-800 truncate">
                    {truncateTitle(chat.title)}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {chat.messages_aggregate?.aggregate?.count || 0} messages
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons - only show on hover and when not editing */}
            {editingChatId !== chat.id && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(chat);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit title"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                  title="Delete chat"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;