import minver from './minver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n';

 if (form.hsts) {
    conf +=
      '<VirtualHost *:80>\n'+
      '    RewriteEngine On\n'+
      '    RewriteCond %{REQUEST_URI} !^/\.well\-known/acme\-challenge/\n'+
      '    RewriteRule ^.*$ https://%{HTTP_HOST}%{REQUEST_URI} [R='+output.hstsRedirectCode+',QSA,L]\n'+
      '</VirtualHost>\n'+
      '\n';
 }

    conf +=
      '<VirtualHost *:443>\n'+
      '    SSLEngine on\n'+
      '    SSLWallet           /path/to/wallet\n';

 if (form.hsts) {
    conf +=
      '\n'+
      '    # HTTP Strict Transport Security (mod_headers is required) ('+output.hstsMaxAge+' seconds)\n'+
      '    Header always set Strict-Transport-Security "max-age='+output.hstsMaxAge+'"\n';
 }

    conf +=
      '</VirtualHost>\n'+
      '\n'+
      '# '+form.config+' configuration\n'+
      'SSLProtocol             -all +'+output.protocols.join(' +')+'\n'+
      'SSLCipherSuite          '+output.ciphers.join(':')+'\n'+
      (minver("12.2.1", form.serverVersion)
        ?
      'SSLHonorCipherOrder     '+(output.serverPreferredOrder ? 'on' : 'off')+'\n'
        : '');

  return conf;
};
