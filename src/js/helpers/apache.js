import minver from './minver.js';
import minpatchver from './minpatchver.js';

export default (form, output) => {
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '\n'+
      '# this configuration requires mod_ssl'+
      (form.hsts ? ', mod_rewrite,'+(!form.ocsp ? ' and' : '')+' mod_headers' : '')+
      (form.ocsp ? (form.hsts ? ',' : '')+' and mod_socache_shmcb' : '')+
      '\n';

 if (form.hsts) {
    conf +=
      '<VirtualHost *:80>\n'+
      '    RewriteEngine On\n'+
      '    RewriteCond %{REQUEST_URI} !^/\.well\-known/acme\-challenge/\n'+
      '    RewriteRule ^.*$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,QSA,L]\n'+
      '</VirtualHost>\n'+
      '\n';
 }

    conf +=
      '<VirtualHost *:443>\n'+
      '    SSLEngine on\n';

 if (minver("2.4.7",form.serverVersion)) {
  if (output.usesDhe) {
    conf +=
      '\n'+
      '    # '+output.dhCommand+' >> /path/to/signed_cert_and_intermediate_certs_and_dhparams\n'+
      '    SSLCertificateFile      /path/to/signed_cert_and_intermediate_certs_and_dhparams\n';
  }
  else {
    conf +=
      '    SSLCertificateFile      /path/to/signed_cert_and_intermediate_certs\n';
  }
 }
 else {
    conf +=
      '    SSLCertificateFile      /path/to/signed_certificate\n'+
      '    SSLCertificateChainFile /path/to/intermediate_certificate\n';
 }

    conf +=
      '    SSLCertificateKeyFile   /path/to/private_key\n';

 if (minver("2.4.17",form.serverVersion)) {
    conf +=
      '\n'+
      '    # enable HTTP/2, if available\n'+
      '    Protocols h2 http/1.1\n';
 }

 if (form.hsts) {
    conf +=
      '\n'+
      '    # HTTP Strict Transport Security (mod_headers is required) ('+output.hstsMaxAge+' seconds)\n'+
      '    Header'+(minver("2.0.0", form.serverVersion) ? ' always' : '')+' set Strict-Transport-Security "max-age='+output.hstsMaxAge+'"\n';
 }

    conf +=
      '</VirtualHost>\n'+
      '\n'+
      '# '+form.config+' configuration\n'+
      'SSLProtocol             '+output.protocols.join(' ')+'\n'+
      (minver("2.4.11", form.serverVersion)
        ?
      'SSLOpenSSLConfCmd       Curves '+output.tlsCurves.join(':')+'\n'
        : '')+
      (output.ciphers.length
        ?
      'SSLCipherSuite          '+output.ciphers.join(':')+'\n'
        : '')+
      'SSLHonorCipherOrder     '+(output.serverPreferredOrder ? 'on' : 'off')+'\n'+
      (minpatchver("2.2.30", form.serverVersion) ||
       (minver("2.4.11", form.serverVersion) && minver("1.0.2", form.opensslVersion))
        ?
      'SSLSessionTickets       off\n'
        : '');

 if (form.ocsp) {
    conf +=
      '\n'+
      'SSLUseStapling On\n'+
      'SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"\n';
 }

  return conf;
};
