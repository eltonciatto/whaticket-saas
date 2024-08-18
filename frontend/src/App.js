import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import Cookies from "js-cookie"; // Substituindo o localStorage por js-cookie
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { SocketContext, SocketManager } from "./context/Socket/SocketContext";
import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = Cookies.get("preferredTheme"); // Usando js-cookie para obter o tema preferido
  const [mode, setMode] = useState(
    preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
  );

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = createTheme(
    {
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#012489",
        },
      },
      scrollbarStylesSoft: {
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: mode === "light" ? "#012489" : "#666666", // Ajuste para melhorar a visibilidade no dark mode
        },
      },
      palette: {
        type: mode,
        primary: { main: mode === "light" ? "#012489" : "#017ACC" },
        textPrimary: mode === "light" ? "#012489" : "#E0E0E0", // Melhor contraste no dark mode
        borderPrimary: mode === "light" ? "#012489" : "#017ACC",
        dark: { main: mode === "light" ? "#1A1A1A" : "#121212" },
        light: { main: mode === "light" ? "#F3F3F3" : "#2B2B2B" },
        tabHeaderBackground: mode === "light" ? "#E5E5E5" : "#2B2B2B", // Cores mais escuras para headers no dark mode
        optionsBackground: mode === "light" ? "#F7F7F7" : "#333333",
        options: mode === "light" ? "#012489" : "#017ACC",
        fontecor: mode === "light" ? "#012489" : "#FFFFFF",
        fancyBackground: mode === "light" ? "#F7F7F7" : "#333333",
        bordabox: mode === "light" ? "#E0E0E0" : "#555555", // Ajuste no dark mode
        newmessagebox: mode === "light" ? "#F3F3F3" : "#555555",
        inputdigita: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        contactdrawer: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        announcements: mode === "light" ? "#EDEDED" : "#444444",
        login: mode === "light" ? "#FFFFFF" : "#1A1A1A",
        announcementspopover: mode === "light" ? "#FFFFFF" : "#333333",
        chatlist: mode === "light" ? "#F3F3F3" : "#444444",
        boxlist: mode === "light" ? "#EDEDED" : "#444444",
        boxchatlist: mode === "light" ? "#EDEDED" : "#333333",
        total: mode === "light" ? "#FFFFFF" : "#1A1A1A",
        messageIcons: mode === "light" ? "#A0A0A0" : "#CCCCCC", // Melhor contraste no dark mode
        inputBackground: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        barraSuperior: mode === "light" ? "linear-gradient(to right, #012489, #012489)" : "#017ACC",
        boxticket: mode === "light" ? "#EDEDED" : "#555555", // Ajuste no dark mode
        campaigntab: mode === "light" ? "#EDEDED" : "#555555",
        mediainput: mode === "light" ? "#EDEDED" : "#1A1A1A",
      },
      mode,
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = Cookies.get("i18nextLng"); // Usando js-cookie para obter o idioma
    const browserLocale = i18nlocale?.substring(0, 2) + i18nlocale?.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  useEffect(() => {
    Cookies.set("preferredTheme", mode); // Usando js-cookie para salvar o tema preferido
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ colorMode }}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SocketContext.Provider value={SocketManager}>
            <Routes />
          </SocketContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
