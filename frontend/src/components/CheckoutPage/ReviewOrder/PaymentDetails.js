import React, { useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';
import { AuthContext } from "../../../context/Auth/AuthContext";

function PaymentDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { firstName, address2, city, zipcode, state, country, plan } = formValues;
  const { user } = useContext(AuthContext);

  // Garantindo que o JSON seja parseado corretamente e lidando com possíveis erros
  let parsedPlan = { price: 0 };
  try {
    parsedPlan = plan ? JSON.parse(plan) : { price: 0 };
  } catch (error) {
    console.error("Erro ao parsear o plano:", error);
  }
  const { price } = parsedPlan;

  return (
    <Grid item container direction="column" xs={12} sm={6}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        Informação de pagamento
      </Typography>
      <Grid container>
        <Grid item xs={6}>
          <Typography gutterBottom>Email:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography gutterBottom>{user?.company?.email || "Email não disponível"}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography gutterBottom>Nome:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography gutterBottom>{firstName || "Nome não disponível"}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography gutterBottom>Endereço:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography gutterBottom>
            {address2 || "Endereço não disponível"}, {city || "Cidade não disponível"} - {state || "Estado não disponível"} {zipcode || "CEP não disponível"} {country || "País não disponível"}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography gutterBottom>Total:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography gutterBottom>R${price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default PaymentDetails;
