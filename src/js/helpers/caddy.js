import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n';

 if (!minver("2.0.0", form.serverVersion)) {
    conf =
      '\n'+
      '# note that Caddy version 1 reached end-of-life > 4 years ago back in 2020\n';
 }

    conf +=
      '\n'+
      '# replace example.com with your domain name\n'+
      'example.com {\n'+
      '\n'+
      '  tls {\n'+
      '    # Note: Caddy automatically configures safe TLS settings,\n'+
      '    # so \'ciphers\' and \'curves\' may safely be commented out to use Caddy defaults.\n';

 if (output.ciphers.length) {
  if (output.protocols.includes('TLSv1.2')) {
    conf +=
      '\n'+
      '    # Due to a lack of DHE support, you -must- use an ECDSA cert to support IE 11 on Windows 7\n\n';
  }
    conf +=
      '    ciphers '+output.ciphers.join(' ')+'\n';
 }

    conf +=
      '    curves x25519 secp256r1 secp384r1\n';

 if (output.protocols.includes('TLSv1.1')) {
    conf +=
      '    # Note: Caddy supports only TLSv1.2 and later\n';
 }
    conf +=
      output.protocols.includes('TLSv1.2')
       ?
      '    #protocols tls1.2 tls1.3\n'
       :
      '    protocols tls1.3\n';
    conf +=
      '  }\n';

 if (form.hsts) {
    conf +=
      '\n'+
      '  # HSTS ('+output.hstsMaxAge+' seconds)\n'+
      '  header Strict-Transport-Security "max-age='+output.hstsMaxAge+'"\n';
 }

    conf +=
      '\n'+
      '}\n';

  return conf;
};
