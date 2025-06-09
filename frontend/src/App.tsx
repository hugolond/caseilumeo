import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ConversionData {
  date: string;
  channel: string;
  total: number;
  converted: number;
  conversion_rate: number;
}

const labelMap: Record<string, string> = {
  email: 'E-mail',
  wpp: 'WhatsApp',
  MOBILE: 'Push',
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const App: React.FC = () => {
  const [data, setData] = useState<ConversionData[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date("2025-01-02"));
  const [endDate, setEndDate] = useState<Date>(new Date("2025-02-02"));
  const [origins, setOrigins] = useState<string[]>(["email"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      if (endDate < startDate) {
        setError("A data final não pode ser anterior à data inicial.");
        return;
      }

      if (origins.length === 0) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];
        const allResults: ConversionData[] = [];
        const baseUrlAPI = import.meta.env.VITE_API_URL;
        console.log(import.meta.env)
        console.log(baseUrlAPI)
        for (const origin of origins) {
          const response = await axios.get(
            `https://ilumeo-backend-uro3.onrender.com/inside/conversion/${origin}?start=${start}&end=${end}`
          );
          allResults.push(...response.data);
        }

        const sortedData = allResults.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setData(sortedData);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, origins]);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const toggleOrigin = (value: string) => {
    setOrigins((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Dashboard de Conversão
        </h1>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => date && setStartDate(date)}
              className="p-2 border rounded w-full"
              dateFormat="dd/MM/yyyy"
              maxDate={endDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              className="p-2 border rounded w-full"
              dateFormat="dd/MM/yyyy"
              minDate={startDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canais</label>
            <div className="flex flex-col gap-1">
              {['email', 'wpp', 'MOBILE'].map((channel) => (
                <label key={channel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={origins.includes(channel)}
                    onChange={() => toggleOrigin(channel)}
                  />
                  <span className="capitalize">{channel === 'wpp' ? 'WhatsApp' : channel === 'email' ? 'E-mail' : channel === 'MOBILE' ? 'Push' : channel}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-gray-600 text-center mb-4">Carregando...</p>}

        {!loading && data.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Evolução do Envio por data
            </h2>
            <div className="overflow-x-auto">
              <Line
                data={{
                  labels: Array.from(new Set(data.map((d) => formatDate(d.date)))),
                  datasets: origins.map((origin) => {
                    const originData = data.filter((d) => d.channel === origin);
                    const colorMap: Record<string, string> = {
                      email: '#c8d9ff', // blue
                      wpp: '#22c55e',  // verde
                      MOBILE: '#808080', // gray
                    };
                    return {
                      label: labelMap[origin] || origin,
                      data: originData.map((d) => d.total),
                      fill: false,
                      borderColor: colorMap[origin] || '#000',
                      backgroundColor: colorMap[origin] || '#000',
                      tension: 0.1,
                    };
                  }),
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        color: '#374151',
                        font: { size: 12 },
                      },
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function (ctx) {
                          const value = typeof ctx.raw === 'number' ? ctx.raw : parseFloat(String(ctx.raw));
                          return `${ctx.dataset.label}: ${value.toLocaleString('pt-BR')}`;
                        },
                      },
                    },
                  },
                  interaction: {
                    mode: 'index' as const,
                    intersect: false,
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: function (value) {
                          return `${value.toLocaleString('pt-BR')}`;
                        },
                        color: '#6B7280',
                      },
                      grid: { color: '#E5E7EB' },
                    },
                    x: {
                      ticks: { color: '#6B7280' },
                      grid: { color: '#F3F4F6' },
                    },
                  },
                }}
                height={350}
              />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Evolução da Conversão por data (x100)
            </h2>
            <div className="overflow-x-auto">
              <Line
                data={{
                  labels: Array.from(new Set(data.map((d) => formatDate(d.date)))),
                  datasets: origins.map((origin) => {
                    const originData = data.filter((d) => d.channel === origin);
                    const colorMap: Record<string, string> = {
                      email: '#c8d9ff', // blue
                      wpp: '#22c55e',  // verde
                      MOBILE: '#808080', // gray
                    };
                    return {
                      label: labelMap[origin] || origin,
                      data: originData.map((d) => d.conversion_rate * 100),
                      fill: false,
                      borderColor: colorMap[origin] || '#000',
                      backgroundColor: colorMap[origin] || '#000',
                      tension: 0.1,
                    };
                  }),
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        color: '#374151',
                        font: { size: 12 },
                      },
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function (ctx) {
                          const value = typeof ctx.raw === 'number' ? ctx.raw : parseFloat(String(ctx.raw));
                          return `${ctx.dataset.label}: ${value.toLocaleString('pt-BR')}%`;
                        },
                      },
                    },
                  },
                  interaction: {
                    mode: 'index' as const,
                    intersect: false,
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: function (value) {
                          return `${value}%`;
                        },
                        color: '#6B7280',
                      },
                      grid: { color: '#E5E7EB' },
                    },
                    x: {
                      ticks: { color: '#6B7280' },
                      grid: { color: '#F3F4F6' },
                    },
                  },
                }}
                height={350}
              />
            </div>
          </div>
        )}


        <div className="overflow-x-auto bg-gray-50 shadow-md rounded-lg">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Canal</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Convertidos</th>
                <th className="p-4 font-semibold">Taxa de Conversão (x100)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-100">
                  <td className="p-4">{formatDate(item.date)}</td>
                  <td className="p-4 capitalize">{labelMap[item.channel] || item.channel}</td>
                  <td className="p-4">{item.total.toLocaleString('pt-BR')}</td>
                  <td className="p-4">{item.converted}</td>
                  <td className="p-4">{(item.conversion_rate * 100).toLocaleString('pt-BR')}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="p-4 text-right" colSpan={2}>Totais:.</td>
                <td className="p-4">{data.reduce((acc, cur) => acc + cur.total, 0).toLocaleString('pt-BR')}</td>
                <td className="p-4">{data.reduce((acc, cur) => acc + cur.converted, 0).toLocaleString('pt-BR')}</td>
                <td className="p-4">
                  {(
                    data.reduce((acc, cur) => acc + cur.conversion_rate * 100, 0) / data.length
                  ).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
      <div className="mt-6 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-300 rounded p-4">
        <span className="text-yellow-500 text-lg font-bold"> ? </span>
        <span>
          Os dados da tabela representam a taxa de conversão por canal e data.
          A linha de totais exibe a média da taxa de conversão e os totais acumulados,
          independentemente da paginação.
          Taxa de conversão foi definida pela valor convertido (6 - Visualizou) pela quantidade total de envio (demais status).
        </span>
      </div>
    </div>
  );
};

export default App;