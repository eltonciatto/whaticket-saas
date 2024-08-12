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
            backgroundColor: "#075E54",  // Verde escuro, evocando a identidade visual do WhatsApp
        },
    },
    scrollbarStylesSoft: {
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: mode === "light" ? "#E0E0E0" : "#404040",  // Tons neutros, cinza claro e escuro
        },
    },
    palette: {
        type: mode,
        primary: { main: mode === "light" ? "#25D366" : "#128C7E" },  // Verdes icônicos do WhatsApp, claro e escuro
        textPrimary: mode === "light" ? "#075E54" : "#ECECEC",  // Texto em verde escuro no modo claro e cinza claro no modo escuro
        borderPrimary: mode === "light" ? "#25D366" : "#128C7E",  // Verde claro e escuro para bordas
        dark: { main: mode === "light" ? "#075E54" : "#ECECEC" },  // Verde escuro e cinza claro
        light: { main: mode === "light" ? "#ECECEC" : "#075E54" },  // Cinza claro e verde escuro
        tabHeaderBackground: mode === "light" ? "#F0F0F0" : "#404040",  // Cinza claro e cinza escuro
        optionsBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",  // Tons suaves e profissionais
        options: mode === "light" ? "#075E54" : "#ECECEC",  // Texto em verde escuro e cinza claro
        fontecor: mode === "light" ? "#128C7E" : "#ECECEC",  // Verde médio e cinza claro para texto
        fancyBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",  // Fundo em tons suaves
        bordabox: mode === "light" ? "#DADADA" : "#404040",  // Cinza neutro
        newmessagebox: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        inputdigita: mode === "light" ? "#FFFFFF" : "#2D2D2D",  // Branco e cinza escuro
        contactdrawer: mode === "light" ? "#FFFFFF" : "#2D2D2D",  // Branco e cinza escuro
        announcements: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        login: mode === "light" ? "#FFFFFF" : "#1C1C1C",  // Branco e preto para login
        announcementspopover: mode === "light" ? "#FFFFFF" : "#2D2D2D",  // Branco e cinza escuro
        chatlist: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        boxlist: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        boxchatlist: mode === "light" ? "#ECECEC" : "#2D2D2D",  // Cinza claro e cinza escuro
        total: mode === "light" ? "#FFFFFF" : "#1C1C1C",  // Branco e preto
        messageIcons: mode === "light" ? "#B3B3B3" : "#ECECEC",  // Cinza médio e cinza claro
        inputBackground: mode === "light" ? "#FFFFFF" : "#2D2D2D",  // Branco e cinza escuro
        barraSuperior: mode === "light" ? "linear-gradient(to right, #25D366, #128C7E)" : "#2D2D2D",  // Verde gradiente e cinza escuro
        boxticket: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        campaigntab: mode === "light" ? "#ECECEC" : "#404040",  // Cinza claro e cinza escuro
        mediainput: mode === "light" ? "#ECECEC" : "#1C1C1C",  // Cinza claro e preto
    },
    mode,
}

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
