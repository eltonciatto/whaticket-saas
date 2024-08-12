import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { SocketContext, SocketManager } from './context/Socket/SocketContext';

import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

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
                    width: '8px',
                    height: '8px',
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    backgroundColor: "#012489",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "#012489" : "#333333",
                },
            },
            palette: {
                type: mode,
                primary: { main: mode === "light" ? "#012489" : "#FFFFFF" },
        textPrimary: mode === "light" ? "#012489" : "#FFFFFF",
        borderPrimary: mode === "light" ? "#012489" : "#FFFFFF",
        dark: { main: mode === "light" ? "#1C1C1C" : "#D1D5DB" },
        light: { main: mode === "light" ? "#F3F4F6" : "#1C1C1C" },
        tabHeaderBackground: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        optionsBackground: mode === "light" ? "#F9FAFB" : "#2C2C2C",
        options: mode === "light" ? "#012489" : "#FFFFFF",
        fontecor: mode === "light" ? "#012489" : "#FFFFFF",
        fancyBackground: mode === "light" ? "#F9FAFB" : "#2C2C2C",
        bordabox: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        newmessagebox: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        inputdigita: mode === "light" ? "#FFFFFF" : "#2C2C2C",
        contactdrawer: mode === "light" ? "#FFFFFF" : "#2C2C2C",
        announcements: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        login: mode === "light" ? "#FFFFFF" : "#1C1C1C",
        announcementspopover: mode === "light" ? "#FFFFFF" : "#2C2C2C",
        chatlist: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        boxlist: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        boxchatlist: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        total: mode === "light" ? "#FFFFFF" : "#1C1C1C",
        messageIcons: mode === "light" ? "#6B7280" : "#D1D5DB",
        inputBackground: mode === "light" ? "#FFFFFF" : "#2C2C2C",
        barraSuperior: mode === "light" ? "linear-gradient(to right, #012489, #012489, #012489)" : "#2C2C2C",
        boxticket: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        campaigntab: mode === "light" ? "#E5E7EB" : "#2C2C2C",
        mediainput: mode === "light" ? "#E5E7EB" : "#1C1C1C",
            },
            mode,
        },
        locale
    );
    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale =
            i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

        if (browserLocale === "ptBR") {
            setLocale(ptBR);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
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
