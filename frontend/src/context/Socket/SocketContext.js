import { createContext } from "react";
import openSocket from "socket.io-client";
import { isExpired, decodeToken } from "react-jwt";
import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

class ManagedSocket {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.rawSocket = socketManager.currentSocket;
    this.callbacks = [];
    this.joins = [];

    this.rawSocket.on("connect", () => {
      if (this.rawSocket.io.opts.query?.r && !this.rawSocket.recovered) {
        const refreshJoinsOnReady = () => {
          for (const j of this.joins) {
            console.debug("Atualizando inscrição", j);
            this.rawSocket.emit(`join${j.event}`, ...j.params);
          }
          this.rawSocket.off("ready", refreshJoinsOnReady);
        };
        for (const j of this.callbacks) {
          this.rawSocket.off(j.event, j.callback);
          this.rawSocket.on(j.event, j.callback);
        }

        this.rawSocket.on("ready", refreshJoinsOnReady);
      }
    });
  }

  on(event, callback) {
    if (event === "ready" || event === "connect") {
      return this.socketManager.onReady(callback);
    }
    this.callbacks.push({ event, callback });
    return this.rawSocket.on(event, callback);
  }

  off(event, callback) {
    const i = this.callbacks.findIndex(
      (c) => c.event === event && c.callback === callback
    );
    this.callbacks.splice(i, 1);
    return this.rawSocket.off(event, callback);
  }

  emit(event, ...params) {
    if (event.startsWith("join")) {
      this.joins.push({ event: event.substring(4), params });
      console.log("Inscrevendo-se em", { event: event.substring(4), params });
    }
    return this.rawSocket.emit(event, ...params);
  }

  disconnect() {
    for (const j of this.joins) {
      this.rawSocket.emit(`leave${j.event}`, ...j.params);
    }
    this.joins = [];
    for (const c of this.callbacks) {
      this.rawSocket.off(c.event, c.callback);
    }
    this.callbacks = [];
  }
}

class DummySocket {
  on(..._) {}
  off(..._) {}
  emit(..._) {}
  disconnect() {}
}

const SocketManager = {
  currentCompanyId: -1,
  currentUserId: -1,
  currentSocket: null,
  socketReady: false,

  getSocket: function (companyId) {
    let userId = Cookies.get("userId");

    if (!companyId && !this.currentSocket) {
      return new DummySocket();
    }

    if (companyId && typeof companyId !== "string") {
      companyId = `${companyId}`;
    }

    if (companyId !== this.currentCompanyId || userId !== this.currentUserId) {
      if (this.currentSocket) {
        console.warn("Fechando o socket antigo - empresa ou usuário alterado");
        this.currentSocket.removeAllListeners();
        this.currentSocket.disconnect();
        this.currentSocket = null;
        this.currentCompanyId = null;
        this.currentUserId = null;
      }

      let token = Cookies.get("token");
      if (!token) {
        return new DummySocket();
      }

      if (isExpired(token)) {
        console.warn("Token expirado, recarregando após atualização");
        this.refreshToken();
        return new DummySocket();
      }

      this.currentCompanyId = companyId;
      this.currentUserId = userId;

      this.currentSocket = openSocket(process.env.REACT_APP_BACKEND_URL, {
        transports: ["websocket"],
        pingTimeout: 18000,
        pingInterval: 18000,
        query: { token },
      });

      this.currentSocket.io.on("reconnect_attempt", () => {
        this.currentSocket.io.opts.query.r = 1;
        token = Cookies.get("token");
        if (isExpired(token)) {
          console.warn("Atualizando token");
          this.refreshToken();
        } else {
          console.warn("Usando novo token");
          this.currentSocket.io.opts.query.token = token;
        }
      });

      this.currentSocket.on("disconnect", (reason) => {
        console.warn(`Socket desconectado devido a: ${reason}`);
        if (reason.startsWith("io server disconnect")) {
          console.warn("Tentando reconectar", this.currentSocket);
          token = Cookies.get("token");

          if (isExpired(token)) {
            console.warn("Token expirado - atualizando");
            this.refreshToken();
            return;
          }
          console.warn("Reconectando usando token atualizado");
          this.currentSocket.io.opts.query.token = token;
          this.currentSocket.io.opts.query.r = 1;
          this.currentSocket.connect();
        }
      });

      this.currentSocket.on("connect", (...params) => {
        console.warn("Socket conectado", params);
      });

      this.currentSocket.onAny((event, ...args) => {
        console.debug("Evento: ", { socket: this.currentSocket, event, args });
      });

      this.onReady(() => {
        this.socketReady = true;
      });
    }

    return new ManagedSocket(this);
  },

  onReady: function (callbackReady) {
    if (this.socketReady) {
      callbackReady();
      return;
    }

    this.currentSocket.once("ready", () => {
      callbackReady();
    });
  },

  onConnect: function (callbackReady) {
    this.onReady(callbackReady);
  },

  refreshToken: function () {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  },
};

const SocketContext = createContext();

export { SocketContext, SocketManager };
