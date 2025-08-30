import { useEffect, useState } from "react";
import { TokenService, UserService } from ".";


export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = TokenService.getToken();
    const storedUser = UserService.getUser();
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (accessToken, userData) => {
    TokenService.saveToken(accessToken);
    UserService.saveUser(userData);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    TokenService.removeToken();
    // UserService.removeUser();
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
