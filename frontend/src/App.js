import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
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
  const preferredTheme = Cookies.get("preferredTheme");
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
          backgroundColor: mode === "light" ? "#012489" : "#444444",
        },
      },
      palette: {
        type: mode,
        primary: { main: mode === "light" ? "#012489" : "#90caf9" },
        background: {
          default: mode === "light" ? "#f4f6f8" : "#121212",
          paper: mode === "light" ? "#ffffff" : "#1e1e1e",
        },
        text: {
          primary: mode === "light" ? "#012489" : "#ffffff",
          secondary: mode === "light" ? "#555555" : "#cccccc",
        },
        divider: mode === "light" ? "#dddddd" : "#333333",
      },
      typography: {
        allVariants: {
          color: mode === "light" ? "#012489" : "#e0e0e0",
        },
      },
      overrides: {
        MuiPaper: {
          root: {
            backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        MuiAppBar: {
          colorPrimary: {
            backgroundColor: mode === "light" ? "#012489" : "#333333",
          },
        },
        MuiButton: {
          containedPrimary: {
            backgroundColor: mode === "light" ? "#012489" : "#90caf9",
            color: mode === "light" ? "#ffffff" : "#121212",
          },
        },
      },
      mode,
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = Cookies.get("i18nextLng");
    const browserLocale = i18nlocale?.substring(0, 2) + i18nlocale?.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  useEffect(() => {
    Cookies.set("preferredTheme", mode);
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
