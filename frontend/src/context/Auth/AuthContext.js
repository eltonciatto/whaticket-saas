import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { loading, user, isAuth, handleLogin, handleLogout } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false); // Controle para evitar alertas duplicados

  useEffect(() => {
    // Verifica se o usuário está autenticado e se a sessão já foi checada
    if (!loading && !isAuth && !sessionChecked) {
      toast.error("Sessão Expirada, por favor entre novamente");
      setSessionChecked(true); // Marca como checado para não exibir novamente
    }
  }, [loading, isAuth, sessionChecked]);

  return (
    <AuthContext.Provider
      value={{ loading, user, isAuth, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
