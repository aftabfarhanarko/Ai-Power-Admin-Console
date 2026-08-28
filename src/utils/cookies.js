// parse JWT token
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

// Function to set token
export function setCookieWithToken(token) {
  const decodedToken = parseJwt(token);

  if (decodedToken) {
    const expiryDateInSeconds = decodedToken.exp;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expiresInDays =
      (expiryDateInSeconds - currentTimeInSeconds) / (60 * 60 * 24);

    document.cookie = `authToken=${token};max-age=${
      expiresInDays * 24 * 60 * 60
    };path=/;secure;samesite=strict`;
  }
}

// Function to get a cookie by key
export function getCookieValue(key) {
  const name = key + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return null;
}

// Function to remove cookies
export function removeCookies() {
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;secure;samesite=strict";
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;secure;samesite=strict";
}
