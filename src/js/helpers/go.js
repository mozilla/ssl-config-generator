export default (form, output) => {
 var conf =
      '// '+output.header+'\n'+
      '// '+output.link+'\n'+
      'package main\n'+
      '\n'+
      'import (\n'+
      '    "crypto/tls"\n'+
      '    "log"\n'+
      '    "net/http"\n'+
      (form.hsts
        ?
      '    "time"\n'
        : '')+
      ')\n'+
      '\n'+
      'func main() {\n'+
      '    mux := http.NewServeMux()\n'+
      '    mux.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {\n'+
      (form.hsts
        ?
      '        w.Header().Add("Strict-Transport-Security", "max-age='+output.hstsMaxAge+'")\n'
        : '')+
      '        w.Write([]byte("This server is running the Mozilla '+form.config+' configuration.\\n"))\n'+
      '    })\n';

 if (form.hsts) {
    conf +=
      '\n'+
      '    go func() {\n'+
      '        redirectToHTTPS := func(w http.ResponseWriter, req *http.Request) {\n'+
      '            http.Redirect(w, req, "https://"+req.Host+req.RequestURI, http.StatusMovedPermanently)\n'+
      '        }\n'+
      '        srv := &http.Server{\n'+
      '            Handler:     http.HandlerFunc(redirectToHTTPS),\n'+
      '            ReadTimeout: 60 * time.Second, WriteTimeout: 60 * time.Second,\n'+
      '        }\n'+
      '        log.Fatal(srv.ListenAndServe())\n'+
      '    }()\n';
 }

    conf +=
      '\n';
 if (output.ciphers.length
      && output.protocols.includes('TLSv1.2')
      && !output.protocols.includes('TLSv1.1')) {
    conf +=
      '    // Due to a lack of DHE support, you -must- use an ECDSA cert to support IE 11 on Windows 7\n';
 }
    conf +=
      '    cfg := &tls.Config{\n'+
      '        MinVersion: tls.'+
                 (output.protocols[0] === 'TLSv1' ? 'VersionTLS10' : output.protocols[0].replace('TLSv1.', 'VersionTLS1'))+
                 ',\n'+
      '        CurvePreferences: []tls.CurveID{\n';
 // map output.tlsCurves strings into Go 'tls.Config.CurvePreferences' strings
 let groups_guideln = ['X25519MLKEM768','SecP256r1MLKEM768','SecP384r1MLKEM1024','X25519','prime256v1','secp384r1'];
 let groups_go      = ['X25519MLKEM768,       // Go 1.24+',
                       'SecP256r1MLKEM768,    // Go 1.26+',
                       'SecP384r1MLKEM1024,   // Go 1.26+',
                       'X25519,               // Go 1.8+',
                       'CurveP256,',
                       'CurveP384,'];
 output.tlsCurves.forEach(function(group) {
  let idx = groups_guideln.indexOf(group)
  if (idx >= 0 && groups_go[idx].length) {
    conf += '            tls.'+groups_go[idx]+'\n';
  }
 });
    conf +=
      '        },\n'+
      (output.serverPreferredOrder
        ?
      '        PreferServerCipherSuites: true,\n'
        : '');

 if (output.ciphers.length) {
    conf +=
      '        CipherSuites: []uint16{\n';
    for (let x of output.ciphers) {
      conf +=
      '            tls.'+x+',\n';
    }
    conf +=
      '        },\n';
 }

    conf +=
      '    }\n'+
      '\n'+
      '    srv := &http.Server{\n'+
      '        Addr:      ":443",\n'+
      '        Handler:   mux,\n'+
      '        TLSConfig: cfg,\n'+
      '        // Consider setting ReadTimeout, WriteTimeout, and IdleTimeout\n'+
      '        // to prevent connections from taking resources indefinitely.\n'+
      '    }\n'+
      '\n'+
      '    log.Fatal(srv.ListenAndServeTLS(\n'+
      '        "/path/to/signed_cert_plus_intermediates",\n'+
      '        "/path/to/private_key",\n'+
      '    ))\n'+
      '}\n';

  return conf;
};
