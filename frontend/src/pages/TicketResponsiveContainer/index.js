import React from "react";
import { useMediaQuery, useTheme } from "@material-ui/core";

import Tickets from "../TicketsCustom";
import TicketAdvanced from "../TicketsAdvanced";

function TicketResponsiveContainer() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return isDesktop ? <Tickets /> : <TicketAdvanced />;
}

export default TicketResponsiveContainer;
