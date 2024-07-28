import "../bootstrap";

const config = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "mysql",
  timezone: process.env.DB_TIMEZONE || "-03:00", // Tornar o timezone configurável
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10), // Garantir que o port é um número
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG === "true"
};

// Verificação das variáveis de ambiente essenciais
if (!config.host || !config.database || !config.username || !config.password) {
  throw new Error("Faltam variáveis de ambiente essenciais para a configuração do banco de dados.");
}

export default config;
