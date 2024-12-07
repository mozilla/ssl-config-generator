import minver from './minver.js';

export default (form, output) => {
 var conf =
      '; '+output.header+'\n'+
      '; '+output.link+'\n'+
      '\n';

 if (minver("5.50", form.serverVersion)) {
  if (output.protocols[0] === 'TLSv1.2') {
    conf +=
      'sslVersionMin = TLSv1.2\n';
  }
  else if (output.protocols[0] === 'TLSv1.3') {
    conf +=
      'sslVersionMin = TLSv1.3\n'+
      'ciphersuites = '+output.cipherSuites.join(':')+'\n';
  }
 }
 else {
    conf +=
      (!output.protocols.includes('TLSv1.1') ? 'options = NO_TLSv1.1\n' : '')+
      (!output.protocols.includes('TLSv1')   ? 'options = NO_TLSv1\n'   : '');
 }

 if (!minver("1.0.1", form.opensslVersion)) {
    conf +=
      'options = NO_SSLv3\n'+
      'options = NO_SSLv2\n';
 }

 if (minver("1.1.1", form.opensslVersion)) {
    conf +=
      'curves = '+output.tlsCurves.join(':')+'\n';
 }

 if (output.ciphers.length) {
    conf +=
      'ciphers = '+output.ciphers.join(':')+'\n';
 }

    conf +=
      '\n'+
      '; Example using client mode to proxy IMAP server\n'+
      '[imap-proxy-server]\n'+
      'client = yes\n'+
      'accept = 127.0.0.1:143\n'+
      'connect = imap.example.com:993\n'+
      'CApath = /etc/ssl/certs\n'+
      (minver("1.0.2", form.opensslVersion) ? 'checkHost = imap.example.com\n' : '')+
      'verifyChain = yes\n'+
      '\n'+
      '; Example serving HTTPS for HTTP service\n'+
      '[https-server]\n'+
      'accept  = 443\n'+
      'connect = 80\n'+
      'CAfile = /path/to/ca-cert\n'+
      'cert = /path/to/cert\n'+
      'key = /path/to/private_key\n';

  return conf;
};
