import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const generateChartData = (tickets) => {
  // Inicializa o array com as horas do dia
  const hours = Array.from({ length: 24 }, (_, index) => ({
    time: `${String(index).padStart(2, "0")}:00`,
    amount: 0,
  }));

  // Processa os tickets para calcular a quantidade por hora
  tickets.forEach((ticket) => {
    const hour = format(startOfHour(parseISO(ticket.createdAt)), "HH:00");
    const hourData = hours.find((h) => h.time === hour);
    if (hourData) {
      hourData.amount++;
    }
  });

  return hours;
};

const Chart = ({ queueTicket }) => {
  const theme = useTheme();

  const { tickets, count } = useTickets({
    queueIds: queueTicket ? `[${queueTicket}]` : "[]",
  });

  // UseMemo para evitar recalcular o gráfico se os tickets não mudarem
  const chartData = useMemo(() => generateChartData(tickets), [tickets]);

  return (
    <React.Fragment>
      <Title>{`Atendimentos Criados: ${count}`}</Title>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          width={730}
          height={250}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
          >
            <Tooltip />
            <Legend />
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: "middle",
                fill: theme.palette.text.primary,
              }}
            >
              Tickets
            </Label>
          </YAxis>
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default Chart;
