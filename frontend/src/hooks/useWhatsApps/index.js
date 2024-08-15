import { useState, useEffect, useReducer, useContext } from "react";
import toastError from "../../errors/toastError";
import Cookies from "js-cookie";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_WHATSAPPS":
      return [...action.payload];
    case "UPDATE_WHATSAPPS":
      const updatedState = state.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      return state.some(item => item.id === action.payload.id)
        ? updatedState
        : [action.payload, ...state];
    case "UPDATE_SESSION":
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload }
          : item
      );
    case "DELETE_WHATSAPPS":
      return state.filter(item => item.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/whatsapp/?session=0");
        dispatch({ type: "LOAD_WHATSAPPS", payload: data });
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = Cookies.get("companyId");
    if (!companyId) return;

    const socket = socketManager.getSocket(companyId);

    const handleUpdate = data => {
      dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
    };

    const handleDelete = data => {
      dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
    };

    const handleSessionUpdate = data => {
      dispatch({ type: "UPDATE_SESSION", payload: data.session });
    };

    socket.on(`company-${companyId}-whatsapp`, handleUpdate);
    socket.on(`company-${companyId}-whatsapp`, handleDelete);
    socket.on(`company-${companyId}-whatsappSession`, handleSessionUpdate);

    return () => {
      socket.off(`company-${companyId}-whatsapp`, handleUpdate);
      socket.off(`company-${companyId}-whatsapp`, handleDelete);
      socket.off(`company-${companyId}-whatsappSession`, handleSessionUpdate);
      socket.disconnect();
    };
  }, [socketManager]);

  return { whatsApps, loading };
};

export default useWhatsApps;
