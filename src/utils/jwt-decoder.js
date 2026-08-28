const base64UrlDecode = (str) => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const decoded = atob(base64 + pad);
  return JSON.parse(decoded);
};

export const decodeJWT = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT token: token is missing or not a string.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token.");
  }

  const payload = base64UrlDecode(parts[1]);
  return {
    payload,
    exp: payload.exp || null,
  };
};