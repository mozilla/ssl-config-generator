import minver from './minver.js';

export default (form, output) => {
 var tlsopts =
      '      minVersion = "'+(output.protocols[0] === 'TLSv1' ? 'VersionTLS10' : output.protocols[0].replace('TLSv1.', 'VersionTLS1'))+'"\n';
 // map output.tlsCurves strings into Traefik 'curvePreferences' strings
 let groups_guideln = ['X25519MLKEM768','SecP256r1MLKEM768','SecP384r1MLKEM1024','X25519','prime256v1','secp384r1'];
 let groups_traefik = ['X25519MLKEM768','',                 '',                  'X25519','CurveP256', 'CurveP384'];
    tlsopts +=
      '      curvePreferences = [';
 output.tlsCurves.forEach(function(group) {
  let idx = groups_guideln.indexOf(group)
  if (idx >= 0 && groups_traefik[idx].length) {
    tlsopts += '"'+groups_traefik[idx]+'",';
  }
 });
    tlsopts = tlsopts.substring(0, tlsopts.length - 1);
    tlsopts +=
      ']\n';
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
      '    stsSeconds = '+output.hstsMaxAge+'\n'+
      '    # Depending on your configuration you might want to also enable "includeSubDomains"\n'+
      '    # and "preload". More infos about these directives can be found at\n'+
      '    # https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security\n'+
      '    #stsIncludeSubdomains = true\n'+
      '    #stsPreload = true\n';
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
