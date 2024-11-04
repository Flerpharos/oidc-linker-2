if (!("PUBLIC_URL" in process.env)) throw new Error("Missing Required environment PUBLIC_URL")
if (!("OPENID_CONFIG_URL" in process.env)) throw new Error("Missing Required environment PUBLIC_URL")
if (!("OPENID_CLIENT_ID" in process.env)) throw new Error("Missing Required environment PUBLIC_URL")
if (!("OPENID_CLIENT_SECRET" in process.env)) throw new Error("Missing Required environment PUBLIC_URL")
if (!("COOKIE_SECRET" in process.env)) throw new Error("Missing Required environment PUBLIC_URL")

const debug = process.env.DEBUG == "true";
const publicallyAvailableUrl = process.env.PUBLIC_URL!.trim().replace(/\/$/, ""); // remove trailing slash
const openidConfigurationUrl = process.env.OPENID_CONFIG_URL!.trim();
const openidClientId = process.env.OPENID_CLIENT_ID!.trim();
const openidClientSecret = process.env.OPENID_CLIENT_SECRET!.trim();
const cookieSecret = process.env.COOKIE_SECRET!.trim();

export default {
  debug,
  publicUrl: publicallyAvailableUrl,
  openIDConfig: openidConfigurationUrl,
  openIDSecret: openidClientSecret,
  openIDClient: openidClientId,
  cookieSecret
}