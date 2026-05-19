import { useDispatch, useSelector } from 'react-redux'
import {
  setCredentials,
  updateUser,
  logout as logoutAction,
  selectUser,
  selectToken,
  selectIsAuthenticated,
} from '@/store/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  function login(email, password) {
    dispatch(setCredentials({
      user: { email, name: 'Admin User' },
      token: 'mock-token',
    }))
  }

  function signup(name, email, password) {
    dispatch(setCredentials({
      user: { email, name },
      token: 'mock-token',
    }))
  }

  function logout() {
    dispatch(logoutAction())
  }

  function patchUser(partial) {
    dispatch(updateUser(partial))
  }

  return { user, token, isAuthenticated, login, signup, logout, patchUser }
}
