import minver from './minver.js';

export default (form, output) => {
 // Only version 1.5.0 and newer support TLS
 if (!minver("1.5.0", form.serverVersion)) {
    return 'Sorry, TLS is not supported in this version of HAProxy.\n';
 }

 function haproxy_ssl_default_opts (tag) {
   var conf =
      '    ssl-default-'+tag+'-curves '+output.tlsCurves.join(':')+'\n'+
      (output.ciphers.length
        ?
      '    ssl-default-'+tag+'-ciphers '+output.ciphers.join(':')+'\n'
        : '')+
      (minver("1.9.0", form.serverVersion) && minver("1.1.1", form.opensslVersion)
        ?
      '    ssl-default-'+tag+'-ciphersuites '+output.cipherSuites.join(':')+'\n'
        : '')+
      '    ssl-default-'+tag+'-options'+
      (minver("1.8.0", form.serverVersion) && !output.serverPreferredOrder && tag === 'bind'
        ? ' prefer-client-ciphers'
        : '')+
      (minver("2.2.0", form.serverVersion)
        ? ' ssl-min-ver '+(output.protocols[0] == 'TLSv1' ? 'TLSv1.0' : output.protocols[0])
        : (!output.protocols.includes('SSLv3')   ? ' no-sslv3'  : '')+
          (!output.protocols.includes('TLSv1')   ? ' no-tlsv10' : '')+
          (!output.protocols.includes('TLSv1.1') ? ' no-tlsv11' : '')+
          (!output.protocols.includes('TLSv1.2') ? ' no-tlsv12' : ''))+
      ' no-tls-tickets\n'+
      '\n';
    return conf;
 }

 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      'global\n'+
      '    # '+form.config+' configuration\n'+
      haproxy_ssl_default_opts('bind')+
      haproxy_ssl_default_opts('server');

 if (output.usesDhe) {
    var ssl_security_level = '';
    if (output.protocols.includes("TLSv1.1")
        && minver("3.0.0", form.opensslVersion)
        && minver("3.0.0", form.serverVersion)) {
      ssl_security_level =
      '    ssl-security-level 0\n';
    }
    conf +=
      minver("1.6.0", form.serverVersion)
        ?
      '    # '+output.dhCommand+' > /path/to/dhparam\n'+
           ssl_security_level+
      '    ssl-dh-param-file /path/to/dhparam\n\n'
        :
      '    tune.ssl.default-dh-param 2048\n\n';
 }

    conf +=
      'frontend ft_test\n'+
      '    mode    http\n'+
      '    bind    :443 ssl crt /path/to/<cert+privkey+intermediate>'+(minver("1.8.0", form.serverVersion) ? ' alpn h2,http/1.1' : '')+'\n'+
      '    bind    :80\n';

 if (form.hsts) {
    conf +=
      '    redirect scheme https code '+output.hstsRedirectCode+' if !{ ssl_fc }\n'+
      '\n'+
      '    # HSTS ('+output.hstsMaxAge+' seconds)\n'+
      '    http-response set-header Strict-Transport-Security max-age='+output.hstsMaxAge+'\n';
 }

  return conf;
};
