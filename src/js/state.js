import configs from './configs.js';
import minver from './helpers/minver.js';
import { xmlEntities } from './utils.js';

const guidelines = {};
guidelines['5.7'] = require(`../static/guidelines/5.7.json`);
const guideln_latest = '5.7'; // update these two lines when guideline changes

export default async function () {

  async function fetch_guideline(guideln) {
    // check for numerical version string, e.g. digit.digit
    if (isNaN(guideln) || isNaN(parseFloat(guideln))) {
      return guideln_latest; // invalid numerical version string
    }
    const url = "https://ssl-config.mozilla.org/guidelines/"+guideln+".json";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`error retrieving ${guideln}.json: ${response.status}`);
      }

      guidelines[guideln] = await response.json();
      return guideln;
    } catch (error) {
      console.error(error.message);
      return guideln_latest;
    }
  }

  const form = document.getElementById('form-generator').elements;
  const config = form['config'].value;
  const server = form['server'].value;
  let  guideln = form['guideline'].value !== ''
               ? form['guideline'].value
               : guideln_latest;
  let sstls = guidelines[guideln];
  if (!sstls) {
      guideln = await fetch_guideline(guideln);
      if (guideln === '5.0') {
        if (await fetch_guideline('5.1') === '5.1') {
          // re-map keys from older guideline 5.0
          for (let x of ['modern', 'intermediate', 'old']) {
            let ss5 = guidelines['5.0'].configurations[x];  // server side tls config for that level
            ss5.ciphersuites = ss5.openssl_ciphersuites;
            ss5.ciphers = { // copy iana from 5.1 guideline
              iana: guidelines['5.1'].configurations[x].ciphers.iana,
              openssl: ss5.openssl_ciphers
            };
          }
        }
        else {
          guideln = guideln_latest;
        }
      }
      // note: sstls.version for '5.0' is rendered as number 5, not string '5.0'
      sstls = guidelines[guideln];
  }
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
  fragment += `&guideline=${guideln}`;

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

  // html-escape version_tags (even though version_tags is also used
  // outside HTML contexts, HTML is not expected in version strings)
  version_tags = xmlEntities(version_tags);

  // generate the header
  const date = new Date().toISOString().substr(0, 10);
  let header = `generated ${date}, Mozilla Guideline v${guideln}, ${version_tags}`;
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
      serverName: configs[server].name,
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
  };

  return state;
};
