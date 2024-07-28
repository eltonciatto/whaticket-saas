import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { versionSystem, nomeEmpresa } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import "../../assets/ReactToastify-BTGsrsBX.css";
import "../../assets/styles-D9tTQ5bH.css";
import "../../assets/background-animation.css"; // Importe o arquivo CSS da animação
import logo from "../../assets/logo.png";

const useStyles = makeStyles(theme => ({
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
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  powered: {
    color: "white",
  },
  terms: {
    marginTop: theme.spacing(2),
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
          <div>
            <img style={{ margin: "0 auto", width: "100%", marginTop: "-50px" }} src={logo} alt="Whats" />
          </div>
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
                <Link component={RouterLink} to="/forgetpsw" variant="body2">
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
              component={RouterLink}
              to="/signup"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Criar Conta
            </Button>
            <Grid container>
              <Grid item xs className={classes.terms}>
                <Typography variant="body2" color="primary" align="center">
                  Ao continuar, você concorda com os <Link color="primary" href="https://sendbot.co/termos">Termos de Serviço</Link> e a <Link color="primary" href="https://sendbot.co/politica-de-privacidade">Política de Privacidade</Link>.
                </Typography>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>
          <Typography variant="body2" color="primary" align="center">
            © Sendbot 2024 - Whaticket v4.8.5
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
