import merge from 'deepmerge'
import { LocaleMessages } from "vue-i18n";
import afilmedI18n from '../modules/afilmed/i18n/index'
import baseI18n from '../modules/base/i18n/index'
import callerI18n from '../modules/caller/i18n/index'
import collectionsI18n from '../modules/collections/i18n/index'
import mailI18n from '../modules/mail/i18n/index'
import premedicI18n from '../modules/premedic/i18n/index'
import transferenciasI18n from '../modules/transferencias/i18n/index'

const modulesI18n = merge.all([
  afilmedI18n,
  baseI18n,
  callerI18n,
  collectionsI18n,
  mailI18n,
  premedicI18n,
  transferenciasI18n,
]) as LocaleMessages<never>

export default modulesI18n

export {
  modulesI18n
}
