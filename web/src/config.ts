// Required Envar Checks
const REQUIRED_ENVARS = [
  // Environment
  // Api Servers
  "VITE_API_GATEWAY", // Api Gateway
] as const;

const missingEnvars: string[] = REQUIRED_ENVARS.filter((envar) => !import.meta.env[envar]);
declare type Envars = { [key in (typeof REQUIRED_ENVARS)[number]]: string } & Record<string, string | null> &
  ImportMetaEnv;
const ENV = import.meta.env as Envars;
const isProduction = !ENV.DEV;
const isDevelopment = ENV.DEV;

const CONFIG = {
  ENV,
  maintenanceMode: false,
  isProduction,
  isDevelopment,
  ORIGIN: window.location.origin,
  API_GATEWAY: ENV.VITE_API_GATEWAY, // This will later be the API proxy gateway
};

export default CONFIG;
if (missingEnvars.length > 0 && !isProduction) throw Error(`Missing Envars ${JSON.stringify(missingEnvars, null, 2)}`);
if (missingEnvars.length > 0) {
  console.error(JSON.stringify(missingEnvars, null, 2));
  alert("Environment variables are missing!\nPlease check the console for more details....");
}
