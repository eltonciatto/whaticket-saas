import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  textRight: {
    textAlign: "right",
  },
  tabPanelsContainer: {
    padding: theme.spacing(2),
  },
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
};

const CampaignsConfig = () => {
  const classes = useStyles();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get("/campaign-settings");
        if (Array.isArray(data) && data.length > 0) {
          const settingsList = data.map((item) => [
            item.key,
            JSON.parse(item.value),
          ]);
          setSettings(Object.fromEntries(settingsList));
        }
      } catch (error) {
        toast.error("Erro ao carregar as configurações.");
      }
    };
    loadSettings();
  }, []);

  const handleOnChangeVariable = (e) => {
    const { name, value } = e.target;
    setVariable((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnChangeSettings = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      const variables = [...prev.variables];
      if (!variables.some((v) => v.key === variable.key)) {
        variables.push({ ...variable });
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    try {
      await api.post("/campaign-settings", { settings });
      toast.success("Configurações salvas");
    } catch (error) {
      toast.error("Erro ao salvar as configurações.");
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Grid container style={{ width: "99.6%" }}>
          <Grid item xs={12}>
            <Title>{i18n.t("campaignsConfig.title")}</Title>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.tabPanelsContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography component="h3">Intervalos</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="messageInterval-label">
                  Intervalo Randômico de Disparo
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label="Intervalo Randômico de Disparo"
                  value={settings.messageInterval}
                  onChange={handleOnChangeSettings}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="longerIntervalAfter-label">
                  Intervalo Maior Após
                </InputLabel>
                <Select
                  name="longerIntervalAfter"
                  id="longerIntervalAfter"
                  labelId="longerIntervalAfter-label"
                  label="Intervalo Maior Após"
                  value={settings.longerIntervalAfter}
                  onChange={handleOnChangeSettings}
                >
                  <MenuItem value={0}>Não definido</MenuItem>
                  <MenuItem value={1}>1 segundo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="greaterInterval-label">
                  Intervalo de Disparo Maior
                </InputLabel>
                <Select
                  name="greaterInterval"
                  id="greaterInterval"
                  labelId="greaterInterval-label"
                  label="Intervalo de Disparo Maior"
                  value={settings.greaterInterval}
                  onChange={handleOnChangeSettings}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={1}>1 segundo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={40}>40 segundos</MenuItem>
                  <MenuItem value={60}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} className={classes.textRight}>
              <Button
                onClick={() => setShowVariablesForm(!showVariablesForm)}
                color="primary"
                style={{ marginRight: 10 }}
              >
                Adicionar Variável
              </Button>
              <Button
                onClick={saveSettings}
                color="primary"
                variant="contained"
              >
                Salvar Configurações
              </Button>
            </Grid>
            {showVariablesForm && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Atalho"
                    variant="outlined"
                    value={variable.key}
                    name="key"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Conteúdo"
                    variant="outlined"
                    value={variable.value}
                    name="value"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} className={classes.textRight}>
                  <Button
                    onClick={() => setShowVariablesForm(!showVariablesForm)}
                    color="primary"
                    style={{ marginRight: 10 }}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={addVariable}
                    color="primary"
                    variant="contained"
                  >
                    Adicionar
                  </Button>
                </Grid>
              </>
            )}
            {settings.variables.length > 0 && (
              <Grid item xs={12} className={classes.textRight}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "1%" }}></TableCell>
                      <TableCell>Atalho</TableCell>
                      <TableCell>Conteúdo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.variables.map((v, k) => (
                      <TableRow key={k}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedKey(v.key);
                              setConfirmationOpen(true);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{"{" + v.key + "}"}</TableCell>
                        <TableCell>{v.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsConfig;
