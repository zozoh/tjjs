import _ from 'lodash';
import { I18nLang, I18nSet, MessageMap, Str, Vars } from '../ti';

const I18N = {} as MessageMap;
function __MSG(key: string): string {
  let k2 = key.replace(/\./g, '-');
  return I18N[k2];
}

export function createEmptyI18nSet(): I18nSet {
  return {
    en_us: {},
    en_uk: {},
    zh_cn: {},
    zh_hk: {},
  };
}

export function all() {
  return I18N;
}
export function putAll(msgs: MessageMap) {
  _.assign(I18N, msgs);
}

export function get(key: string, dft?: string): string {
  return __MSG(key) ?? dft ?? key;
}

export function text(str: string, dft?: string) {
  // key as String
  let m = /^i18n:(.+)$/.exec(str);
  if (m) {
    return get(m[1], dft);
  }
  return dft ?? str;
}

export function textOr(str?: string, dft?: string) {
  if (!str) {
    return;
  }
  return text(str, dft);
}

export function textOrKey(str: string, dft?: string) {
  // key as String
  let m = /^i18n:(.+)$/.exec(str);
  if (m) {
    return get(m[1], dft);
  }
  return get(str, dft);
}

export function getf(key: string, vars = {} as Vars): string {
  let msg = __MSG(key);
  if (msg) {
    return Str.renderTmpl(msg, vars);
  }
  return key;
}

export function textf(str: string, vars = {} as Vars): string {
  let m = /^i18n:(.+)$/.exec(str);
  if (m) {
    return getf(m[1], vars);
  }
  return Str.renderTmpl(str, vars);
}

// explain(str) {
//   let s = _.trim(str);
//   let pos = s.indexOf(":");
//   if (pos > 0) {
//     let code = _.trim(s.substring(0, pos));
//     let data = _.trim(s.substring(pos + 1));
//     console.log({ code, data });
//     return Ti18n.getf(code, { val: data });
//   }
//   return Ti18n.get(s);
// },
export function translate(str: string) {
  let s = _.trim(str);
  let pos = s.indexOf(':');
  if (pos > 0) {
    let code = _.trim(s.substring(0, pos));
    let data = _.trim(s.substring(pos + 1));
    return get(code) + ' : ' + data;
  }
  return get(s);
}

const _i18n_set = {
  en_us: {},
  en_uk: {},
  zh_cn: {},
  zh_hk: {},
} as I18nSet;

export function toLangKey(lang: string): I18nLang {
  if (_i18n_set[lang as I18nLang]) {
    return lang as I18nLang;
  }

  let key = _.snakeCase(lang);
  if (_i18n_set[key as I18nLang]) {
    return key as I18nLang;
  }

  throw new Error(`Invalid I18n language key: "${lang}"`);
}
