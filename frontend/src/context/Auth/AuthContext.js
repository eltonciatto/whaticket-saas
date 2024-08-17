import React, { createContext, useEffect } from "react";
import Cookies from "js-cookie";
import useAuth from "../../hooks/useAuth.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { loading, user, isAuth, handleLogin, handleLogout } = useAuth();

  useEffect(() => {
    // Verificar se o cookie de sessão já existe
    const sessionCookie = Cookies.get("user_session");

    // Se o usuário estiver logado e o cookie ainda não existir, definir o cookie
    if (isAuth && !sessionCookie) {
      Cookies.set("user_session", "active", { expires: 7 });
    }
  }, [isAuth]);

  return (
    <AuthContext.Provider
      value={{ loading, user, isAuth, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
