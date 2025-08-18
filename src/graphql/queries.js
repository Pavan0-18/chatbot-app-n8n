import { gql } from '@apollo/client';

// Queries
export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      messages(order_by: { created_at: asc }) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`;

// Mutations
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chatId: uuid!, $content: String!, $isBot: Boolean = false) {
    insert_messages_one(object: { 
      chat_id: $chatId, 
      content: $content, 
      is_bot: $isBot 
    }) {
      id
      content
      is_bot
      created_at
    }
  }
`;

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chatId: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chatId }, _set: { title: $title, updated_at: "now()" }) {
      id
      title
      updated_at
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`;

// Subscriptions
export const SUBSCRIBE_TO_MESSAGES = gql`
  subscription SubscribeToMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
    }
  }
`;

export const SUBSCRIBE_TO_CHATS = gql`
  subscription SubscribeToChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

// Hasura Action
export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chatId: uuid!, $message: String!) {
    sendMessage(chatId: $chatId, message: $message) {
      success
      message
      response
    }
  }
`;