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
      '# Server level Configuration\n';

    conf +=    
      'listener https {\n'+
        'address                 *:443\n'+
        'secure                  1\n'+
        'keyFile                 /path/to/private_key\n'+
        'certFile                /path/to/signed_cert\n'+
        (output.ciphers.length
          ?
        'ciphers                 '+output.ciphers.join(':')+';\n'
          :
        '');

    
    if (output.protocols[0] === 'TLSv1.3') {
        conf +=
            'sslProtocol             16\n';
    }
    else if (output.protocols[0] === 'TLSv1.2') {
        conf +=
            'sslProtocol             24\n';
    }
    else if (output.protocols.includes('TLSv1.1')) {
        conf +=
        'sslProtocol             28\n';
    }   

    conf +=
      '\n\n\n'+
      '# Virtual Host Level Configuration\n';
      
    conf +=    
      'vhssl  {\n'+
      '  keyFile                 /path/to/private_key\n'+
      '  certFile                /path/to/signed_cert\n'+
      '  certChain               1\n';
    if (form.ocsp) {
      conf +=
          '  enableStapling          1\n';
    }
    conf +=
      '}\n';

    if (form.hsts) {
        conf +=
        '\n'+
        'context / {\n'+
        '   location                $DOC_ROOT/\n'+
        '   allowBrowse             1\n'+
        '   extraHeaders            Header Set Strict-Transport-Security: max-age=max-age='+output.hstsMaxAge+'\n'+
        '}\n';
    }
  return conf;
};
