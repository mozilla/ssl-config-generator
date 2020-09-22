module.exports = {
  author: "April King",
  contentSecurityPolicy: "default-src 'none'; base-uri 'none'; connect-src https://www.google-analytics.com; font-src 'self'; img-src 'self' https://www.google-analytics.com; script-src 'self' https://www.google-analytics.com/analytics.js https://www.googletagmanager.com/gtag/js; style-src 'self'",
  description: "An easy-to-use secure configuration generator for web, database, and mail software. Simply select the software you are using and receive a configuration file that is both safe and compatible.",
  header: "SSL Configuration Generator",
  localContentSecurityPolicy: "default-src * 'unsafe-inline'",  // supports autoreload
  mobileHeader: "SSL Config Generator",
  title: "Mozilla SSL Configuration Generator",
  url: "https://ssl-config.mozilla.org",
  validHashKeys: ["server", "version", "server-version", "openssl", "openssl-version", "config", "hsts", "ocsp"],
};
