import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import useStyles from './styles';

function ProductDetails({ products }) {
  const classes = useStyles();

  // Calcula o total dos produtos
  const total = products.reduce((acc, product) => acc + parseFloat(product.price.replace('$', '')), 0);

  return (
    <List disablePadding>
      {products.map((product, index) => (
        <ListItem className={classes.listItem} key={index}>
          <ListItemText primary={product.name} secondary={product.desc} />
          <Typography variant="body2">
            {parseFloat(product.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </Typography>
        </ListItem>
      ))}
      <ListItem className={classes.listItem}>
        <ListItemText primary="Total" />
        <Typography variant="subtitle1" className={classes.total}>
          {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </Typography>
      </ListItem>
    </List>
  );
}

export default ProductDetails;
