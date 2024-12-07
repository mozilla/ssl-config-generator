import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'ssl = required\n'+
      '\n'+
      'ssl_cert = </path/to/signed_cert_plus_intermediates\n'+
      'ssl_key = </path/to/private_key\n';

 if (output.usesDhe) {
    conf +=
      '\n'+
      (minver("2.3.0", form.serverVersion)
        ?
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      'ssl_dh = </path/to/dhparam\n'
        :
      'ssl_dh_parameters_length = '+output.dhParamSize+'\n');
 }

    conf +=
      '\n'+
      '# '+form.config+' configuration\n'+
      (minver("2.3.0", form.serverVersion)
        ?
      'ssl_min_protocol = '+output.protocols[0]+'\n'
        :
      'ssl_protocols = '+output.protocols.join(' ')+'\n')+
      'ssl_prefer_server_ciphers = '+(output.serverPreferredOrder ? 'yes' : 'no')+'\n'+
      'ssl_curve_list = '+output.tlsCurves.join(':')+'\n';

 if (output.ciphers.length) {
    conf +=
      'ssl_cipher_list = '+output.ciphers.join(':')+'\n';
 }

  return conf;
};
