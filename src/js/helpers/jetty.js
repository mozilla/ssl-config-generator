export default (form, output) => {

 function jetty_list_items (list) {
    var conf = '';
    for (let x of list) {
      conf +=
      '      <Item>'+x+'</Item>\n';
    }
    return conf;
 }

 var conf =
      '<!--\n'+
      output.header+'\n'+
      output.link+'\n'+
      '-->\n'+
      '<Configure id="sslContextFactory" class="org.eclipse.jetty.util.ssl.SslContextFactory$Server">\n'+
      '  <Set name="KeyStorePath">\n'+
      '    <Property name="jetty.home" default="." />\n'+
      '    <Property name="jetty.sslContext.keyStorePath" default="/path/to/key_store" />\n'+
      '  </Set>\n'+
      '\n'+
         (output.protocols.includes("TLSv1.3") ? '  <!-- TLSv1.3 requires Java 11 or higher -->\n' : '')+
      '  <Set name="IncludeProtocols">\n'+
      '    <Array type="String">\n'+
             jetty_list_items(output.protocols)+
      '    </Array>\n'+
      '  </Set>\n'+
      '\n';

 if (output.ciphers.length) {
    conf +=
      '  <Set name="IncludeCipherSuites">\n'+
      '    <Array type="String">\n'+
             (output.protocols.includes("TLSv1.3")
               ? jetty_list_items(output.cipherSuites)
               : '')+
             jetty_list_items(output.ciphers)+
      '    </Array>\n'+
      '  </Set>\n';
 }

    conf +=
      '\n'+
      '  <Set name="useCipherSuitesOrder">\n'+
      '    <Property name="jetty.sslContext.useCipherSuitesOrder" default="'+(output.serverPreferredOrder ? 'true' : 'false')+'" />\n'+
      '  </Set>\n'+
      '</Configure>\n';

  return conf;
};
