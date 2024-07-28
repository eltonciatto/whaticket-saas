import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { versionSystem, nomeEmpresa } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import "../../assets/ReactToastify-BTGsrsBX.css";
import "../../assets/styles-D9tTQ5bH.css";
import "../../assets/background-animation.css";
import logo from "../../assets/sendbot-logo4-500x.png";

const Copyright = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      © Sendbot 2024 - Whaticket v4.8.5
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    position: "relative",
  },
  paper: {
    backgroundColor: theme.palette.login,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "55px 30px",
    borderRadius: "12.5px",
    position: "relative",
    zIndex: 1,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1, 0, 1),
  },
  linkContainer: {
    marginTop: theme.spacing(2),
  },
  logo: {
    width: "80px", // Ajuste o tamanho da logo conforme necessário
    position: "absolute",
    top: "-40px", // Ajuste a posição da logo conforme necessário
    backgroundColor: theme.palette.background.paper,
    borderRadius: "0%",
    padding: theme.spacing(1),
  },
  welcomeText: {
    marginBottom: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();
  const [user, setUser] = useState({ email: "", password: "" });
  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={`${classes.root} animatedBackground`}>
      {Array.from({ length: 19 }, (_, i) => (
        <div key={i} className="line"></div>
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <div key={i + 19} className="energy"></div>
      ))}
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <img src={logo} alt="Whats" className={classes.logo} />
          <Typography variant="h5" className={classes.welcomeText}>
            Bem-vindo ao Sendbot
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={i18n.t("login.form.email")}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              type="password"
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
            />
            <Grid container justifyContent="flex-end">
              <Grid item xs={6} style={{ textAlign: "right" }}>
                <Link
                  component={RouterLink}
                  to="/forgetpsw"
                  variant="body2"
                  color="textSecondary"
                >
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/signup"
              className={classes.submit}
            >
              {i18n.t("login.buttons.register")}
            </Button>
          </form>
          <Box className={classes.linkContainer}>
            <Typography variant="body2" color="textSecondary" align="center">
              Ao continuar, você concorda com os{" "}
              <Link color="textSecondary" href="https://sendbot.co/termos">
                Termos de Serviço
              </Link>{" "}
              e a{" "}
              <Link
                color="textSecondary"
                href="https://sendbot.co/politica-de-privacidade"
              >
                Política de Privacidade
              </Link>
              .
            </Typography>
            <Box mt={2}>
              <Copyright />
            </Box>
          </Box>
        </div>
      </Container>
    </div>
  );
};

export default Login;
