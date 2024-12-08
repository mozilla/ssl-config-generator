import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'TLSEngine                     on\n'+
      'TLSRequired                   on\n'+
      '\n'+
      'TLSCertificateChainFile       /path/to/certificate_chain\n'+
      '\n'+
      '# ECDSA certificate\n'+
      'TLSECCertificateFile          /path/to/signed_cert\n'+
      'TLSECCertificateKeyFile       /path/to/private_key\n'+
      '\n'+
      '# RSA certificate, if using RSA certificates instead\n'+
      '# TLSRSACertificateFile         /path/to/signed_cert\n'+
      '# TLSRSACertificateKeyFile      /path/to/private_key\n';

 if (output.usesDhe) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' >> /path/to/dhparam\n'+
      'TLSDHParamFile                /path/to/dhparam\n';
 }

    conf +=
      '\n'+
      '# '+form.config+' configuration\n'+
      'TLSProtocol                   '+output.protocols.join(' ')+'\n';

 if (minver("1.0.2", form.opensslVersion)) {
    conf +=
      'TLSECDHCurve                  '+output.tlsCurves.join(':')+'\n';
 }

 if (output.ciphers.length) {
    conf +=
      'TLSCipherSuite                '+output.ciphers.join(':')+'\n';
 }

 if (minver("1.3.6", form.serverVersion)) {
    conf +=
      'TLSServerCipherPreference     '+(output.serverPreferredOrder ? 'on' : 'off')+'\n'+
      (minver("1.0.2l", form.opensslVersion) ?
      'TLSSessionTickets             off\n' : '');

  if (form.ocsp) {
    conf +=
      '\n'+
      'TLSStapling                   on\n'+
      '# requires mod_tls_shmcache\n'+
      'TLSStaplingCache              shm:/file=/var/ftpd/ocsp_pcache\n';
  }
 }

  return conf;
};
