import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'ssl = on\n'+
      '\n'+
      "ssl_cert_file = '/path/to/signed_cert_plus_intermediates'\n"+
      "ssl_key_file = '/path/to/private_key'\n"+
      '\n';

 if (minver("12.0.0", form.serverVersion)) {
    conf +=
      "ssl_min_protocol_version = '"+output.protocols[0]+"'\n";
 }

 if (minver("18.0.0", form.serverVersion)) {
    conf +=
      "ssl_groups = '"+output.tlsCurves.join(':')+"'\n";
 }

 if (output.ciphers.length) {
    conf +=
      "ssl_ciphers = '"+output.ciphers.join(':')+"'\n";
 }

 if (output.usesDhe && minver("10.0.0", form.serverVersion)) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      "ssl_dh_params_file = '/path/to/dhparam'\n";
 }

  return conf;
};
