import configs from './configs.js';
import sstls from '../static/guidelines/latest.json';
import minver from './helpers/minver.js';


export default async function () {
  const form = document.getElementById('form-generator').elements;
  const config = form['config'].value;
  const server = form['server'].value;
  const ssc = sstls.configurations[form['config'].value];  // server side tls config for that level
  const supportsOcspStapling =
    configs[server].supportsOcspStapling
    && minver(configs[server].supportsOcspStapling, form['version'].value);
  
  const url = new URL(document.location);

  // generate the fragment
  let fragment = `server=${server}&version=${form['version'].value}`;
  fragment += configs[server].supportsConfigs !== false ? `&config=${config}` : '';
  fragment += configs[server].usesOpenssl !== false ? `&openssl=${form['openssl'].value}` : '';
  fragment += configs[server].supportsHsts !== false && !form['hsts'].checked ? `&hsts=false` : '';
  fragment += supportsOcspStapling && !form['ocsp'].checked ? `&ocsp=false` : '';
  fragment += `&guideline=${sstls.version}`;

  // generate the version tags
  let version_tags = `${configs[server].name} ${form['version'].value}`;
  if (configs[server].eolBefore
      && !minver(configs[server].eolBefore, form['version'].value)) {
    version_tags += ' (UNSUPPORTED; end-of-life)';
  }
  if (configs[server].usesOpenssl !== false) {
    version_tags += `, OpenSSL ${form['openssl'].value}`;
    if (!minver(configs['openssl'].eolBefore, form['openssl'].value)) {
      version_tags += ' (UNSUPPORTED; end-of-life)';
    }
  }
  version_tags += `, ${form['config'].value} config`;

  // generate the header
  const date = new Date().toISOString().substr(0, 10);
  let header = `generated ${date}, Mozilla Guideline v${sstls.version}, ${version_tags}`;
  header += configs[server].supportsHsts !== false && !form['hsts'].checked ? `, no HSTS` : '';
  header += supportsOcspStapling && !form['ocsp'].checked ? `, no OCSP` : '';

  const link = `${url.origin}${url.pathname}#${fragment}`;

  // we need to remove TLS 1.3 from the supported protocols if the software is too old
  let protocols = ssc.tls_versions;
  if (!configs[server].tls13
      || !minver(configs[server].tls13, form['version'].value)
      || !minver(configs['openssl'].tls13, form['openssl'].value)) {
    protocols = protocols.filter(ciphers => ciphers !== 'TLSv1.3');
  }

  let ciphers = configs[server].cipherFormat ? ssc.ciphers[configs[server].cipherFormat] : ssc.ciphers.openssl;
  if (configs[server].supportedCiphers) {
    ciphers = ciphers.filter(suite => configs[server].supportedCiphers.indexOf(suite) !== -1);
  } else {
    ciphers = ciphers;
  }
  if (ciphers.length && ciphers[0] === '@SECLEVEL=0') ciphers.shift();
  if (configs[server].usesOpenssl !== false && minver('3.0.0', form['openssl'].value)) {
    // set SECLEVEL=0 via cipher string to support TLSv1-1.1 "old" with OpenSSL 3.x
    if (protocols.includes('TLSv1.1')) ciphers.unshift('@SECLEVEL=0');
  }

  const state = {
    form: {
      config: form['config'].value,
      hsts: form['hsts'].checked && configs[server].supportsHsts !== false,
      ocsp: form['ocsp'].checked && supportsOcspStapling,
      opensslVersion: form['openssl'].value,
      server,
      serverName: document.querySelector(`label[for=server-${server}]`).innerText,
      serverVersion: form['version'].value,
      version_tags,
    },
    output: {
      ciphers,
      cipherSuites: ssc.ciphersuites,
      date,
      dhCommand: ssc.dh_param_size >= 2048 ? `curl ${url.origin}/ffdhe${ssc.dh_param_size}.txt` : `openssl dhparam ${ssc.dh_param_size}`,
      dhParamSize: ssc.dh_param_size,
      fragment,
      hasVersions: configs[server].hasVersions !== false,
      header,
      hstsMaxAge: ssc.hsts_min_age,
      hstsRedirectCode: 301,
      latestVersion: configs[server].latestVersion,
      link,
      oldestClients: ssc.oldest_clients,
      opensslCiphers: ciphers,
      opensslCipherSuites: ssc.ciphersuites,
      origin: url.origin,
      protocols: protocols,
      serverPreferredOrder: ssc.server_preferred_order,
      showSupports: configs[server].showSupports !== false,
      supportsConfigs: configs[server].supportsConfigs !== false,
      supportsHsts: configs[server].supportsHsts !== false,
      supportsOcspStapling: supportsOcspStapling,
      tlsCurves: ssc.tls_curves,
      usesDhe: ciphers.join(":").includes(":DHE") || ciphers.join(":").includes("_DHE_"), 
      usesOpenssl: configs[server].usesOpenssl !== false,
    },
    sstls,
  };

  return state;
};
