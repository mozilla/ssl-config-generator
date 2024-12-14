// bootstrap.native used only by 'copy' button tooltip
import * as BSN from "bootstrap.native";
import ClipboardJS from 'clipboard';

import '../css/index.scss';

import { validHashKeys } from './constants.js';
import configs from './configs.js';
import state from './state.js';
import { sleep, xmlEntities } from './utils.js';


// note if any button has changed so that we can update the fragment if it has
let gHaveSettingsChanged = false;
let gHashUpdatedInternal = false;

// import all the templates by name, e.g. apache --> require(./helpers/apache.js)
const templates = {};
for (let x of Object.keys(configs)) {
  if (x === "openssl") continue;
  templates[x] = require("./helpers/"+x+".js").default;
}


const render = async () => {

  document.getElementById('version').readOnly = false;
  document.getElementById('openssl').readOnly = false;

  // initial introduction
  if (document.getElementById('form-generator').server.value === '') {
    document.getElementById('output-header').innerHTML =
`
      <div class="h3 pb-3">Getting Started</div>
      <p>Select an application server in Server Software (above) to generate a sample TLS configuration.</p>
      <p>When using sample TLS configurations, replace example.com with your server name (e.g. hostname) and replace /path/to/... with actual paths to your local files.</p>
`;
    document.getElementById('output-config').innerText = '';
    document.getElementById('output-config-container').classList.toggle('d-none', true);
    document.getElementById('version').classList.toggle('text-disabled', true);
    document.getElementById('openssl').classList.toggle('text-disabled', true);
    document.getElementById('version').readOnly = true;
    document.getElementById('openssl').readOnly = true;
    document.getElementById('hsts').classList.toggle('d-none', true);
    document.getElementById('ocsp').classList.toggle('d-none', true);
    document.getElementById('copy').classList.toggle('d-none', true);
    gHaveSettingsChanged = false;
    return;
  }
  document.getElementById('output-config-container').classList.toggle('d-none', false);

  const _state = await state();

  // enable and disable the appropriate fields
  document.getElementById('version').classList.toggle('text-disabled', _state.output.hasVersions === false);
  document.getElementById('version').readOnly = _state.output.hasVersions === false;
  document.getElementById('openssl').classList.toggle('text-disabled', _state.output.usesOpenssl === false);
  document.getElementById('openssl').readOnly = _state.output.usesOpenssl === false;
  document.getElementById('hsts').classList.toggle('d-none', _state.output.supportsHsts === false);
  document.getElementById('ocsp').classList.toggle('d-none', !_state.output.supportsOcspStapling);

  // update the fragment only if changed
  if (window.location.hash !== _state.output.fragment) {
    gHashUpdatedInternal = true;
    window.location.hash = _state.output.fragment;
  }

  gHaveSettingsChanged = false;

  // render the output header
  let header = `<h3>${_state.form.version_tags}</h3>\n`;
  if (_state.output.showSupports) {
    header += '<h6 id="output-clients">\n  Supports '+_state.output.oldestClients.join(', ')+'</h6>\n';
  }
  document.getElementById('output-header').innerHTML = header;

  if (_state.output.protocols.length === 0) {
    document.getElementById('output-config').innerText =
      `# unfortunately, ${_state.form.version_tags} is not supported with these software versions.`;
    // hide copy button
    document.getElementById('copy').classList.toggle('d-none', true);
    return;
  }

  // show copy button
  document.getElementById('copy').classList.toggle('d-none', false);

  // render the config file for whichever server software we're using
  const renderedTemplate = templates[_state.form.server](_state.form, _state.output);

  document.getElementById('output-config').innerText = renderedTemplate;
};


function form_config_init() {
    if (window.location.hash.length === 0) {
      gHaveSettingsChanged = true;
      const server = document.getElementById('form-generator').server;
      if (server.value !== '') {
        document.getElementById(`server-${server.value}`).checked = false;
      }
      document.getElementById('version').value = '';
      document.getElementById('openssl').value = '';
      gHaveSettingsChanged = false;
      return;
    }

    const mappings = {
      'true': true,
      'false': false,
    };

    const params = new URLSearchParams(window.location.hash.substr(1));

    // some parameters have been renamed from the old SSL Configuration Generator
    if (params.get('server-version') !== null) {
      params.set('version', params.get('server-version'));
    }
    if (params.get('openssl-version') !== null) {
      params.set('openssl', params.get('openssl-version'));
    }

    gHaveSettingsChanged = true;

    // set the default server version, if we're loading and have "server" but not "version"
    if (params.get('server') !== null && params.get('version') === null) {
      const e_version = document.getElementById('version')
      e_version.value = configs[params.get('server')].latestVersion;
    }

    for (let entry of params.entries()) {
      if (validHashKeys.includes(entry[0])) {
        // find the element
        let e = document.getElementById(entry[0]) || document.querySelector(`input[name="${entry[0]}"][value="${entry[1]}"]`);

        if (!e || !e.type) {
          continue;
        }

        switch (e.type) {
          case 'radio':
          case 'checkbox':
            // if it's in the mappings, we should do a find/replace
            e.checked = mappings[entry[1]] === undefined ? !!entry[1] : mappings[entry[1]];
            break;
          case 'text':
            e.value = xmlEntities(entry[1]);
        }

      }
    }

    gHaveSettingsChanged = false;
}


function form_change_event (server_change) {
  if (gHaveSettingsChanged) { return; }
  gHaveSettingsChanged = true;
  if (server_change) {
    const form = document.getElementById('form-generator').elements;
    const version = document.getElementById('version');
    version.value = configs[form['server'].value].latestVersion;
    const openssl = document.getElementById('openssl');
    if (!openssl.value) {
      openssl.value = configs.openssl.latestVersion;
    }
  }
  render();
}


function hash_change_event () {
  if (gHashUpdatedInternal) {
    gHashUpdatedInternal = false;
  }
  else {
    form_config_init();
    render();
  }
}


function init_once() {

  // update the global state with the default values
  hash_change_event();

  // set listener to update state when URL hash is changed
  // e.g. via navigation of Back or Forward buttons
  window.addEventListener('hashchange', (event) => {
    hash_change_event();
  });

  // set listeners on the form to update state any time form is changed
  document.getElementById('form-config').addEventListener('change', async () => {
    form_change_event(false);
  });
  document.getElementById('form-environment').addEventListener('change', async () => {
    form_change_event(false);
  });
  document.getElementById('form-server-1').addEventListener('change', async () => {
    form_change_event(true);
  });
  document.getElementById('form-server-2').addEventListener('change', async () => {
    form_change_event(true);
  });

  // instantiate tooltips
  const copy_btn = document.getElementById('copy');
  const copy_tt = new BSN.Tooltip(copy_btn, { trigger: "manual", delay: 500, title: "Copied!" });

  // instantiate clipboard thingie
  const clipboard = new ClipboardJS('#copy');
  clipboard.on('success', async e => {
    e.clearSelection();
    copy_tt.show();
    await sleep(250);
    copy_tt.hide();
  });
}


if (document.readyState === "loading") {
  // Loading hasn't finished yet
  document.addEventListener("DOMContentLoaded", init_once);
}
else {
  // `DOMContentLoaded` has already fired
  init_once();
}
