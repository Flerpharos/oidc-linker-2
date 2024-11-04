const authConfig = await fetch("/auth/info").then((res) => res.json());

const TOKEN_ID = "z_oauth_token";
const EXPIRY_ID = "z_oauth_expiry";
// const REFRESH_ID = "z_oauth_refresh"; // TODO use refresh tokens
const INFO_ID = "z_federated_data";
const INFO_AGE_ID = "z_federated_data_age";

function clearInfo() {
  localStorage.removeItem(TOKEN_ID);
  sessionStorage.removeItem(INFO_ID);
  localStorage.removeItem(EXPIRY_ID);
  sessionStorage.removeItem(INFO_AGE_ID);
}

export async function zfetch(uri, options = {}) {
  if (!(await isLoggedIn()).result) {
    return { auth: false, result: null, response: null };
  }

  if (!("headers" in options)) {
    options.headers = {};
  }

  options.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_ID)}`;

  const response = await fetch(uri, options);

  return {
    auth: response.status != 401,
    result: await response.json(),
    response: response,
    ok: response.ok,
  };
}

export async function isLoggedIn() {
  if (
    !(TOKEN_ID in localStorage) ||
    Date.now() / 1000 > (localStorage.getItem(EXPIRY_ID) ?? 0)
  ) {
    clearInfo();

    return { result: false, message: "Not Logged In" };
  }

  if ((sessionStorage.getItem(INFO_AGE_ID) ?? 0) < Date.now() / 1000 - 120) {
    const userinfo = await fetch(authConfig.userinfo, {
      headers: {
        Authorization: `Bearer ` + localStorage.getItem(TOKEN_ID),
      },
    });

    if (!userinfo.ok) {
      if (userinfo.status == 401) clearInfo();

      return { result: false, message: userinfo.statusText };
    }

    sessionStorage.setItem(INFO_ID, await userinfo.text());
    sessionStorage.setItem(INFO_AGE_ID, Date.now() / 1000);
  }

  return { result: true, message: "Logged in" };
}

export async function logout() {
  try {
    await zfetch("/api/v1/logout");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) { /* empty */ }
  clearInfo();
}

export async function user() {
  if (!(await isLoggedIn()).result) return null;

  return JSON.parse(sessionStorage.getItem(INFO_ID));
}
