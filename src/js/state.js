import configs from './configs.js';
import sstls from '../../config/server-side-tls/5.1.json';
import minver from './helpers/minver.js';


export default async function () {
  const form = document.getElementById('form-generator').elements;
  const config = form['config'].value;
  const server = form['server'].value;
  const ssc = sstls.configurations[form['config'].value];  // server side tls config for that level
  
  const url = new URL(document.location);

  // generate the fragment
  let fragment = `server=${server}&server-version=${form['server-version'].value}`;
  fragment += configs[server].supportsConfigs !== false ? `&config=${config}` : '';
  fragment += configs[server].usesOpenssl !== false && form['openssl-version'].value !== configs['openssl'].latestVersion ? `&openssl-version=${form['openssl-version'].value}` : '';
  fragment += configs[server].supportsHsts !== false && !form['hsts'].checked ? `&hsts=false` : '';
  fragment += configs[server].supportsOcspStapling !== false && !form['ocsp'].checked ? `&ocsp=false` : '';

  const date = new Date();
  const link = `${url.origin}${url.pathname}#${fragment}`;

  // we need to remove TLS 1.3 from the supported protocols if the software is too old
  let protocols = ssc.tls_versions;
  if (minver(configs[server].tls13, form['server-version'].value) === false || minver(configs['openssl'].tls13, form['openssl-version'].value) === false) {
    protocols = protocols.filter(ciphers => ciphers !== 'TLSv1.3');
  }

  let ciphers = configs[server].cipherFormat ? ssc.ciphers[configs[server].cipherFormat] : ssc.ciphers.openssl;
  if (configs[server].supportedCiphers) {
    ciphers = ciphers.filter(suite => configs[server].supportedCiphers.indexOf(suite) !== -1);
  } else {
    ciphers = ciphers;
  }

  const state = {
    form: {
      config: form['config'].value,
      hsts: form['hsts'].checked && configs[server].supportsHsts !== false,
      ocsp: form['ocsp'].checked && configs[server].supportsOcspStapling !== false,
      opensslVersion: form['openssl-version'].value,
      server,
      serverName: document.querySelector(`label[for=server-${server}]`).innerText,
      serverVersion: form['server-version'].value,      
    },
    output: {
      ciphers,
      cipherSuites: ssc.openssl_ciphersuites,
      date: date.toISOString().substr(0, 10),
      dhCommand: ssc.dh_param_size >= 2048 ? `curl ${url.origin}/ffdhe${ssc.dh_param_size}.txt` : `openssl dhparam ${ssc.dh_param_size}`,
      dhParamSize: ssc.dh_param_size,
      fragment,
      hasVersions: configs[server].hasVersions !== false,
      hstsMaxAge: ssc.hsts_min_age,
      latestVersion: configs[server].latestVersion,
      link,
      oldestClients: ssc.oldest_clients,
      opensslCiphers: ciphers,
      opensslCipherSuites: ssc.openssl_ciphersuites,
      origin: url.origin,
      protocols: protocols,
      serverPreferredOrder: ssc.server_preferred_order,
      showSupports: configs[server].showSupports !== false,
      supportsConfigs: configs[server].supportsConfigs !== false,
      supportsHsts: configs[server].supportsHsts !== false,
      supportsOcspStapling: configs[server].supportsOcspStapling !== false,
      usesDhe: ciphers.join(":").includes(":DHE") || ciphers.join(":").includes("_DHE_"), 
      usesOpenssl: configs[server].usesOpenssl !== false,
    },
    sstls,
  };

  return state;
};
