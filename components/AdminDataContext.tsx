// contexts/AdminDataContext.tsx
'use client';
import { createContext, useContext } from 'react';
import { ChatState } from '@/state/slices/chatSlice';

interface AdminDataContextType {
  userChatState?: ChatState;
  isAdminView?: boolean;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export const AdminDataProvider = AdminDataContext.Provider;

export const useAdminData = () => {
  return useContext(AdminDataContext);
};
