import minver from './minver.js';

// lighttpd TLS defaults are incrementally updated over time to improve security
// and the lighttpd TLS defaults are widely supported by clients.  The output of
// ssl-config-generator might explicitly lock configurations to specific details
// and might result in those configs continuing to be used for many, many years
// without a security review.  Therefore, lighttpd TLS defaults should be
// preferred when those defaults exceed the Mozilla ssl-config-generator
// specification.  The logic below attempts to omit extra lines of configuration
// when those extra lines match or are exceeded by the lighttpd TLS defaults.

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '#server.port = 80\n'+
      '$SERVER["socket"] == "[::]:80" { }\n';

 if (minver("1.4.50", form.serverVersion)) {

    conf +=
      '\n'+
      '# select one TLS module: "mod_openssl" "mod_mbedtls" "mod_gnutls" "mod_wolfssl" "mod_nss"\n'+
      'server.modules += ("mod_openssl")\n'+
      '\n'+
      '# lighttpd 1.4.56 and later will inherit ssl.* from the global scope if\n'+
      '# $SERVER["socket"] contains ssl.engine = "enable" and no other ssl.* options\n'+
      '# (to avoid having to repeat ssl.* directives in both ":443" and "[::]:443")\n'+
      '$SERVER["socket"] ==     ":443" { ssl.engine = "enable" }\n'+
      '$SERVER["socket"] == "[::]:443" { ssl.engine = "enable" }\n'+
      'ssl.privkey = "/path/to/private_key"\n'+
      'ssl.pemfile = "/path/to/signed_cert_followed_by_intermediates"\n';
  if (minver("1.0.2", form.opensslVersion)) {
   if (minver("1.1.0", form.opensslVersion)) {
    let comment = minver("1.4.77", form.serverVersion)
                  ? output.protocols[0] == 'TLSv1.3'
                  : minver("1.4.56", form.serverVersion)
                    ? output.protocols[0] == 'TLSv1.2'
                    : false;
    if (comment) {
    conf +=
      '#';
    }
    conf +=
      'ssl.openssl.ssl-conf-cmd = ("MinProtocol" => "'+output.protocols[0]+'")';
    if (comment) {
    conf +=
      '  # lighttpd '+form.serverVersion+' TLS default';
    }
    conf +=
      '\n';
   }
   else {
    conf +=
      'ssl.openssl.ssl-conf-cmd = ("Protocol" => "-ALL, '+output.protocols.join(', ')+'")\n';
   }

   let comment = minver("1.4.77", form.serverVersion);
   if (comment) {
    conf +=
      '#';
   }
    conf +=
      'ssl.openssl.ssl-conf-cmd += ("Curves" => "'+output.tlsCurves.join(':')+'")';
   if (comment) {
    conf +=
      '  # lighttpd '+form.serverVersion+' TLS default appends X448';
   }
    conf +=
      '\n';

   if (!minver("1.4.68", form.serverVersion) || output.serverPreferredOrder) {
    conf +=
      'ssl.openssl.ssl-conf-cmd += ("Options" => "'+(output.serverPreferredOrder ? '+' : '-')+'ServerPreference")\n';
   }
   if (output.ciphers.length) {
    conf += (minver("1.4.68", form.serverVersion) && form.config != 'old')
       ?
      '\n'+
      '# lighttpd TLS defaults are widely supported by clients and should be preferred.\n'+
      '# See https://wiki.lighttpd.net/Docs_SSL\n'+
      '# Uncomment to better match the less restricted Mozilla '+form.config+' spec.\n'+
      '#ssl.openssl.ssl-conf-cmd += ("CipherString" => "'+output.ciphers.join(':')+'")\n'
       :
      '# TLS modules besides mod_openssl might name ciphers differently\n'+
      '# See https://wiki.lighttpd.net/Docs_SSL\n'+
      'ssl.openssl.ssl-conf-cmd += ("CipherString" => "'+output.ciphers.join(':')+'")\n';
   }
   if (form.ocsp) {
    conf +=
      '\n'+
      '# OCSP stapling (input file must be maintained by external script, e.g. cert-staple.sh)\n'+
      '# https://wiki.lighttpd.net/Docs_SSL#OCSP-Stapling\n'+
      'ssl.stapling-file = "/path/to/cert-staple.der"\n';
   }
  }
  else {
    conf +=
      'ssl.use-sslv2 = "disable"\n'+
      'ssl.use-sslv3 = "disable"\n'+
      'ssl.honor-cipher-order = "'+(output.serverPreferredOrder ? 'enable' : 'disable')+'"\n';
   if (output.ciphers.length) {
    conf +=
      'ssl.cipher-list = "'+output.ciphers.join(':')+'"\n';
   }
  }

 }
 else {

    conf +=
      '\n'+
      (minver("1.4.46", form.serverVersion)
       ?
      '#server.modules += ("mod_openssl")\n'
       :
      '')+
      '$SERVER["socket"] == ":443" {\n'+
      '    ssl.engine  = "enable"\n';
      minver("1.4.53", form.serverVersion)
       ?
      '    ssl.privkey = "/path/to/private_key"\n'+
      '    ssl.pemfile = "/path/to/signed_cert"\n'+
      '    ssl.ca-file = "/path/to/intermediate_certificate"\n'
       :
      '    # pemfile is cert+privkey, ca-file is the intermediate chain in one file\n'+
      '    ssl.pemfile = "/path/to/signed_cert_plus_private_key"\n'+
      '    ssl.ca-file = "/path/to/intermediate_certificate"\n';
  if (output.usesDhe && minver("1.4.29", form.serverVersion)) {
    conf +=
      '\n'+
      '    # '+output.dhCommand+' > /path/to/dhparam\n'+
      '    ssl.dh-file = "/path/to/dhparam"\n';
  }

    conf +=
      '    # '+form.config+' configuration\n';
  if (minver("1.4.48", form.serverVersion)) {
   if (minver("1.1.0", form.opensslVersion)) {
    conf +=
      '    ssl.openssl.ssl-conf-cmd = ("MinProtocol" => "'+output.protocols[0]+'",\n'+
      '                                "Curves" => "'+output.tlsCurves.join(':')+'",\n';
      '                                "Options" => "-SessionTicket")\n';
   }
   else if (minver("1.0.2", form.opensslVersion)) {
    conf +=
      '    ssl.openssl.ssl-conf-cmd = ("Protocol" => "-ALL, '+output.protocols.join(', ')+'",\n'+
      '                                "Curves" => "'+output.tlsCurves.join(':')+'",\n';
      '                                "Options" => "-SessionTicket")\n';
   }
   else {
    conf +=
      '    ssl.use-sslv2 = "disable"\n'+
      '    ssl.use-sslv3 = "disable"\n';
   }
  }
  else {
    conf +=
      '    ssl.use-sslv2 = "disable"\n'+
      '    ssl.use-sslv3 = "disable"\n';
  }
    conf +=
      '    ssl.honor-cipher-order = "'+(output.serverPreferredOrder ? 'enable' : 'disable')+'"\n';
  if (output.ciphers.length) {
    conf +=
      'ssl.cipher-list = "'+output.ciphers.join(':')+'"\n';
  }
    conf +=
      '}\n'+
      '#$SERVER["socket"] == "[::]:443" { ... } # repeat entire $SERVER["socket"] == ":443" { ... } config above for IPv6\n';

 }

 if (form.hsts) {
    conf +=
      '# HSTS\n'+
      (minver("1.4.56", form.serverVersion))
       ?
      '\n'+
      'server.modules += ("mod_redirect")\n'+
      'server.modules += ("mod_setenv")\n'
       :
      '\n'+
      '#server.modules += ("mod_redirect")\n'+
      '#server.modules += ("mod_setenv")\n';
    conf +=
      '$HTTP["scheme"] == "https" {\n'+
      '    # HTTP Strict Transport Security ('+output.hstsMaxAge+' seconds)\n'+
      '    setenv.add-response-header = (\n'+
      '      "Strict-Transport-Security" => "max-age='+output.hstsMaxAge+'"\n'+
      '    )\n'+
      '}\n'+
      'else $HTTP["scheme"] == "http" {\n';
    conf += (minver("1.4.50", form.serverVersion))
       ?
      '  url.redirect = ("" => "https://${url.authority}${url.path}${qsa}")\n'
       :
      '  $HTTP["host"] =~ ".*" {\n'+
      '    url.redirect = (".*" => "https://%0$0")\n'+
      '  }\n';
    conf +=
      '}\n';
 }

  return conf;
};
