export const isFirefox = () => navigator.userAgent.includes("Firefox");
export const isChrome = () => navigator.userAgent.includes("Chrome");

export function isBrowserURL(url: string) {
  if (isChrome()) return isChromeURL(url);
  if (isFirefox()) return isFirefoxURL(url);
}

export function isChromeURL(url: string) {
  return (
    // use .includes() for the rest?
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    // extension webstore
    url.includes("chrome.google.com")
  );
}

export function isFirefoxURL(url: string) {
  return url.startsWith("about:") || url.startsWith("moz-extension://");
}
