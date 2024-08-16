import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
  const { isAuth, loading } = useContext(AuthContext);

  // Exibe o loading enquanto a autenticação está sendo verificada
  if (loading) {
    return <BackdropLoading />;
  }

  // Redireciona para login se a rota é privada e o usuário não está autenticado
  if (!isAuth && isPrivate) {
    return <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />;
  }

  // Redireciona para a home se a rota é pública e o usuário está autenticado
  if (isAuth && !isPrivate) {
    return <Redirect to={{ pathname: "/", state: { from: rest.location } }} />;
  }

  // Renderiza a rota normalmente se as condições acima não forem atendidas
  return <RouterRoute {...rest} component={Component} />;
};

export default Route;
