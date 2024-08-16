import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Grid,
  Typography,
  Container,
  makeStyles,
} from "@material-ui/core";
import StoreIcon from "@material-ui/icons/Store";
import { i18n } from "../../translate/i18n";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
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
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const FormCompany = () => {
  const classes = useStyles();
  const { getPlanList } = usePlans();
  const { save: saveCompany } = useCompanies();
  const [company, setCompany] = useState({ name: "", planId: "", token: "" });
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await getPlanList();
        setPlans(list);
      } catch (error) {
        toastError(error);
      }
    };
    fetchData();
  }, [getPlanList]);

  const handleChangeInput = (e) => {
    setCompany((prevCompany) => ({
      ...prevCompany,
      [e.target.name]: e.target.value,
    }));
  };

  const isPlanSelected = useMemo(() => company.planId !== "", [company.planId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveCompany(company);
      setCompany({ name: "", planId: "", token: "" });
      toast.success(i18n.t("companies.form.success"));
    } catch (error) {
      toastError(error);
    }
  };

  const renderPlanField = useCallback(
    () => (
      <Grid item>
        <FormControl fullWidth variant="outlined" required>
          <InputLabel>{i18n.t("companies.form.plan")}</InputLabel>
          <Select
            id="planId"
            name="planId"
            value={company.planId}
            onChange={handleChangeInput}
            label={i18n.t("companies.form.plan")}
          >
            <MenuItem value="">
              <em>Selecione um plano</em>
            </MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    ),
    [company.planId, plans]
  );

  const renderNameAndTokenFields = useMemo(
    () =>
      isPlanSelected && (
        <>
          <Grid item>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="name"
              label={i18n.t("companies.form.name")}
              name="name"
              value={company.name}
              onChange={handleChangeInput}
              autoComplete="name"
              autoFocus
            />
          </Grid>
          <Grid item>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="token"
              label={i18n.t("companies.form.token")}
              name="token"
              value={company.token}
              onChange={handleChangeInput}
              autoComplete="token"
            />
          </Grid>
        </>
      ),
    [company.name, company.token, handleChangeInput, isPlanSelected]
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <StoreIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {i18n.t("companies.title")}
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <Grid container direction="column" spacing={2}>
            {renderPlanField()}
            {renderNameAndTokenFields}
          </Grid>
          {isPlanSelected && (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {i18n.t("companies.form.submit")}
            </Button>
          )}
        </form>
      </div>
    </Container>
  );
};

export default FormCompany;
