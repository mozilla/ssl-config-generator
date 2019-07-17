module.exports = {
  author: "April King",
  contentSecurityPolicy: "default-src 'none'; base-uri 'none'; font-src 'self'; img-src 'self'; script-src 'self' https://www.google-analytics.com/analytics.js https://www.googletagmanager.com/gtag/js; style-src 'self'",
  description: "An easy-to-use secure configuration generator for web, database, and mail software",
  header: "SSL Configuration Generator",
  localContentSecurityPolicy: "default-src * 'unsafe-inline'",  // supports autoreload
  mobileHeader: "SSL Config Generator",
  title: "Mozilla SSL Configuration Generator",
  url: "https://ssl-config.mozilla.org",
  validHashKeys: ["server", "server-version", "openssl-version", "config", "hsts", "ocsp"],
};
