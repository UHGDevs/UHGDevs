
class Util {

  static mergeSettings(def, given) {
    if (!given) return def;
    for (const key in def) {
      if (!Object.hasOwn(given, key) || given[key] === undefined) given[key] = def[key];
      else if (given[key] === Object(given[key])) given[key] = Util.mergeSettings(def[key], given[key]);
    }
    return given;
  }
}

module.exports = Util
