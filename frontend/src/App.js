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
            backgroundColor: "#075E54",
        },
    },
    scrollbarStylesSoft: {
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: mode === "light" ? "#E0E0E0" : "#404040",
        },
    },
    palette: {
        type: mode,
        primary: { main: mode === "light" ? "#25D366" : "#128C7E" },
        textPrimary: mode === "light" ? "#075E54" : "#ECECEC",
        borderPrimary: mode === "light" ? "#25D366" : "#128C7E" },
        dark: { main: mode === "light" ? "#075E54" : "#ECECEC" },
        light: { main: mode === "light" ? "#ECECEC" : "#075E54" },
        tabHeaderBackground: mode === "light" ? "#F0F0F0" : "#404040",
        optionsBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",
        options: mode === "light" ? "#075E54" : "#ECECEC",
        fontecor: mode === "light" ? "#128C7E" : "#ECECEC",
        fancyBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",
        bordabox: mode === "light" ? "#DADADA" : "#404040",
        newmessagebox: mode === "light" ? "#ECECEC" : "#404040",
        inputdigita: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        contactdrawer: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        announcements: mode === "light" ? "#ECECEC" : "#404040",
        login: mode === "light" ? "#FFFFFF" : "#1C1C1C",
        announcementspopover: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        chatlist: mode === "light" ? "#ECECEC" : "#404040",
        boxlist: mode === "light" ? "#ECECEC" : "#404040",
        boxchatlist: mode === "light" ? "#ECECEC" : "#2D2D2D",
        total: mode === "light" ? "#FFFFFF" : "#1C1C1C",
        messageIcons: mode === "light" ? "#B3B3B3" : "#ECECEC",
        inputBackground: mode === "light" ? "#FFFFFF" : "#2D2D2D",
        barraSuperior: mode === "light" ? "linear-gradient(to right, #25D366, #128C7E)" : "#2D2D2D",
        boxticket: mode === "light" ? "#ECECEC" : "#404040",
        campaigntab: mode === "light" ? "#ECECEC" : "#404040",
        mediainput: mode === "light" ? "#ECECEC" : "#1C1C1C",
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
