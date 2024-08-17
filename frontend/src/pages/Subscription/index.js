import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import SubscriptionModal from "../../components/SubscriptionModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Subscription = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenContactModal = () => {
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const formatDateDifference = (date) => {
    if (!date) return "Data inválida";
    const parsedDate = parseISO(date);
    return formatDistanceToNowStrict(parsedDate, { locale: ptBR });
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
      />

      <MainHeader>
        <Title>Assinatura</Title>
      </MainHeader>
      <Grid item xs={12} sm={6}>
        <Paper
          className={classes.mainPaper}
          variant="outlined"
        >
          <div>
            <TextField
              label="Período de teste"
              defaultValue={`Seu período de teste termina em ${formatDateDifference(user?.company?.trialExpiration)}.`}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </div>

          <div>
            <TextField
              label="Email de cobrança"
              defaultValue={user?.company?.email}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </div>

          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenContactModal}
              fullWidth
            >
              Assine Agora!
            </Button>
          </div>
        </Paper>
      </Grid>
    </MainContainer>
  );
};

export default Subscription;
