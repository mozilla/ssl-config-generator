import minver from './minver.js';

export default (form, output) => {
 var minver_4 = minver("4", form.serverVersion);
 var opts =
      '  options='+
           (minver_4 ? 'NO_SSLV3' : 'NO_SSLv2,NO_SSLv3')+
           (!output.protocols.includes('TLSv1')   ? ',NO_TLSv1'   : '')+
           (!output.protocols.includes('TLSv1.1') ? ',NO_TLSv1_1' : '')+
           (!output.protocols.includes('TLSv1.2') ? ',NO_TLSv1_2' : '')+
           ',NO_TICKET';

 if (output.ciphers.length) {
    opts +=
      ' \\\n'+
      '  cipher='+output.ciphers.join(':');
 }

 if (output.usesDhe) {
    opts +=
      ' \\\n'+
      '  tls-dh=/path/to/dhparam  # '+output.dhCommand+' > /path/to/dhparam';
 }

    opts +=
      '\n';

 var tlsprefix = minver_4 ? 'tls-' : '';
 var conf =
      '# '+output.header+'\n'+
      '# '+output.link+'\n'+
      '\n'+
      '# The following example shows Squid configured as a cache proxy with SSL bump enabled\n'+
      '\n'+
      'http_port 3128 ssl-bump \\\n'+
      '  '+tlsprefix+'cert=/path/to/ca_signing_cert \\\n'+
      '  '+tlsprefix+'key=/path/to/ca_signing_private_key \\\n'+
      opts+
      '\n'+
      'sslcrtd_program /usr/lib/squid/'+(minver_4 ? 'security_file_certgen' : 'ssl_crtd')+' -s /var/cache/squid/ssl_db -M 4MB\n'+
      'acl step1 at_step SslBump1\n'+
      'ssl_bump peek step1\n'+
      'ssl_bump bump all\n'+
      '\n'+
      '\n'+
      '# The following example shows Squid configured as a reverse Proxy / Accelerator\n'+
      '\n'+
      'https_port 443 accel defaultsite=example.net \\\n'+
      '  '+tlsprefix+'cert=/path/to/signed_cert_plus_intermediates \\\n'+
      '  '+tlsprefix+'key=/path/to/private_key \\\n'+
      opts;

  return conf;
};
