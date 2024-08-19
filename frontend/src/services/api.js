import axios from "axios";

// Verificação de variáveis de ambiente
if (!process.env.REACT_APP_BACKEND_URL) {
  throw new Error("REACT_APP_BACKEND_URL não está definido.");
}

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para capturar erros globalmente
api.interceptors.response.use(
  response => response,
  error => {
    // Exemplo de tratamento para erros 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      // Redirecionar para a página de login, por exemplo
      window.location.href = "/login";
    }

    // Tratar outros erros de forma genérica
    return Promise.reject(error);
  }
);

export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 30000, // Timeout de 30 segundos também para a API aberta
});

export default api;
