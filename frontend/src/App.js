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

primary: { main: mode === "light" ? "#012489" : "#4A90E2" },
textPrimary: mode === "light" ? "#012489" : "#FFFFFF",
borderPrimary: mode === "light" ? "#012489" : "#4A90E2",
dark: { main: mode === "light" ? "#1A1A1A" : "#E0E0E0" },
light: { main: mode === "light" ? "#F3F3F3" : "#1A1A1A" },
tabHeaderBackground: mode === "light" ? "#E5E5E5" : "#333333",
optionsBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",
options: mode === "light" ? "#012489" : "#4A90E2",
fontecor: mode === "light" ? "#012489" : "#FFFFFF",
fancyBackground: mode === "light" ? "#F7F7F7" : "#2D2D2D",
bordabox: mode === "light" ? "#E0E0E0" : "#444444",
newmessagebox: mode === "light" ? "#F3F3F3" : "#444444",
inputdigita: mode === "light" ? "#FFFFFF" : "#333333",
contactdrawer: mode === "light" ? "#FFFFFF" : "#333333",
announcements: mode === "light" ? "#EDEDED" : "#444444",
login: mode === "light" ? "#FFFFFF" : "#1A1A1A",
announcementspopover: mode === "light" ? "#FFFFFF" : "#2D2D2D",
chatlist: mode === "light" ? "#F3F3F3" : "#444444",
boxlist: mode === "light" ? "#EDEDED" : "#444444",
boxchatlist: mode === "light" ? "#EDEDED" : "#333333",
total: mode === "light" ? "#FFFFFF" : "#1A1A1A",
messageIcons: mode === "light" ? "#A0A0A0" : "#E0E0E0",
inputBackground: mode === "light" ? "#FFFFFF" : "#2D2D2D",
barraSuperior: mode === "light" ? "linear-gradient(to right, #012489, #012489)" : "#4A90E2",
boxticket: mode === "light" ? "#EDEDED" : "#444444",
campaigntab: mode === "light" ? "#EDEDED" : "#444444",
mediainput: mode === "light" ? "#EDEDED" : "#1A1A1A",


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
