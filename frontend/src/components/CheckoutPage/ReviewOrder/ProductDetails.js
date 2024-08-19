import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import useStyles from './styles';

function ProductDetails({ products }) {
  const classes = useStyles();

  // Calcula o total dos produtos com segurança
  const total = products.reduce((acc, product) => {
    const price = Number(product.price) || 0; // Garante que o preço seja numérico
    return acc + price;
  }, 0);

  return (
    <List disablePadding>
      {products.map((product, index) => (
        <ListItem className={classes.listItem} key={index}>
          <ListItemText primary={product.name || "Produto sem nome"} secondary={product.desc || "Sem descrição"} />
          <Typography variant="body2">
            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
        </ListItem>
      ))}
      <ListItem className={classes.listItem}>
        <ListItemText primary="Total" />
        <Typography variant="subtitle1" className={classes.total}>
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Typography>
      </ListItem>
    </List>
  );
}

export default ProductDetails;
