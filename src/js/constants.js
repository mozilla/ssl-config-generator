module.exports = {
  author: "April King",
  contentSecurityPolicy: "default-src 'none'; base-uri 'none'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'",
  description: "An easy-to-use secure configuration generator for web, database, and mail software",
  header: "SSL Configuration Generator",
  localContentSecurityPolicy: "default-src * 'unsafe-inline'",  // supports autoreload
  title: "Mozilla SSL Configuration Generator",
  validHashKeys: ["server", "server-version", "openssl-version", "config", "hsts", "ocsp"],
};
