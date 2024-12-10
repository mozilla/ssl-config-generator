import normalizever from './normalizever.js';
const semverLte = require('semver/functions/lte');
const semverParse = require('semver/functions/parse');

// returns true if it meets the minimum patch version
// *and* is the same major and minor version (e.g. 2.2)
export default (minimumver, curver) => {
  const min = normalizever(minimumver);
  const ver = normalizever(curver);
  const pmin = semverParse(minimumver, { loose: true });
  const pver = semverParse(curver, { loose: true });
  return pmin && pver && pmin.major == pver.major && pmin.minor == pver.minor
      && semverLte(min, ver, { includePrerelease: true, loose: true });
};
