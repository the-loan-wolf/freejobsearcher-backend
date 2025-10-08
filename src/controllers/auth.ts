import { Context } from "hono";
import { getCookie } from "hono/cookie";

// Helper to call Firebase Auth REST API
async function callFirebaseAuth(apiKey: string, endpoint: string, body: any) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

const authlogin = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!c.env.FIREBASE_API_KEY) {
      return c.json({ error: "Missing FIREBASE_API_KEY" }, 500);
    }

    const result = await callFirebaseAuth(
      c.env.FIREBASE_API_KEY,
      "signInWithPassword",
      { email, password, returnSecureToken: true }
    );

    // Set ID token cookie (expires in ~1h)
    c.header(
      "Set-Cookie",
      `idToken=${result.idToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${result.expiresIn}`
    );

    // Set refresh token cookie (long-lived, e.g. 30 days)
    c.header(
      "Set-Cookie",
      `refreshToken=${
        result.refreshToken
      }; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
        60 * 60 * 24 * 30
      }`
    );

    return c.json({ message: "Login successful", ...result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
};

const authSignup = async (c: Context) => {
  const { email, password } = await c.req.json();
  const apiKey = c.env.FIREBASE_API_KEY;
  try {
    const result = await callFirebaseAuth(apiKey, "signUp", {
      email,
      password,
      returnSecureToken: true,
    });
    // result contains idToken, refreshToken, localId (UID)
    // Set ID token cookie (expires in ~1h)
    c.header(
      "Set-Cookie",
      `idToken=${result.idToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${result.expiresIn}`
    );

    // Set refresh token cookie (long-lived, e.g. 30 days)
    c.header(
      "Set-Cookie",
      `refreshToken=${
        result.refreshToken
      }; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
        60 * 60 * 24 * 30
      }`
    );
    return c.json({ message: "Signup successful", ...result });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
};

const authRefresh = async (c: Context) => {
  const res = await refreshTokenFn(c);
  if (!res) return c.json({ error: "missing refresh token" }, 400);

  const data = await res.json();
  if (!res.ok) {
    return c.json({ error: data }, 400);
  }

  // Set new ID token cookie
  c.header(
    "Set-Cookie",
    `idToken=${data.id_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${data.expires_in}`
  );

  return c.json({ message: "Token refreshed", ...data });
};

const refreshTokenFn = async (c: Context) => {
  const refreshToken = getCookie(c, "refreshToken");
  if (!refreshToken) return c.json({ error: "No refresh token" }, 401);
  const url = `https://securetoken.googleapis.com/v1/token?key=${c.env.FIREBASE_API_KEY}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });

    return res;
  } catch (error) {
    console.log("refreshTokenFn:", error);
  }
};

export { authlogin, authSignup, authRefresh, refreshTokenFn };
