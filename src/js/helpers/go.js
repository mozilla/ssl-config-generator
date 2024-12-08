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
      '        w.Write([]byte("This server is running the Mozilla '+form.config+' configuration.\n"))\n'+
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
      '        CurvePreferences: []tls.CurveID{\n'+
      '            tls.X25519, // Go 1.8+\n'+
      '            tls.CurveP256,\n'+
      '            tls.CurveP384,\n'+
      '            //tls.x25519Kyber768Draft00, // Go 1.23+\n'+
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
