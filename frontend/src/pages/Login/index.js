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
import "../../assets/background-animation.css"; // Importe o arquivo CSS da animação
import logo from "../../assets/logo.png";

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
    background:
      "url(../../assets/background.png) no-repeat center center fixed",
    backgroundSize: "cover",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 30px",
    borderRadius: "12.5px",
    position: "relative",
    zIndex: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(2, 0, 1),
  },
  logoContainer: {
    position: "absolute",
    top: "-40px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80px",
    height: "80px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: theme.shadows[3],
    zIndex: 2,
  },
  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
  },
  text: {
    color: theme.palette.text.secondary,
  },
  footerText: {
    marginTop: theme.spacing(3),
  },
  linkText: {
    color: theme.palette.text.secondary,
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
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.logoContainer}>
          <img src={logo} alt="Logo" className={classes.logo} />
        </div>
        <div className={classes.paper}>
          <Typography component="h1" variant="h5" className={classes.text}>
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
                  className={classes.text}
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
              Criar Conta
            </Button>
          </form>
          <Box mt={3}>
            <Typography variant="body2" className={classes.text} align="center">
              Ao continuar, você concorda com os{" "}
              <Link
                className={classes.linkText}
                href="https://sendbot.co/termos"
              >
                Termos de Serviço
              </Link>{" "}
              e a{" "}
              <Link
                className={classes.linkText}
                href="https://sendbot.co/politica-de-privacidade"
              >
                Política de Privacidade
              </Link>
              .
            </Typography>
            <Box mt={2} className={classes.footerText}>
              <Copyright />
            </Box>
          </Box>
        </div>
      </Container>
    </div>
  );
};

export default Login;
