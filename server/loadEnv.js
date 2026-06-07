import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

//adding this file because we start the dev from the no-name dir which loads the .env of FE instead of the server's .env, now this file points .env by absolute path so it works no matter the dev starting path.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, ".env") });
