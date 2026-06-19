import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface AdminNotificationsState {
  contactInquiryUnreadCount: number;
}

const initialState: AdminNotificationsState = {
  contactInquiryUnreadCount: 0,
};

const adminNotificationsSlice = createSlice({
  name: 'adminNotifications',
  initialState,
  reducers: {
    setContactInquiryUnreadCount(state, action: PayloadAction<number>) {
      state.contactInquiryUnreadCount = Math.max(0, action.payload);
    },
  },
});

export const { setContactInquiryUnreadCount } = adminNotificationsSlice.actions;

export const selectContactInquiryUnreadCount = (state: RootState) =>
  state.adminNotifications.contactInquiryUnreadCount;

export default adminNotificationsSlice.reducer;
