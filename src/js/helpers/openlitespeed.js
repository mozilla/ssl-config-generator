import minver from './minver.js';

export default (form, output) => {
  var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n';
  if (!minver("1.4.35", form.serverVersion)) {
    conf +=
      '\n'+
      '# Note that the current requested OpenLiteSpeed version may not support the following configurations!\n';
  }

    conf +=
      '\n'+
      'listener https {\n'+
      '  address                 *:443\n'+
      '  secure                  1\n'+
      '  keyFile                 /path/to/private_key\n'+
      '  certFile                /path/to/signed_cert_followed_by_intermediates\n'+
      (output.ciphers.length
        ?
      '  ciphers                 '+output.ciphers.join(':')+'\n'
        :
      '');

  if (form.ocsp) {
    conf +=
      '  enableStapling          1\n';
  }

  const protocolMap = {
    'TLSv1.3': 16,
    'TLSv1.2,TLSv1.3': 24,
    'TLSv1,TLSv1.1,TLSv1.2,TLSv1.3': 30,
  };
  const key = output.protocols.join(',');
  const mask = protocolMap[key];
  if (mask) {
    conf +=
      '  sslProtocol             '+mask+'\n';
  }

    conf +=
      '}\n';

  if (form.hsts) {
    conf +=
      '\n'+
      'context / {\n'+
      '  location                $DOC_ROOT/\n'+
      '  allowBrowse             1\n'+
      '  extraHeaders            Header Set Strict-Transport-Security: max-age=max-age='+output.hstsMaxAge+'\n'+
      '}\n';
  }

  return conf;
};
