import path from "path";
import multer from "multer";
import fs from "fs";

// Diretório base para armazenar uploads
const publicFolder = path.resolve(__dirname, "..", "..", "public");

// Função para garantir que o diretório existe
const ensureDirectoryExistence = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.chmodSync(folder, 0o755); // Usar permissões mais restritivas
  }
};

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const { typeArch, fileId } = req.body;

      // Validação e sanitização dos valores
      const safeTypeArch = typeArch && typeArch.match(/^[\w-]+$/) ? typeArch : "uploads";
      const safeFileId = fileId ? fileId.toString().replace('/', '-') : '';

      // Definição do diretório de destino
      const folder = path.resolve(publicFolder, safeTypeArch, safeFileId);

      // Garantir que o diretório exista
      ensureDirectoryExistence(folder);

      // Passar o diretório de destino para o multer
      cb(null, folder);
    },
    filename(req, file, cb) {
      const { typeArch } = req.body;

      // Sanitização do nome do arquivo
      const safeFileName = file.originalname.replace(/[\/\\?%*:|"<>]/g, "-").replace(/ /g, "_");
      const fileName = typeArch && typeArch !== "announcements"
        ? safeFileName
        : `${Date.now()}_${safeFileName}`;

      // Passar o nome do arquivo para o multer
      cb(null, fileName);
    }
  })
};
