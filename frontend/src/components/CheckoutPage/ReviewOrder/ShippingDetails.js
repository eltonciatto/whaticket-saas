import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';

function ShippingDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { plan } = formValues;

  // Parse seguro do JSON com fallback
  let newPlan;
  try {
    newPlan = plan ? JSON.parse(plan) : {};
  } catch (error) {
    console.error("Erro ao parsear o plano:", error);
    newPlan = {};
  }

  // Definindo valores padrão para evitar undefined
  const { users = 0, connections = 0, price = 0 } = newPlan;

  return (
    <Grid item xs={12} sm={12}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        Detalhes do plano
      </Typography>
      <Typography gutterBottom>Usuários: {users}</Typography>
      <Typography gutterBottom>Whatsapps: {connections}</Typography>
      <Typography gutterBottom>Cobrança: Mensal</Typography>
      <Typography gutterBottom>Total: R${price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</Typography>
    </Grid>
  );
}

export default ShippingDetails;
