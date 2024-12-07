// bootstrap.native used only by 'copy' button tooltip
import * as BSN from "bootstrap.native";
import ClipboardJS from 'clipboard';

import { sep } from 'path';

// Import only the used highlights from highlight.js (saves about 1MB)
// import hljs from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import apache from 'highlight.js/lib/languages/apache';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import json from 'highlight.js/lib/languages/json';
import nginx from 'highlight.js/lib/languages/nginx';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
hljs.registerLanguage('apache', apache);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('json', json);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

import '../css/index.scss';

import { validHashKeys } from './constants.js';
import configs from './configs.js';
import state from './state.js';
import { sleep } from './utils.js';


// note if any button has changed so that we can update the fragment if it has
let gHaveSettingsChanged = false;

// import all the templates by name, e.g. apache --> require(apache.hbs)
const templates = {};
const templateContext = require.context('../templates/partials', true, /\.hbs$/);
templateContext.keys().forEach(key => {
  templates[key.split(sep).slice(-1)[0].split('.')[0]] = templateContext(key);
});


function xmlEntities(str) {
  return String(str).replace(/["&'<>`]/g,
           function (x) { return '&#x'+x.codePointAt(0).toString(16)+';'; });
}


const render = async () => {

  // initial introduction
  if (document.getElementById('form-generator').server.value === '') {
    document.getElementById('output-config').innerHTML = '';
    document.getElementById('copy').classList.toggle('d-none', true);
    return;
  }

  const _state = await state();

  // enable and disable the appropriate fields
  document.getElementById('version').classList.toggle('text-disabled', _state.output.hasVersions === false);
  document.getElementById('openssl').classList.toggle('text-disabled', _state.output.usesOpenssl === false);
  document.getElementById('hsts').classList.toggle('d-none', _state.output.supportsHsts === false);
  document.getElementById('ocsp').classList.toggle('d-none', !_state.output.supportsOcspStapling);

  // update the fragment
  if (gHaveSettingsChanged) {
    gHaveSettingsChanged = false;
    window.location.hash = _state.output.fragment;
  }
  
  // render the output header
  let header = `<h3>${_state.form.version_tags}</h3>\n`;
  if (_state.output.showSupports) {
    header += '<h6 id="output-clients">\n  Supports '+_state.output.oldestClients.join(', ')+'</h6>\n';
  }
  document.getElementById('output-header').innerHTML = header;

  if (_state.output.protocols.length === 0) {
    document.getElementById('output-config').innerHTML =
      `# unfortunately, ${_state.form.version_tags} is not supported with these software versions.`;
    // hide copy button
    document.getElementById('copy').classList.toggle('d-none', true);
    return;
  }

  // render the config file for whichever server software we're using
  const renderedTemplate = templates[_state.form.server](_state);

  // show copy button
  document.getElementById('copy').classList.toggle('d-none', false);
  
  // syntax highlight and enter into the page
  const highlighter = configs[_state.form.server].highlighter;

  document.getElementById('output-config').innerHTML = hljs.highlight(renderedTemplate, {language: highlighter, ignoreIllegals: true}).value;
};


function form_config_init() {
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
}


function init_once() {

  // set all the buttons to the right thing
  if (window.location.hash.length > 0) {
    form_config_init();
  }

  // update the global state with the default values
  render();

  // set listeners on the form to update state any time form is changed
  document.getElementById('form-config').addEventListener('change', async () => {
    gHaveSettingsChanged = true;
    render();
  });
  document.getElementById('form-environment').addEventListener('change', async () => {
    gHaveSettingsChanged = true;
    render();
  });
  function form_server_change() {
    const form = document.getElementById('form-generator').elements;
    const version = document.getElementById('version');
    version.value = configs[form['server'].value].latestVersion;
    gHaveSettingsChanged = true;
    render();
  }
  document.getElementById('form-server-1').addEventListener('change', async () => {
    form_server_change();
  });
  document.getElementById('form-server-2').addEventListener('change', async () => {
    form_server_change();
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
