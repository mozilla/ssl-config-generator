import $ from 'jquery';

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


const render = async () => {

  // initial introduction
  if (document.getElementById('form-generator').server.value === '') {
    document.getElementById('output-config').innerHTML = '';
    document.getElementById('copy').classList.toggle('d-none', true);
    return;
  }

  const _state = await state();

  // enable and disable the appropriate fields
  $('#version').toggleClass('text-disabled', _state.output.hasVersions === false);
  $('#openssl').toggleClass('text-disabled', _state.output.usesOpenssl === false);
  $('#hsts').prop('disabled', _state.output.supportsHsts === false);
  $('#ocsp').prop('disabled', !_state.output.supportsOcspStapling);

  // update the fragment
  if (gHaveSettingsChanged) {
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


// set a listen on the form to update the state
$().ready(() => {
  // set all the buttons to the right thing
  if (window.location.hash.length > 0) {
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
      $('#version').val(configs[params.get('server')].latestVersion);
    }

    for (let entry of params.entries()) {
      // if it's in the mappings, we should do a find/replace
      entry[1] = mappings[entry[1]] === undefined ? entry[1] : mappings[entry[1]];

      if (validHashKeys.includes(entry[0])) {
        // find the element
        let e = document.getElementById(entry[0]) || document.querySelector(`input[name="${entry[0]}"][value="${entry[1]}"]`);

        if (!e || !e.type) {
          continue;
        }

        switch (e.type) {
          case 'radio':
          case 'checkbox':
            e.checked = entry[1];
            break;
          case 'text':
            e.value = entry[1];
        }

      }
    }
  }

  // update the global state with the default values
  render();

  // update state anytime the form is changed
  $('#form-config, #form-environment').on('change', async () => {
    gHaveSettingsChanged = true;
    render();
  });

  // anytime the server changes, so does the server version
  $('.form-server').on('change', async () => {
    gHaveSettingsChanged = true;
    const _state = await state();
    $('#version').val(_state.output.latestVersion);

    render();
  });

  // instantiate tooltips
  var copy_btn = document.getElementById('copy');
  var copy_tt = new BSN.Tooltip(copy_btn, { trigger: "manual", delay: 750, title: "Copied!" });

  // instantiate clipboard thingie
  const clipboard = new ClipboardJS('#copy');
  clipboard.on('success', async e => {
    e.clearSelection();
    copy_tt.show();
    await sleep(750);
    copy_tt.hide();
  });
});
