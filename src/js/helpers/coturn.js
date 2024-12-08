import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '\n'+
      'tls-listening-port=5349\n'+
      '\n'+
      'cert=/path/to/ca_signing_cert\n'+
      'pkey=/path/to/ca_signing_private_key\n';

 if (output.ciphers.length) {
    conf +=
      '\n'+
      'cipher-list="'+output.ciphers.join(':')+'"\n';
 }

 if (output.usesDhe) {
    conf +=
      '\n'+
      '# '+output.dhCommand+' > /path/to/dhparam\n'+
      'dh-file=/path/to/dhparam\n';
 }

 if (minver("3.2.2", form.serverVersion)) {
    conf +=
      '\n'+
      'no-sslv2\n'+
      'no-sslv3\n'+
      (!output.protocols.includes('TLSv1')   ? 'no-tlsv1\n'   : '')+
      (!output.protocols.includes('TLSv1.1') ? 'no-tlsv1_1\n' : '')+
      (!output.protocols.includes('TLSv1.2') ? 'no-tlsv1_2\n' : '');
 }

  return conf;
};
