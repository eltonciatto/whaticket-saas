import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Stack, TextField } from '@mui/material';
import Typography from "@material-ui/core/Typography";
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'; // Importando o js-cookie
import './button.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            display: false,
        },
        title: {
            display: true,
            text: 'Gráfico de Conversas por Usuário',
            position: 'left',
        },
        datalabels: {
            display: true,
            anchor: 'start',
            offset: -30,
            align: "start",
            color: "#fff",
            textStrokeColor: "#000",
            textStrokeWidth: 2,
            font: {
                size: 20,
                weight: "bold"
            },
        }
    },
};

export const ChatsUser = () => {
    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [] });

    const companyId = Cookies.get("companyId"); // Usando js-cookie para obter o companyId

    const handleGetTicketsInformation = useCallback(async () => {
        if (initialDate > finalDate) {
            toast.error("A data inicial não pode ser maior que a data final");
            return;
        }
        try {
            const { data } = await api.get(`/dashboard/ticketsUsers`, {
                params: {
                    initialDate: format(initialDate, 'yyyy-MM-dd'),
                    finalDate: format(finalDate, 'yyyy-MM-dd'),
                    companyId
                }
            });
            setTicketsData(data);
        } catch (error) {
            toast.error('Erro ao obter informações das conversas');
        }
    }, [initialDate, finalDate, companyId]);

    useEffect(() => {
        handleGetTicketsInformation();
    }, [handleGetTicketsInformation]);

    const dataCharts = useMemo(() => ({
        labels: ticketsData.data.map(item => item.nome),
        datasets: [
            {
                data: ticketsData.data.map(item => item.quantidade),
                backgroundColor: '#2DDD7F',
            },
        ],
    }), [ticketsData]);

    return (
        <>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Total de Conversas por Usuário
            </Typography>

            <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ my: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={initialDate}
                        onChange={setInitialDate}
                        label="Início"
                        renderInput={(params) => <TextField {...params} sx={{ width: '20ch' }} />}
                    />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={finalDate}
                        onChange={setFinalDate}
                        label="Fim"
                        renderInput={(params) => <TextField {...params} sx={{ width: '20ch' }} />}
                    />
                </LocalizationProvider>

                <Button className="buttonHover" onClick={handleGetTicketsInformation} variant='contained'>
                    Filtrar
                </Button>
            </Stack>
            <Bar options={options} data={dataCharts} style={{ maxWidth: '100%', maxHeight: '280px' }} />
        </>
    );
};
