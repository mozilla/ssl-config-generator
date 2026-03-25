export default (form, output) => {
  var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n';

  const protocolBits = {
    'TLSv1': 2,
    'TLSv1.1': 4,
    'TLSv1.2': 8,
    'TLSv1.3': 16,
  };
  const sslProtocol = output.protocols.reduce((mask, proto) => {
    return mask | (protocolBits[proto] || 0);
  }, 0);

  conf +=
      '\n'+
      '<httpServerConfig>\n'+
      '  <listenerList>\n'+
      '    <listener>\n'+
      '      <name>HTTPS</name>\n'+
      '      <address>*:443</address>\n'+
      '      <secure>1</secure>\n'+
      '      <keyFile>/path/to/private_key</keyFile>\n'+
      '      <certFile>/path/to/signed_cert_followed_by_intermediates</certFile>\n';

  if (sslProtocol) {
    conf +=
      '      <sslProtocol>'+sslProtocol+'</sslProtocol>\n';
  }

  if (output.ciphers.length) {
    conf +=
      '      <ciphers>'+output.ciphers.join(':')+'</ciphers>\n';
  }

  if (form.ocsp) {
    conf +=
      '      <enableStapling>1</enableStapling>\n';
  }

  conf +=
      '    </listener>\n'+
      '  </listenerList>\n'+
      '</httpServerConfig>\n';

  if (form.hsts) {
    conf +=
      '\n'+
      '<virtualHostConfig>\n'+
      '  <context>\n'+
      '    <type>NULL</type>\n'+
      '    <uri>/</uri>\n'+
      '    <location>$DOC_ROOT/</location>\n'+
      '    <allowBrowse>1</allowBrowse>\n'+
      '    <extraHeaders>\n'+
      '        Header Set Strict-Transport-Security: max-age=max-age='+output.hstsMaxAge+'\n'+
      '    </extraHeaders>\n'+
      '    <addDefaultCharset>off</addDefaultCharset>\n'+
      '  </context>\n'+
      '</virtualHostConfig>\n';
  }

  return conf;
};
