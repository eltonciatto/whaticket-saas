import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import StarIcon from '@material-ui/icons/StarBorder';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Cookies from 'js-cookie'; // Substituindo localStorage por js-cookie

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

  const { list, finder } = usePlans();
  const { find } = useCompanies();

  const classes = useStyles();
  const [usersPlans, setUsersPlans] = useState(3);
  const [companiesPlans, setCompaniesPlans] = useState(null); // Verifica se está carregando planos
  const [connectionsPlans, setConnectionsPlans] = useState(3);
  const [storagePlans, setStoragePlans] = useState([]);
  const [customValuePlans, setCustomValuePlans] = useState(49.00);
  const [loading, setLoading] = useState(false);
  const companyId = Cookies.get("companyId"); // Usando js-cookie para obter o companyId

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const companiesList = await find(companyId);
        if (companiesList) {
          setCompaniesPlans(companiesList.planId);
          await loadPlans(companiesList.planId);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da empresa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, find]);

  const loadPlans = async (companiesPlans) => {
    setLoading(true);
    try {
      const plansCompanies = await finder(companiesPlans);
      if (plansCompanies) {
        const plans = [{
          title: plansCompanies.name,
          planId: plansCompanies.id,
          price: plansCompanies.value,
          description: [
            `${plansCompanies.users} Usuários`,
            `${plansCompanies.connections} Conexão`,
            `${plansCompanies.queues} Filas`
          ],
          users: plansCompanies.users,
          connections: plansCompanies.connections,
          queues: plansCompanies.queues,
          buttonText: 'SELECIONAR',
          buttonVariant: 'outlined',
        }];
        setStoragePlans(plans);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!storagePlans.length) {
    return <Typography variant="h6" align="center">Nenhum plano disponível no momento.</Typography>;
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
