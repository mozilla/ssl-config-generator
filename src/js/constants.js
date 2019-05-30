module.exports = {
  author: "April King",
  contentSecurityPolicy: "default-src 'none'; base-uri 'none'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'",
  localContentSecurityPolicy: "default-src * 'unsafe-inline'",  // supports autoreload
  validHashKeys: ["server", "server-version", "openssl-version", "config", "hsts", "ocsp"],
  title: "SSL Configuration Generator",
};
