import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'port 0\n'+
      'tls-port 6379\n'+
      'tls-cluster yes\n'+
      'tls-replication yes\n'+
      '\n'+
      'tls-cert-file /path/to/signed_cert_plus_intermediates\n'+
      'tls-key-file /path/to/private_key\n'+
      '\n'+
      '# redis requires one of these, as it does not implicitly use the system-wide default\n'+
      'tls-ca-cert-file /path/to/ca_certificates.crt\n'+
      'tls-ca-cert-dir /path/to/ca_certificates\n'+
      '\n'+
      '# '+form.config+' configuration\n'+
      'tls-protocols "'+output.protocols.join(' ')+'"\n'+
      'tls-prefer-server-ciphers '+(output.serverPreferredOrder ? 'yes' : 'no')+'\n';

 if (output.ciphers.length) {
    conf +=
      'tls-ciphers '+output.ciphers.join(':')+'\n';
 }

 if (output.cipherSuites.length && minver("1.1.1", form.opensslVersion)) {
    conf +=
      'tls-ciphersuites '+output.cipherSuites.join(':')+'\n';
 }

 if (output.usesDhe) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      'tls-dh-params-file /path/to/dhparam\n';
 }

 if (!minver("6.0", form.serverVersion)) {
    conf = '';
 }

  return conf;
};
