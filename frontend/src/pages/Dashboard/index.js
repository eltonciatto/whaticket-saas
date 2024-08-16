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
import { Button } from "@material-ui/core";
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
import ForumIcon from "@material-ui/icons/Forum";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";

import { makeStyles } from "@material-ui/core/styles";
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
import moment from "moment";
import { ChatsUser } from "./ChartsUser";
import { ChartsDate } from "./ChartsDate";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  card: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#012489",
    color: "#eee",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filters, setFilters] = useState({
    period: 0,
    filterType: 1,
    dateFrom: moment("1", "D").format("YYYY-MM-DD"),
    dateTo: moment().format("YYYY-MM-DD"),
  });
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    firstLoad();
  }, []);

  async function fetchData() {
    setLoading(true);

    let params = {};
    if (filters.period > 0) {
      params = { days: filters.period };
    }

    if (!isEmpty(filters.dateFrom) && moment(filters.dateFrom).isValid()) {
      params.date_from = moment(filters.dateFrom).format("YYYY-MM-DD");
    }

    if (!isEmpty(filters.dateTo) && moment(filters.dateTo).isValid()) {
      params.date_to = moment(filters.dateTo).format("YYYY-MM-DD");
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);
    setCounters(data.counters);
    setAttendants(isArray(data.attendants) ? data.attendants : []);
    setLoading(false);
  }

  const handleChangePeriod = (value) => {
    setFilters((prev) => ({ ...prev, period: value }));
  };

  const handleChangeFilterType = (value) => {
    setFilters((prev) => ({
      ...prev,
      filterType: value,
      period: value === 1 ? 0 : prev.period,
      dateFrom: value === 1 ? moment("1", "D").format("YYYY-MM-DD") : "",
      dateTo: value === 1 ? moment().format("YYYY-MM-DD") : "",
    }));
  };

  const GetContacts = (all) => {
    const { count } = useContacts({});
    return count;
  };

  const formatTime = (minutes) => {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  };

  const renderFilters = () => {
    return filters.filterType === 1 ? (
      <>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Data Inicial"
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
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
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
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
            value={filters.period}
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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filters.filterType}
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
              onClick={fetchData}
              variant="contained"
              color="primary"
            >
              Filtrar
            </ButtonWithSpinner>
          </Grid>

          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.card} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component="h3" variant="h6" paragraph>
                      Conexões Ativas
                    </Typography>
                    <Typography component="h1" variant="h4">
                      {counters.totalWhatsappSessions}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <MobileFriendlyIcon
                      style={{ fontSize: 100, color: "#fff" }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.card} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component="h3" variant="h6" paragraph>
                      Empresas
                    </Typography>
                    <Typography component="h1" variant="h4">
                      {counters.totalCompanies}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <StoreIcon style={{ fontSize: 100, color: "#fff" }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={4}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Em Conversa
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {counters.supportHappening}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <CallIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Aguardando
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {counters.supportPending}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <HourglassEmptyIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Finalizados
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {counters.supportFinished}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <CheckCircleIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Novos Contatos
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {GetContacts(true)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <GroupAddIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Tempo Médio de Conversa
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {formatTime(counters.avgSupportTime)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <AccessAlarmIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    Tempo Médio de Espera
                  </Typography>
                  <Typography component="h1" variant="h4">
                    {formatTime(counters.avgWaitTime)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <TimerIcon style={{ fontSize: 100, color: "#fff" }} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

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
