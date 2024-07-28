import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import {
  Avatar, Button, CssBaseline, TextField, Link, Grid, Box, 
  FormControl, InputLabel, MenuItem, Select, Typography, Container
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { makeStyles } from "@material-ui/core/styles";
import InputMask from 'react-input-mask';
import logo from "../../assets/logo.png";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";

// Component for displaying copyright information
const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="#">
      PLW
    </Link>{" "}
    {new Date().getFullYear()}
    {"."}
  </Typography>
);

// Custom styles
const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

// Form validation schema
const UserSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const [plans, setPlans] = useState([]);
  const { list: listPlans } = usePlans();
  const dueDate = moment().add(3, "day").format();
  const params = qs.parse(window.location.search);
  const companyId = params.companyId || null;

  const initialState = { name: "", email: "", phone: "", password: "", planId: "" };

  // Fetch plans on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await listPlans();
        setPlans(list);
      } catch (error) {
        toastError(error);
      }
    };
    fetchData();
  }, [listPlans]);

  // Handle form submission
  const handleSignUp = async values => {
    try {
      await openApi.post("/companies/cadastro", {
        ...values,
        recurrence: "MENSAL",
        dueDate,
        status: "t",
        campaignsEnabled: true,
      });
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      console.error(err);
      toastError(err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <img style={{ margin: "0 auto", height: "80px", width: "100%" }} src={logo} alt="Whats" />
        <Formik
          initialValues={initialState}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSignUp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    autoComplete="name"
                    name="name"
                    variant="outlined"
                    fullWidth
                    id="name"
                    label="Nome da Empresa"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="email"
                    label={i18n.t("signup.form.email")}
                    name="email"
                    autoComplete="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={InputMask}
                    mask="(99) 99999-9999"
                    variant="outlined"
                    fullWidth
                    id="phone"
                    name="phone"
                    autoComplete="phone"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  >
                    {({ field }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        fullWidth
                        label="DDD988888888"
                        inputProps={{ maxLength: 11 }}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    name="password"
                    label={i18n.t("signup.form.password")}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                    <Field
                      as={Select}
                      id="plan-selection"
                      name="planId"
                      label="Plano"
                    >
                      {plans.map(plan => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {i18n.t("signup.buttons.submit")}
              </Button>
              <Grid container justify="flex-end">
                <Grid item>
                  <Link variant="body2" component={RouterLink} to="/login">
                    {i18n.t("signup.buttons.login")}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignUp;
