/*
  Read more about our custom configuration and use of Google Analytics here:
  https://bugzilla.mozilla.org/show_bug.cgi?id=1122305#c8
*/

const doNotTrack = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack;

if (doNotTrack !== '1' && doNotTrack !== 'yes') {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag(
    'config',
    'UA-66267220-1',
    {
      'anonymize_ip': true,
    }
  );
}