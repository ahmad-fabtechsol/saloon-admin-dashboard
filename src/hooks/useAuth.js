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

  // Persist a real session returned from the API.
  function setSession({ user, token, refreshToken }) {
    dispatch(setCredentials({ user, token, refreshToken }))
  }

  function logout() {
    dispatch(logoutAction())
  }

  function patchUser(partial) {
    dispatch(updateUser(partial))
  }

  return { user, token, isAuthenticated, setSession, logout, patchUser }
}
