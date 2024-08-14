import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import moment from "moment";
import Cookies from "js-cookie";  // Importando js-cookie

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  // Interceptor de requisição para adicionar o token
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token"); // Usando js-cookie para pegar o token
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de resposta para lidar com erros e renovação de token
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { data } = await api.post("/auth/refresh_token");
          Cookies.set("token", data.token); // Usando js-cookie para salvar o token
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (err) {
          Cookies.remove("token"); // Removendo o token com js-cookie
          Cookies.remove("companyId");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
          toastError(err);
        }
      } else if (error?.response?.status === 401) {
        Cookies.remove("token");
        Cookies.remove("companyId");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
        history.push("/login");
        toastError("Sessão expirada, por favor faça login novamente.");
      }
      return Promise.reject(error);
    }
  );

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const token = Cookies.get("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          Cookies.set("token", data.token); // Salvando o token usando js-cookie
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          toastError(err);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const companyId = Cookies.get("companyId");
    if (companyId) {
      const socket = socketManager.getSocket(companyId);

      socket.on(`company-${companyId}-user`, (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [socketManager, user]);

  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", userData);
      const { user: { companyId, id, company } } = data;

      if (has(company, "settings") && isArray(company.settings)) {
        const setting = company.settings.find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          Cookies.set("cshow", null); // Usando js-cookie
        }
      }

      moment.locale('pt-br');
      const dueDate = data.user.company.dueDate;
      const hoje = moment().format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");
      const diff = moment(dueDate).diff(moment());
      const before = moment().isBefore(dueDate);
      const dias = moment.duration(diff).asDays();

      if (before) {
        Cookies.set("token", data.token); // Salvando token com js-cookie
        Cookies.set("companyId", companyId);
        Cookies.set("userId", id);
        Cookies.set("companyDueDate", vencimento);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
        setIsAuth(true);
        toast.success(i18n.t("auth.toasts.success"));
        if (Math.round(dias) < 5) {
          toast.warn(`Sua assinatura vence em ${Math.round(dias)} ${Math.round(dias) === 1 ? 'dia' : 'dias'}`);
        }
        history.push("/tickets");
      } else {
        toastError(`Opss! Sua assinatura venceu ${vencimento}. Entre em contato com o Suporte para mais informações!`);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/logout");
      setIsAuth(false);
      setUser({});
      Cookies.remove("token");
      Cookies.remove("companyId");
      Cookies.remove("userId");
      Cookies.remove("cshow");
      api.defaults.headers.Authorization = undefined;
      history.push("/login");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      toastError(err);
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;
