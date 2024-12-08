import minver from './minver.js';

export default (form, output) => {
 var protos = (minver("3.6.0", form.serverVersion))
   ?  '>='+output.protocols[0]
   :  '!SSLv2, !SSLv3'+
      (!output.protocols.includes('TLSv1')   ? ', !TLSv1'   : '')+
      (!output.protocols.includes('TLSv1.1') ? ', !TLSv1.1' : '')+
      (!output.protocols.includes('TLSv1.2') ? ', !TLSv1.2' : '');
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'smtpd_tls_auth_only = yes\n'+
      'smtpd_tls_cert_file = /path/to/signed_cert_plus_intermediates\n'+
      'smtpd_tls_key_file = /path/to/private_key\n'+
      'smtpd_tls_security_level = may\n'+
      'smtpd_tls_mandatory_protocols = '+protos+'\n'+
      'smtpd_tls_protocols           = '+protos+'\n'+
      '\n'+
      'smtp_tls_security_level = may\n'+
      'smtp_tls_mandatory_protocols  = '+protos+'\n'+
      'smtp_tls_protocols            = '+protos+'\n'+
      '\n'+
      'tls_preempt_cipherlist = '+(output.serverPreferredOrder ? 'yes' : 'no')+'\n'+
      'tls_eecdh_auto_curves = '+output.tlsCurves.join(' ')+'\n'+
      'tls_ffdhe_auto_groups =\n';

 if (output.ciphers.length) {
    conf +=
      'smtp_tls_mandatory_ciphers = medium\n'+
      'smtpd_tls_mandatory_ciphers = medium\n'+
      'tls_medium_cipherlist = '+output.ciphers.join(':')+'\n';
 }

 if (output.usesDhe) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      'smtpd_tls_dh1024_param_file = /path/to/dhparam\n';
 }

  return conf;
};
