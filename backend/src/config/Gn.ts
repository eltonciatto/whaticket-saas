import path from "path";

// Certifique-se de que as variáveis de ambiente necessárias estão definidas
if (!process.env.GERENCIANET_CLIENT_ID || !process.env.GERENCIANET_CLIENT_SECRET || !process.env.GERENCIANET_PIX_CERT) {
  throw new Error("Faltam variáveis de ambiente necessárias para a configuração do Gerencianet.");
}

const cert = path.join(
  __dirname,
  `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`
);

export default {
  sandbox: process.env.NODE_ENV === "development", // Alternar dinamicamente baseado no ambiente
  client_id: process.env.GERENCIANET_CLIENT_ID as string,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
  pix_cert: cert
};
