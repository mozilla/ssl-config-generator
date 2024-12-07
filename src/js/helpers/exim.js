import minver from './minver.js';

export default (form, output) => {
    var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'tls_advertise_hosts = *\n'+
      'tls_certificate = /path/to/signed_cert_plus_intermediates\n'+
      'tls_privatekey = /path/to/private_key\n'+
      '\n'+
      '# '+form.config+' configuration\n'+
      'openssl_options = +no_sslv2 +no_sslv3'+
        (!output.protocols.includes('TLSv1')   ? ' +no_tlsv1'   : '')+
        (!output.protocols.includes('TLSv1.1') ? ' +no_tlsv1_1' : '')+
        (!output.protocols.includes('TLSv1.2') ? ' +no_tlsv1_2' : '')+'\n';

 if (minver("4.97", form.serverVersion)
     && minver("1.1.1", form.opensslVersion)) {
    conf +=
      'tls_eccurve = '+output.tlsCurves.join(':')+'\n';
 }

 if (output.ciphers.length) {
    conf +=
      'tls_require_ciphers = '+output.ciphers.join(':')+'\n';
 }

 if (output.usesDhe) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      'tls_dhparam = /path/to/dhparam\n';
 }

  return conf;
};
