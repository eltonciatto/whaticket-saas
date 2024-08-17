import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Button, CircularProgress, Grid, TextField, Typography } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import axios from "axios";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100,
  },
  elementMargin: {
    padding: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right",
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getPlanCompany } = usePlans();

  const [file, setFile] = useState(null);

  useEffect(() => {
    const verifyPlanAccess = async () => {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Redirecionando...");
        setTimeout(() => {
          history.push("/");
        }, 1000);
      }
    };
    verifyPlanAccess();
  }, [getPlanCompany, history]);

  const getEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send";

  const handleSendTextMessage = useCallback(async (values, actions) => {
    const { token, number, body } = values;
    try {
      await axios.post(
        getEndpoint(),
        { number, body },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Mensagem enviada com sucesso");
      actions.resetForm();
    } catch (err) {
      toastError(err);
    } finally {
      actions.setSubmitting(false);
    }
  }, []);

  const handleSendMediaMessage = useCallback(async (values, actions) => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo para enviar.");
      return;
    }

    const data = new FormData();
    data.append("number", values.number);
    data.append("body", file.name);
    data.append("medias", file);

    try {
      await axios.post(getEndpoint(), data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${values.token}`,
        },
      });
      toast.success("Mensagem enviada com sucesso");
      actions.resetForm();
      setFile(null); // Limpa o arquivo após o envio
    } catch (err) {
      toastError(err);
    } finally {
      actions.setSubmitting(false);
    }
  }, [file]);

  const renderFormMessageText = () => (
    <Formik
      initialValues={{ token: "", number: "", body: "" }}
      onSubmit={handleSendTextMessage}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.token")}
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.textMessage.body")}
                name="body"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button type="submit" color="primary" variant="contained">
                {isSubmitting ? <CircularProgress size={24} /> : "Enviar"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  const renderFormMessageMedia = () => (
    <Formik
      initialValues={{ token: "", number: "" }}
      onSubmit={handleSendMediaMessage}
    >
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.token")}
                name="token"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label={i18n.t("messagesAPI.mediaMessage.number")}
                name="number"
                variant="outlined"
                margin="dense"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                name="medias"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button type="submit" color="primary" variant="contained">
                {isSubmitting ? <CircularProgress size={24} /> : "Enviar"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Typography variant="h5">Documentação para envio de mensagens</Typography>
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        Métodos de Envio
      </Typography>
      <Typography component="div">
        <ol>
          <li>Mensagens de Texto</li>
          <li>Mensagens de Mídia</li>
        </ol>
      </Typography>
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        Instruções
      </Typography>
      <Typography className={classes.elementMargin} component="div">
        <b>Observações importantes:</b>
        <ul>
          <li>
            Antes de enviar mensagens, é necessário o cadastro do token vinculado à conexão que enviará as mensagens.
            Acesse o menu "Conexões" e insira o token no campo apropriado.
          </li>
          <li>
            O número deve ser informado sem máscara ou caracteres especiais, composto por:
            <ul>
              <li>Código do país</li>
              <li>DDD</li>
              <li>Número</li>
            </ul>
          </li>
        </ul>
      </Typography>
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        1. Mensagens de Texto
      </Typography>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <p>Informações necessárias para envio das mensagens de texto:</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization (Bearer token) e Content-Type (application/json) <br />
            <b>Body: </b> {"{ \"number\": \"595985523065\", \"body\": \"Sua mensagem\" }"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de Envio</b>
          </Typography>
          {renderFormMessageText()}
        </Grid>
      </Grid>
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        2. Mensagens de Mídia
      </Typography>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <p>Informações necessárias para envio das mensagens de mídia:</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization (Bearer token) e Content-Type (multipart/form-data) <br />
            <b>FormData: </b> <br />
            <ul>
              <li>
                <b>number: </b> 5599999999999
              </li>
              <li>
                <b>medias: </b> arquivo
              </li>
            </ul>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de Envio</b>
          </Typography>
          {renderFormMessageMedia()}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MessagesAPI;
