const semverCoerce = require('semver/functions/coerce');

export default (version) => {
  // convert to string, just in case
  version = String(version);
  // special-case openssl 0.X.Xw and 1.X.Xw non-semantic versions into
  // semantic versions by bumping patch version and adding letter as prerelease
  const v = version.match(/([01]\.\d+\.)(\d+)([a-z])/i);
  return v
    ? `${v[1]}${parseInt(v[2])+1}-${v[3]}`
    : semverCoerce(version, { includePrerelease: true, loose: true }).version;
};
