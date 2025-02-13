import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '\n'+
      'http {\n'+
      '\n'+
      '    server {\n'+

      (minver("1.25.1", form.serverVersion)
        ?
      '        listen 443 ssl;\n'+
      '        listen [::]:443 ssl;\n'+
      '        http2 on;\n'
        :
       minver("1.9.5", form.serverVersion)
        ?
      '        listen 443 ssl http2;\n'+
      '        listen [::]:443 ssl http2;\n'
        :
      '        listen 443 ssl;\n'+
      '        listen [::]:443 ssl;\n')+

      '        ssl_certificate /path/to/signed_cert_plus_intermediates;\n'+
      '        ssl_certificate_key /path/to/private_key;\n';

 if (form.hsts) {
    conf +=
      '\n'+
      '        # HSTS (ngx_http_headers_module is required) ('+output.hstsMaxAge+' seconds)\n'+
      '        add_header Strict-Transport-Security "max-age='+output.hstsMaxAge+'"'+(minver("1.7.5", form.serverVersion) ? ' always' : '')+';\n';
 }

    conf +=
      '    }\n'+
      '\n'+
      '    # '+form.config+' configuration\n'+
      '    ssl_protocols '+output.protocols.join(' ')+';\n'+
      '    ssl_ecdh_curve '+output.tlsCurves.join(':')+';\n'+
      (output.ciphers.length
        ?
      '    ssl_ciphers '+output.ciphers.join(':')+';\n'
        :
      '')+
      '    ssl_prefer_server_ciphers '+(output.serverPreferredOrder ? 'on' : 'off')+';\n';

 if (output.protocols[0] === 'TLSv1.3') {
    conf +=
      '\n'+
      '    # uncomment to enable if ssl_protocols includes TLSv1.2 or earlier;\n'+
      '    # see also ssl_session_ticket_key alternative to stateful session cache\n'+
      '    #ssl_session_timeout 1d;\n'+
      '    #ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions\n';
 }
 else {
    conf +=
      '\n'+
      '    # see also ssl_session_ticket_key alternative to stateful session cache\n'+
      '    ssl_session_timeout 1d;\n'+
      '    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions\n';
 }

 if (  !minver("1.23.2", form.serverVersion)
     && minver("1.5.9",  form.serverVersion)
     && minver("1.0.2l", form.opensslVersion)) {
    conf +=
      '    ssl_session_tickets off;\n';
 }

 if (output.usesDhe) {
    conf +=
      '\n'+
      '    # '+output.dhCommand+' > /path/to/dhparam\n'+
      '    ssl_dhparam "/path/to/dhparam";\n';
 }

 if (form.ocsp) {
    conf +=
      '\n'+
      '    # OCSP stapling\n'+
      '    ssl_stapling on;\n'+
      '    ssl_stapling_verify on;\n'+
      '\n'+
      '    # verify chain of trust of OCSP response using Root CA and Intermediate certs\n'+
      '    ssl_trusted_certificate /path/to/root_CA_cert_plus_intermediates;\n'+
      '\n'+
      '    # replace with the IP address of your resolver;\n'+
      '    # async \'resolver\' is important for proper operation of OCSP stapling\n'+
      '    resolver 127.0.0.1;\n'+
      '\n'+
      '    # If certificates are marked OCSP Must-Staple, consider managing the\n'+
      '    # OCSP stapling cache with an external script, e.g. certbot-ocsp-fetcher\n';
 }

 if (form.hsts) {
    conf +=
      '\n'+
      '    # HSTS\n'+
      '    server {\n'+
      '        listen 80 default_server;\n'+
      '        listen [::]:80 default_server;\n'+
      '\n'+
      '        return '+output.hstsRedirectCode+' https://$host$request_uri;\n'+
      '    }\n';
 }

    conf +=
      '}\n';

  return conf;
};
