import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, CssBaseline, TextField, Link, Grid, Typography, Container, Box } from "@material-ui/core"; // Adicionei o Box aqui
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
    <Typography variant="body2" color="primary" align="center">
      {"Copyright "}
      <Link color="primary" href="#">
        {nomeEmpresa} - v {versionSystem}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

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
            <img style={{ margin: "0 auto", width: "100%" }} src={logo} alt="Whats" />
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
            >
              {i18n.t("login.form.submit")}
            </Button>
          </form>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );
};

export default Login;
