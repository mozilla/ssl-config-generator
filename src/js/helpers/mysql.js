export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '[mysqld]\n'+
      'require_secure_transport = on\n'+
      'ssl-cert = /path/to/signed_cert_plus_intermediates\n'+
      'ssl-key = /path/to/private_key\n'+
      'tls_version = '+output.protocols.join(',')+'\n';

 if (output.ciphers.length) {
    conf +=
      'ssl-cipher = '+output.ciphers.join(':')+'\n';
 }

  return conf;
};
