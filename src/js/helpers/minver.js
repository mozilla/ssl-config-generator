import normalizever from './normalizever.js';
const semverLte = require('semver/functions/lte');

export default (minimumver, curver) => {
  const min = normalizever(minimumver);
  const ver = normalizever(curver);
  return semverLte(min, ver, { includePrerelease: true, loose: true });
};
