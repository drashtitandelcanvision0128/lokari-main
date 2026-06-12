import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User, UserProfile } from '@/lib/registration'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isHydrated: boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isHydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<{ user: User | null; profile: UserProfile | null }>) {
      state.user = action.payload.user
      state.profile = action.payload.profile
      state.isHydrated = true
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isHydrated = true
    },
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload
    },
    logout(state) {
      state.user = null
      state.profile = null
    },
  },
})

export const { hydrateAuth, setUser, setProfile, logout } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectUserProfile = (state: { auth: AuthState }) => state.auth.profile
export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.user)
export const selectAuthHydrated = (state: { auth: AuthState }) => state.auth.isHydrated
export const selectUserDisplayName = (state: { auth: AuthState }) =>
  state.auth.user?.fullName ?? ''
