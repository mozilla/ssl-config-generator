import configs from './configs.js';
import sstls from '../../config/server-side-tls-conf.json';


export default async function () {
  const form = document.getElementById('form-generator').elements;
  const config = form['config'].value;
  const server = form['server'].value;
  const ssc = sstls.configurations[form['config'].value];  // server side tls config for that level
  
  const url = new URL(document.location);

  // generate the fragment
  let fragment = `server=${server}&server-version=${form['server-version'].value}`;
  fragment += configs[server].supportsConfigs !== false ? `&config=${config}` : '';
  fragment += configs[server].usesOpenssl !== false ? `&openssl-version=${form['openssl-version'].value}` : '';
  fragment += configs[server].supportsHsts !== false ? `&hsts=${form['hsts'].checked}` : '';
  fragment += configs[server].supportsOcspStapling !== false ? `&ocsp=${form['ocsp'].checked}` : '';

  const date = new Date();
  const link = `${url.origin}${url.pathname}#${fragment}`;

  const state = {
    form: {
      config: form['config'].value,
      hsts: form['hsts'].checked && configs[server].supportsHsts !== false,
      ocsp: form['ocsp'].checked && configs[server].supportsOcspStapling !== false,
      opensslVersion: form['openssl-version'].value,
      server,
      serverVersion: form['server-version'].value,      
    },
    output: {
      cipherSuites: ssc.openssl_ciphersuites,
      date: date.toISOString().substr(0, 10),
      fragment,
      hasVersions: configs[server].hasVersions !== false,
      hstsMaxAge: ssc.hsts_min_age,
      latestVersion: configs[server].latestVersion,
      link,
      oldestClients: ssc.oldest_clients,
      origin: url.origin,
      protocols: ssc.tls_versions,
      supportsConfigs: configs[server].supportsConfigs !== false,
      supportsHsts: configs[server].supportsHsts !== false,
      supportsOcspStapling: configs[server].supportsOcspStapling !== false,
      supportedCiphers: configs[server].supportedCiphers,
      usesOpenssl: configs[server].usesOpenssl !== false,
    },
    sstls,
  };

  return state;
};
