import React, { useContext, useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import { Button, makeStyles } from "@material-ui/core";
import MobileFriendlyIcon from "@material-ui/icons/MobileFriendly";
import StoreIcon from "@material-ui/icons/Store";
import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray, isEmpty } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import { ChatsUser } from "./ChartsUser";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";

// Função para criar estilos globais
const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

// Função para criar estilos dinamicamente para os cartões
const useCardStyles = (backgroundColor) =>
  makeStyles((theme) => ({
    card: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "auto",
      flexDirection: "column",
      height: "100%",
      backgroundColor: backgroundColor || "#012489",
      color: "#eee",
    },
  }));

const Dashboard = () => {
  const classes = useStyles(); // Agora o uso de `useStyles` está correto
  const classesCard = useCardStyles("#012489")();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const { user } = useContext(AuthContext);
  const [queueTicket, setQueueTicket] = useState(false);

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);
    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }
    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetContacts = () => {
    const { count } = useContacts({});
    return count;
  };

  const renderFilters = () => {
    return filterType === 1 ? (
      <>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Data Inicial"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={classes.fullWidth}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Data Final"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={classes.fullWidth}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </>
    ) : (
      <Grid item xs={12} sm={6} md={4}>
        <FormControl className={classes.selectContainer}>
          <InputLabel id="period-selector-label">Período</InputLabel>
          <Select
            labelId="period-selector-label"
            id="period-selector"
            value={period}
            onChange={(e) => handleChangePeriod(e.target.value)}
          >
            <MenuItem value={0}>Nenhum selecionado</MenuItem>
            <MenuItem value={3}>Últimos 3 dias</MenuItem>
            <MenuItem value={7}>Últimos 7 dias</MenuItem>
            <MenuItem value={15}>Últimos 15 dias</MenuItem>
            <MenuItem value={30}>Últimos 30 dias</MenuItem>
            <MenuItem value={60}>Últimos 60 dias</MenuItem>
            <MenuItem value={90}>Últimos 90 dias</MenuItem>
          </Select>
          <FormHelperText>Selecione o período desejado</FormHelperText>
        </FormControl>
      </Grid>
    );
  };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">
          {/* Código para renderizar os filtros e os cartões */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>
          {renderFilters()}
          <Grid item xs={12} className={classes.alignRight}>
            <ButtonWithSpinner
              loading={loading}
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              Filtrar
            </ButtonWithSpinner>
          </Grid>

          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classesCard.card} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component="h3" variant="h6" paragraph>
                      Conexões Ativas
                    </Typography>
                    <Grid item>
                      <Typography component="h1" variant="h4">
                        {counters.totalWhatsappSessions}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <MobileFriendlyIcon style={{ fontSize: 100, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classesCard.card} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component="h3" variant="h6" paragraph>
                      Empresas
                    </Typography>
                    <Grid item>
                      <Typography component="h1" variant="h4">
                        {counters.totalCompanies}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <StoreIcon style={{ fontSize: 100, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Em Atendimento */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={4}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Em Conversa
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportHappening}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={2}>
                  <CallIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Aguardando */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Aguardando
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportPending}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <HourglassEmptyIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Finalizados */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Finalizados
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportFinished}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <CheckCircleIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Novos Contatos */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Novos Contatos
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {GetContacts(true)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <GroupAddIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tempo Médio de Atendimento */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    T.M. de Conversa
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {formatTime(counters.avgSupportTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <AccessAlarmIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tempo Médio de Espera */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classesCard.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    T.M. de Espera
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {formatTime(counters.avgWaitTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <TimerIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Usuários Online */}
          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          {/* Total de Atendimentos por Usuário */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

          {/* Total de Atendimentos */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChartsDate />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
