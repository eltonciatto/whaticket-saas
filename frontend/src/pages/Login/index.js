import React, { useState, useContext, useCallback } from "react";
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
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import "../../assets/background-animation.css";
import logo from "../../assets/sendbot-logo4-500x.png";

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
    width: "80px",
    position: "absolute",
    top: "-40px",
    padding: theme.spacing(1),
  },
  welcomeText: {
    marginBottom: theme.spacing(2),
  },
  rightAlign: {
    textAlign: "right",
  },
}));

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    © Sendbot 2024 - Whaticket
  </Typography>
);

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChangeInput = useCallback(
    (e) => {
      setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [setUser]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleLogin(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${classes.root} animatedBackground`}>
      {Array.from({ length: 38 }, (_, i) => (
        <div key={i} className={i < 19 ? "line" : "energy"}></div>
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
              <Grid item xs={6} className={classes.rightAlign}>
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
              disabled={loading}
            >
              {loading ? "Carregando..." : i18n.t("login.buttons.submit")}
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
                Termos
              </Link>{" "}
              e a{" "}
              <Link
                color="textSecondary"
                href="https://sendbot.co/politica-de-privacidade"
              >
                Política
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
