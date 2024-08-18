import React from 'react';
import { useFormikContext } from 'formik';
import { Typography, Grid } from '@material-ui/core';
import ShippingDetails from './ShippingDetails';
import PaymentDetails from './PaymentDetails';

export default function ReviewOrder() {
  const { values: formValues } = useFormikContext();

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Resumo da assinatura
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ShippingDetails formValues={formValues} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PaymentDetails formValues={formValues} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
