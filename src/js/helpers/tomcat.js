export default (form, output) => {
 var conf =
      '<!--\n'+
      output.header+'\n'+
      output.link+'\n'+
      '-->\n';

 if (form.hsts) {
    conf +=
      '<Connector\n'+
      '    port="80"\n'+
      '    redirectPort="443" />\n'+
      '\n';
 }

    conf +=
      '<Connector\n'+
      '    port="443"\n'+
      '    SSLEnabled="true">\n'+
      '\n'+
           (output.protocols.includes("TLSv1.3") ? '    <!-- TLSv1.3 requires Java 11 or higher -->\n' : '')+
      '    <SSLHostConfig\n';

 if (output.ciphers.length) {
    conf +=
      '        ciphers="'+
        (output.protocols.includes("TLSv1.3") ? output.cipherSuites.join(':')+':' : '')+
        output.ciphers.join(':')+'"\n';
 }

    conf +=
      '        disableSessionTickets="true"\n'+
      '        honorCipherOrder="'+(output.serverPreferredOrder ? 'true' : 'false')+'"\n'+
      '        protocols="'+output.protocols.join(',')+'">\n'+
      '\n'+
      '        <Certificate\n'+
      '            certificateFile="/path/to/signed_certificate"\n'+
      '            certificateChainFile="/path/to/intermediate_certificate"\n'+
      '            certificateKeyFile="/path/to/private_key" />\n'+
      '    </SSLHostConfig>\n'+
      '\n'+
      '    <UpgradeProtocol className="org.apache.coyote.http2.Http2Protocol" />\n'+
      '</Connector>\n';

  return conf;
};
