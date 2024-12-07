import minver from './minver.js';

export default (form, output) => {
 var tlsopts =
      '      minVersion = '+(output.protocols[0] === 'TLSv1' ? 'VersionTLS10' : output.protocols[0].replace('TLSv1.', 'VersionTLS1'))+'\n'+
      '      curvePreferences = ["X25519", "CurveP256", "CurveP384"]\n';
 if (output.ciphers.length) {
    tlsopts +=
      '      cipherSuites = [\n'+
      '        "'+output.ciphers.join('",\n        "')+'"\n'+
      '      ]\n';
 }

 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n';

 if (minver("2.0.0", form.serverVersion)) {
    // traefik 2.0 has a very different configuration style
    conf +=
      '[http.routers]\n'+
      '  [http.routers.router-secure]\n'+
      '    rule = "Host(`example.com`)"\n'+
      '    service = "service-id"\n'+
      (form.hsts
        ?
      '    middlewares = ["hsts-header"]\n'
        : '')+
      '\n'+
      '    [http.routers.router-secure.tls]\n'+
      '      options = "'+form.config+'"\n';

  if (form.hsts) {
    conf +=
      '\n'+
      '  [http.routers.router-insecure]\n'+
      '    rule = "Host(`example.com`)"\n'+
      '    service = "service-id"\n'+
      '    middlewares = ["redirect-to-https", "hsts-header"]\n'+
      '\n'+
      '[http.middlewares]\n'+
      '  [http.middlewares.redirect-to-https.redirectScheme]\n'+
      '    scheme = "https"\n'+
      '  [http.middlewares.hsts-header.headers]\n'+
      '    [http.middlewares.hsts-header.headers.customResponseHeaders]\n'+
      '      Strict-Transport-Security = "max-age='+output.hstsMaxAge+'"\n';
  }

    conf +=
      '\n'+
      '# due to Go limitations, it is highly recommended that you use an ECDSA\n'+
      '# certificate, or you may experience compatibility issues\n'+
      '[[tls.certificates]]\n'+
      '  certFile = "/path/to/signed_cert_plus_intermediates"\n'+
      '  keyFile = "/path/to/private_key"\n'+
      '\n'+
      '[tls.options]\n'+
      '  [tls.options.'+form.config+']\n'+
      tlsopts;
 }
 else {
    // traefik 1.x configuration style
    conf +=
      'defaultEntryPoints = ["http", "https"]\n'+
      '\n'+
      '[entryPoints]\n';

  if (form.hsts) {
    conf +=
      '  [entryPoints.http]\n'+
      '  address = ":80"\n'+
      '    [entryPoints.http.redirect]\n'+
      '    entryPoint = "https"\n'+
      '\n';
  }

    conf +=
      '  [entryPoints.https]\n'+
      '  address = ":443"\n'+
      '    [entryPoints.https.tls]\n'+
      tlsopts+
      '\n'+
      '      # due to Go limitations, it is highly recommended that you use an ECDSA\n'+
      '      # certificate, or you may experience compatibility issues\n'+
      '      [[entryPoints.https.tls.certificates]]\n'+
      '      certFile = "/path/to/signed_cert_plus_intermediates"\n'+
      '      keyFile = "/path/to/private_key"\n';
 }

  return conf;
};
