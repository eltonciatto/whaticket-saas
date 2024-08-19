import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Cookies from 'js-cookie'; // Usando js-cookie

import usePlans from "../../../hooks/usePlans";
import useCompanies from "../../../hooks/useCompanies";

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  customCard: {
    display: "flex",
    marginTop: "16px",
    alignItems: "center",
    flexDirection: "column",
  },
}));

export default function Pricing(props) {
  const {
    setFieldValue,
    setActiveStep,
    activeStep,
  } = props;

  const { list } = usePlans();
  const { find } = useCompanies();

  const classes = useStyles();
  const [storagePlans, setStoragePlans] = useState(() => {
    const savedPlans = Cookies.get("storagePlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [loading, setLoading] = useState(false);
  const companyId = Cookies.get("companyId");
  const [dataCarregada, setDataCarregada] = useState(false);

  useEffect(() => {
    if (dataCarregada) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Carregando dados da empresa com ID:", companyId);
        const plans = await list(); // Buscando todos os planos disponíveis
        if (plans && plans.length > 0) {
          const formattedPlans = plans.map(plan => ({
            title: plan.name,
            planId: plan.id,
            price: plan.value,
            description: [
              `${plan.users} Usuários`,
              `${plan.connections} Conexão`,
              `${plan.queues} Filas`
            ],
            users: plan.users,
            connections: plan.connections,
            queues: plan.queues,
            buttonText: 'SELECIONAR',
            buttonVariant: 'outlined',
          }));

          // Armazenando os planos no cookie
          Cookies.set("storagePlans", JSON.stringify(formattedPlans), { expires: 1 });
          setStoragePlans(formattedPlans);
        } else {
          console.error("Erro: Nenhum plano encontrado.");
        }
      } catch (error) {
        console.error("Erro ao carregar os planos:", error);
      } finally {
        setLoading(false);
        setDataCarregada(true);
      }
    };

    fetchData();
  }, [companyId, list, dataCarregada]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <CircularProgress />
        <Typography variant="h6">Carregando planos...</Typography>
      </div>
    );
  }

  if (!storagePlans.length) {
    return (
      <Typography variant="h6" align="center" color="error">
        Nenhum plano disponível no momento. Entre em contato com o suporte.
      </Typography>
    );
  }

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        {storagePlans.map((tier) => (
          <Grid item key={tier.title} xs={12} sm={12} md={12}>
            <Card>
              <CardHeader
                title={tier.title}
                titleTypographyProps={{ align: 'center' }}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    R${tier.price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mês
                  </Typography>
                </div>
                <ul>
                  {tier.description.map((line) => (
                    <Typography component="li" variant="subtitle1" align="center" key={line}>
                      {line}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color="primary"
                  onClick={() => {
                    setFieldValue("plan", JSON.stringify(tier));
                    setActiveStep(activeStep + 1);
                  }}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
}
