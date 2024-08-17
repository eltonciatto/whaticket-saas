import React, { useState, useEffect, useCallback } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies.js";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings.js";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    backgroundColor: theme.palette.options,
    borderRadius: 4,
  },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const [companyData, settingsData, userData] = await Promise.all([
        find(companyId),
        getAllSettings(),
        getCurrentUserInfo(),
      ]);

      setCompany(companyData);
      setSchedules(companyData.schedules);
      setSettings(settingsData);
      setCurrentUser(userData);

      const scheduleType = settingsData.find((d) => d.key === "scheduleType");
      if (scheduleType) {
        setSchedulesEnabled(scheduleType.value === "company");
      }
    } catch (e) {
      toast.error(i18n.t("settings.loadError"));
    } finally {
      setLoading(false);
    }
  }, [find, getAllSettings, getCurrentUserInfo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      await updateSchedules({ id: company.id, schedules: data });
      setSchedules(data);
      toast.success(i18n.t("settings.schedulesSuccess"));
    } catch (e) {
      toast.error(i18n.t("settings.schedulesError"));
    } finally {
      setLoading(false);
    }
  };

  const isSuperUser = currentUser.super;

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label="Opções" value={"options"} />
          {schedulesEnabled && <Tab label="Horários" value={"schedules"} />}
          {isSuperUser && <Tab label="Empresas" value={"companies"} />}
          {isSuperUser && <Tab label="Planos" value={"plans"} />}
          {isSuperUser && <Tab label="Ajuda" value={"helps"} />}
        </Tabs>
        <Paper className={classes.paper} elevation={0}>
          <TabPanel value={tab} name="options">
            <Options
              settings={settings}
              scheduleTypeChanged={(value) =>
                setSchedulesEnabled(value === "company")
              }
            />
          </TabPanel>
          {schedulesEnabled && (
            <TabPanel value={tab} name="schedules">
              <SchedulesForm
                loading={loading}
                onSubmit={handleSubmitSchedules}
                initialValues={schedules}
              />
            </TabPanel>
          )}
          {isSuperUser && (
            <>
              <TabPanel value={tab} name="companies">
                <CompaniesManager />
              </TabPanel>
              <TabPanel value={tab} name="plans">
                <PlansManager />
              </TabPanel>
              <TabPanel value={tab} name="helps">
                <HelpsManager />
              </TabPanel>
            </>
          )}
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;
