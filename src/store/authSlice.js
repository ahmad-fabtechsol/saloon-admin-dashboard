import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {},
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user ?? state.user;
      state.token = action.payload.token ?? state.token;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = {};
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.token;
