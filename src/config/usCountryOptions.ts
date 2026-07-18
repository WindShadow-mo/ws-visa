// usCountryOptions.ts — 美国签证 DS-160 所有下拉选项数据
// 数据来源于 docs/us-visa-ds160-form-design-v2.md 附录 A + 各章节

import type { SelectOption } from '@/components/fields/SelectField.vue'

const NS = 'usVisa.options'

// ---- 类型标记 ----
// 'c' = 主权国家（国籍选择）
// 'r' = 地区/领地/特殊行政区（非主权，如港澳台、海外领地）
// 'a' = 政治当局/超国家实体（可签发旅行证件，如 EU、UN）
type EntryType = 'c' | 'r' | 'a'
interface TypedEntry extends SelectOption { type: EntryType }

// 非主权地区/领地
const REGION_CODES = new Set([
  'HK', 'MO', 'TW', 'HK_BNO',
  'AI', 'ARUBA', 'BM', 'BONAIRE', 'CHRISTMAS_ISLAND', 'COOK_ISLANDS', 'CURACAO', 'EH',
  'FK', 'FO', 'GAZA', 'GI', 'GL', 'GP', 'GU', 'JERUSALEM', 'KY', 'YT', 'NC', 'NU',
  'NF', 'MP', 'MS', 'NIRELAND', 'PALESTINE', 'PALMYRA', 'PN', 'PR', 'REUNION', 'SABA',
  'SAINT_MARTIN', 'SINT_MAARTEN', 'SGSSI', 'SH', 'ST_EUSTATIUS', 'PM',
  'ST_MARTIN', 'SVALBARD', 'TC', 'TK', 'VI', 'VG', 'WAKE', 'WEST_BANK', 'WF',
])

// 政治当局/超国家实体（非主权国家但可签发旅行证件）
const AUTHORITY_CODES = new Set(['EU', 'UN', 'STATELESS', 'STATUS_NEUTRAL'])

// ponytail: type 默认 'c'，只有非主权条目才显式标记
function t(value: string, labelKey: string): TypedEntry {
  if (REGION_CODES.has(value)) return { value, labelKey, type: 'r' }
  if (AUTHORITY_CODES.has(value)) return { value, labelKey, type: 'a' }
  return { value, labelKey, type: 'c' }
}

// ---- 国家/地区列表（A.1 + A.3 扩展，~248 项）----
// 全量列表：用于"国家或地区"选择（地址、出生地、旅行记录等）

export const usCountryOptions: SelectOption[] = [
  t('AF', `${NS}.countries.AF`),
  t('AL', `${NS}.countries.AL`),
  t('DZ', `${NS}.countries.DZ`),
  t('AD', `${NS}.countries.AD`),
  t('AO', `${NS}.countries.AO`),
  t('AI', `${NS}.countries.AI`),
  t('AG', `${NS}.countries.AG`),
  t('AR', `${NS}.countries.AR`),
  t('AM', `${NS}.countries.AM`),
  t('AU', `${NS}.countries.AU`),
  t('AT', `${NS}.countries.AT`),
  t('AZ', `${NS}.countries.AZ`),
  t('BS', `${NS}.countries.BS`),
  t('BH', `${NS}.countries.BH`),
  t('BD', `${NS}.countries.BD`),
  t('BB', `${NS}.countries.BB`),
  t('BY', `${NS}.countries.BY`),
  t('BE', `${NS}.countries.BE`),
  t('BZ', `${NS}.countries.BZ`),
  t('BJ', `${NS}.countries.BJ`),
  t('BM', `${NS}.countries.BM`),
  t('BT', `${NS}.countries.BT`),
  t('BO', `${NS}.countries.BO`),
  t('BA', `${NS}.countries.BA`),
  t('BW', `${NS}.countries.BW`),
  t('BR', `${NS}.countries.BR`),
  t('BN', `${NS}.countries.BN`),
  t('BG', `${NS}.countries.BG`),
  t('BF', `${NS}.countries.BF`),
  t('MM', `${NS}.countries.MM`),
  t('BI', `${NS}.countries.BI`),
  t('KH', `${NS}.countries.KH`),
  t('CM', `${NS}.countries.CM`),
  t('CA', `${NS}.countries.CA`),
  t('CV', `${NS}.countries.CV`),
  t('KY', `${NS}.countries.KY`),
  t('CF', `${NS}.countries.CF`),
  t('TD', `${NS}.countries.TD`),
  t('CL', `${NS}.countries.CL`),
  t('CN', `${NS}.countries.CN`),
  t('CO', `${NS}.countries.CO`),
  t('KM', `${NS}.countries.KM`),
  t('CD', `${NS}.countries.CD`),
  t('CG', `${NS}.countries.CG`),
  t('CR', `${NS}.countries.CR`),
  t('CI', `${NS}.countries.CI`),
  t('HR', `${NS}.countries.HR`),
  t('CU', `${NS}.countries.CU`),
  t('CY', `${NS}.countries.CY`),
  t('CZ', `${NS}.countries.CZ`),
  t('DK', `${NS}.countries.DK`),
  t('DJ', `${NS}.countries.DJ`),
  t('DM', `${NS}.countries.DM`),
  t('DO', `${NS}.countries.DO`),
  t('EC', `${NS}.countries.EC`),
  t('EG', `${NS}.countries.EG`),
  t('SV', `${NS}.countries.SV`),
  t('GQ', `${NS}.countries.GQ`),
  t('ER', `${NS}.countries.ER`),
  t('EE', `${NS}.countries.EE`),
  t('SZ', `${NS}.countries.SZ`),
  t('ET', `${NS}.countries.ET`),
  t('FJ', `${NS}.countries.FJ`),
  t('FI', `${NS}.countries.FI`),
  t('FR', `${NS}.countries.FR`),
  t('GA', `${NS}.countries.GA`),
  t('GM', `${NS}.countries.GM`),
  t('GE', `${NS}.countries.GE`),
  t('DE', `${NS}.countries.DE`),
  t('GH', `${NS}.countries.GH`),
  t('GI', `${NS}.countries.GI`),
  t('GR', `${NS}.countries.GR`),
  t('GD', `${NS}.countries.GD`),
  t('GT', `${NS}.countries.GT`),
  t('GN', `${NS}.countries.GN`),
  t('GW', `${NS}.countries.GW`),
  t('GY', `${NS}.countries.GY`),
  t('HT', `${NS}.countries.HT`),
  t('VA', `${NS}.countries.VA`),
  t('HN', `${NS}.countries.HN`),
  t('HK_BNO', `${NS}.countries.HK_BNO`),
  t('HK', `${NS}.countries.HK`),
  t('HU', `${NS}.countries.HU`),
  t('IS', `${NS}.countries.IS`),
  t('IN', `${NS}.countries.IN`),
  t('ID', `${NS}.countries.ID`),
  t('IR', `${NS}.countries.IR`),
  t('IQ', `${NS}.countries.IQ`),
  t('IE', `${NS}.countries.IE`),
  t('IL', `${NS}.countries.IL`),
  t('IT', `${NS}.countries.IT`),
  t('JM', `${NS}.countries.JM`),
  t('JP', `${NS}.countries.JP`),
  t('JO', `${NS}.countries.JO`),
  t('KZ', `${NS}.countries.KZ`),
  t('KE', `${NS}.countries.KE`),
  t('KI', `${NS}.countries.KI`),
  t('KP', `${NS}.countries.KP`),
  t('KR', `${NS}.countries.KR`),
  t('XK', `${NS}.countries.XK`),
  t('KW', `${NS}.countries.KW`),
  t('KG', `${NS}.countries.KG`),
  t('LA', `${NS}.countries.LA`),
  t('LV', `${NS}.countries.LV`),
  t('LB', `${NS}.countries.LB`),
  t('LS', `${NS}.countries.LS`),
  t('LR', `${NS}.countries.LR`),
  t('LY', `${NS}.countries.LY`),
  t('LI', `${NS}.countries.LI`),
  t('LT', `${NS}.countries.LT`),
  t('LU', `${NS}.countries.LU`),
  t('MO', `${NS}.countries.MO`),
  t('MK', `${NS}.countries.MK`),
  t('MG', `${NS}.countries.MG`),
  t('MW', `${NS}.countries.MW`),
  t('MY', `${NS}.countries.MY`),
  t('MV', `${NS}.countries.MV`),
  t('ML', `${NS}.countries.ML`),
  t('MT', `${NS}.countries.MT`),
  t('MH', `${NS}.countries.MH`),
  t('MR', `${NS}.countries.MR`),
  t('MU', `${NS}.countries.MU`),
  t('MX', `${NS}.countries.MX`),
  t('FM', `${NS}.countries.FM`),
  t('MD', `${NS}.countries.MD`),
  t('MC', `${NS}.countries.MC`),
  t('MN', `${NS}.countries.MN`),
  t('ME', `${NS}.countries.ME`),
  t('MS', `${NS}.countries.MS`),
  t('MA', `${NS}.countries.MA`),
  t('MZ', `${NS}.countries.MZ`),
  t('NA', `${NS}.countries.NA`),
  t('NR', `${NS}.countries.NR`),
  t('NP', `${NS}.countries.NP`),
  t('NL', `${NS}.countries.NL`),
  t('NZ', `${NS}.countries.NZ`),
  t('NI', `${NS}.countries.NI`),
  t('NE', `${NS}.countries.NE`),
  t('NG', `${NS}.countries.NG`),
  t('NO', `${NS}.countries.NO`),
  t('OM', `${NS}.countries.OM`),
  t('PK', `${NS}.countries.PK`),
  t('PW', `${NS}.countries.PW`),
  t('PA', `${NS}.countries.PA`),
  t('PG', `${NS}.countries.PG`),
  t('PY', `${NS}.countries.PY`),
  t('PE', `${NS}.countries.PE`),
  t('PH', `${NS}.countries.PH`),
  t('PN', `${NS}.countries.PN`),
  t('PL', `${NS}.countries.PL`),
  t('PT', `${NS}.countries.PT`),
  t('QA', `${NS}.countries.QA`),
  t('RO', `${NS}.countries.RO`),
  t('RU', `${NS}.countries.RU`),
  t('RW', `${NS}.countries.RW`),
  t('WS', `${NS}.countries.WS`),
  t('SM', `${NS}.countries.SM`),
  t('ST', `${NS}.countries.ST`),
  t('SA', `${NS}.countries.SA`),
  t('SN', `${NS}.countries.SN`),
  t('RS', `${NS}.countries.RS`),
  t('SC', `${NS}.countries.SC`),
  t('SL', `${NS}.countries.SL`),
  t('SG', `${NS}.countries.SG`),
  t('SK', `${NS}.countries.SK`),
  t('SI', `${NS}.countries.SI`),
  t('SB', `${NS}.countries.SB`),
  t('SO', `${NS}.countries.SO`),
  t('ZA', `${NS}.countries.ZA`),
  t('SS', `${NS}.countries.SS`),
  t('ES', `${NS}.countries.ES`),
  t('LK', `${NS}.countries.LK`),
  t('SH', `${NS}.countries.SH`),
  t('KN', `${NS}.countries.KN`),
  t('LC', `${NS}.countries.LC`),
  t('VC', `${NS}.countries.VC`),
  t('STATELESS', `${NS}.countries.STATELESS`),
  t('SD', `${NS}.countries.SD`),
  t('SR', `${NS}.countries.SR`),
  t('SE', `${NS}.countries.SE`),
  t('CH', `${NS}.countries.CH`),
  t('SY', `${NS}.countries.SY`),
  t('TW', `${NS}.countries.TW`),
  t('TJ', `${NS}.countries.TJ`),
  t('TZ', `${NS}.countries.TZ`),
  t('TH', `${NS}.countries.TH`),
  t('TL', `${NS}.countries.TL`),
  t('TG', `${NS}.countries.TG`),
  t('TO', `${NS}.countries.TO`),
  t('TT', `${NS}.countries.TT`),
  t('TN', `${NS}.countries.TN`),
  t('TR', `${NS}.countries.TR`),
  t('TM', `${NS}.countries.TM`),
  t('TC', `${NS}.countries.TC`),
  t('TV', `${NS}.countries.TV`),
  t('UG', `${NS}.countries.UG`),
  t('UA', `${NS}.countries.UA`),
  t('AE', `${NS}.countries.AE`),
  t('GB', `${NS}.countries.GB`),
  t('UY', `${NS}.countries.UY`),
  t('UZ', `${NS}.countries.UZ`),
  t('VU', `${NS}.countries.VU`),
  t('VE', `${NS}.countries.VE`),
  t('VN', `${NS}.countries.VN`),
  t('VG', `${NS}.countries.VG`),
  t('WF', `${NS}.countries.WF`),
  t('EH', `${NS}.countries.EH`),
  t('YE', `${NS}.countries.YE`),
  t('ZM', `${NS}.countries.ZM`),
  t('ZW', `${NS}.countries.ZW`),
  // A.3 扩展项（非 ISO 标准国家/实体）
  t('ARUBA', `${NS}.countries.ARUBA`),
  t('BONAIRE', `${NS}.countries.BONAIRE`),
  t('CHRISTMAS_ISLAND', `${NS}.countries.CHRISTMAS_ISLAND`),
  t('COOK_ISLANDS', `${NS}.countries.COOK_ISLANDS`),
  t('CURACAO', `${NS}.countries.CURACAO`),
  t('EU', `${NS}.countries.EU`),
  t('FK', `${NS}.countries.FK`),
  t('FO', `${NS}.countries.FO`),
  t('GAZA', `${NS}.countries.GAZA`),
  t('GL', `${NS}.countries.GL`),
  t('GP', `${NS}.countries.GP`),
  t('GU', `${NS}.countries.GU`),
  t('JERUSALEM', `${NS}.countries.JERUSALEM`),
  t('YT', `${NS}.countries.YT`),
  t('NC', `${NS}.countries.NC`),
  t('NU', `${NS}.countries.NU`),
  t('NF', `${NS}.countries.NF`),
  t('MP', `${NS}.countries.MP`),
  t('NIRELAND', `${NS}.countries.NIRELAND`),
  t('PALESTINE', `${NS}.countries.PALESTINE`),
  t('PALMYRA', `${NS}.countries.PALMYRA`),
  t('PR', `${NS}.countries.PR`),
  t('REUNION', `${NS}.countries.REUNION`),
  t('SABA', `${NS}.countries.SABA`),
  t('SAINT_MARTIN', `${NS}.countries.SAINT_MARTIN`),
  t('SINT_MAARTEN', `${NS}.countries.SINT_MAARTEN`),
  t('SGSSI', `${NS}.countries.SGSSI`),
  t('ST_EUSTATIUS', `${NS}.countries.ST_EUSTATIUS`),
  t('PM', `${NS}.countries.PM`),
  t('ST_MARTIN', `${NS}.countries.ST_MARTIN`),
  t('STATUS_NEUTRAL', `${NS}.countries.STATUS_NEUTRAL`),
  t('SVALBARD', `${NS}.countries.SVALBARD`),
  t('TK', `${NS}.countries.TK`),
  t('UN', `${NS}.countries.UN`),
  t('US', `${NS}.countries.US`),
  t('VI', `${NS}.countries.VI`),
  t('WAKE', `${NS}.countries.WAKE`),
  t('WEST_BANK', `${NS}.countries.WEST_BANK`),
]

// 派生导出：按类型过滤
const _all = usCountryOptions as TypedEntry[]

/** 主权国家（~190 项）— 用于"国籍"选择，不含港澳台及海外领地 */
export const usSovereignStates: SelectOption[] = _all.filter(e => e.type === 'c')

/** 政治当局（~194 项）— 用于"签发国家/当局"选择，主权国家 + EU/UN/无国籍等 */
export const usAuthorityOptions: SelectOption[] = _all.filter(e => e.type !== 'r')

// ---- 美国州/领地列表（§3.3.2，56 项）----

export const usStatesOptions: SelectOption[] = [
  { value: 'ALABAMA', labelKey: `${NS}.usStates.ALABAMA` },
  { value: 'ALASKA', labelKey: `${NS}.usStates.ALASKA` },
  { value: 'AMERICAN SAMOA', labelKey: `${NS}.usStates.AMERICAN_SAMOA` },
  { value: 'ARIZONA', labelKey: `${NS}.usStates.ARIZONA` },
  { value: 'ARKANSAS', labelKey: `${NS}.usStates.ARKANSAS` },
  { value: 'CALIFORNIA', labelKey: `${NS}.usStates.CALIFORNIA` },
  { value: 'COLORADO', labelKey: `${NS}.usStates.COLORADO` },
  { value: 'CONNECTICUT', labelKey: `${NS}.usStates.CONNECTICUT` },
  { value: 'DELAWARE', labelKey: `${NS}.usStates.DELAWARE` },
  { value: 'DISTRICT OF COLUMBIA', labelKey: `${NS}.usStates.DISTRICT_OF_COLUMBIA` },
  { value: 'FLORIDA', labelKey: `${NS}.usStates.FLORIDA` },
  { value: 'GEORGIA', labelKey: `${NS}.usStates.GEORGIA` },
  { value: 'GUAM', labelKey: `${NS}.usStates.GUAM` },
  { value: 'HAWAII', labelKey: `${NS}.usStates.HAWAII` },
  { value: 'IDAHO', labelKey: `${NS}.usStates.IDAHO` },
  { value: 'ILLINOIS', labelKey: `${NS}.usStates.ILLINOIS` },
  { value: 'INDIANA', labelKey: `${NS}.usStates.INDIANA` },
  { value: 'IOWA', labelKey: `${NS}.usStates.IOWA` },
  { value: 'KANSAS', labelKey: `${NS}.usStates.KANSAS` },
  { value: 'KENTUCKY', labelKey: `${NS}.usStates.KENTUCKY` },
  { value: 'LOUISIANA', labelKey: `${NS}.usStates.LOUISIANA` },
  { value: 'MAINE', labelKey: `${NS}.usStates.MAINE` },
  { value: 'MARYLAND', labelKey: `${NS}.usStates.MARYLAND` },
  { value: 'MASSACHUSETTS', labelKey: `${NS}.usStates.MASSACHUSETTS` },
  { value: 'MICHIGAN', labelKey: `${NS}.usStates.MICHIGAN` },
  { value: 'MINNESOTA', labelKey: `${NS}.usStates.MINNESOTA` },
  { value: 'MISSISSIPPI', labelKey: `${NS}.usStates.MISSISSIPPI` },
  { value: 'MISSOURI', labelKey: `${NS}.usStates.MISSOURI` },
  { value: 'MONTANA', labelKey: `${NS}.usStates.MONTANA` },
  { value: 'NEBRASKA', labelKey: `${NS}.usStates.NEBRASKA` },
  { value: 'NEVADA', labelKey: `${NS}.usStates.NEVADA` },
  { value: 'NEW HAMPSHIRE', labelKey: `${NS}.usStates.NEW_HAMPSHIRE` },
  { value: 'NEW JERSEY', labelKey: `${NS}.usStates.NEW_JERSEY` },
  { value: 'NEW MEXICO', labelKey: `${NS}.usStates.NEW_MEXICO` },
  { value: 'NEW YORK', labelKey: `${NS}.usStates.NEW_YORK` },
  { value: 'NORTH CAROLINA', labelKey: `${NS}.usStates.NORTH_CAROLINA` },
  { value: 'NORTH DAKOTA', labelKey: `${NS}.usStates.NORTH_DAKOTA` },
  { value: 'NORTHERN MARIANA ISLANDS', labelKey: `${NS}.usStates.NORTHERN_MARIANA_ISLANDS` },
  { value: 'OHIO', labelKey: `${NS}.usStates.OHIO` },
  { value: 'OKLAHOMA', labelKey: `${NS}.usStates.OKLAHOMA` },
  { value: 'OREGON', labelKey: `${NS}.usStates.OREGON` },
  { value: 'PENNSYLVANIA', labelKey: `${NS}.usStates.PENNSYLVANIA` },
  { value: 'PUERTO RICO', labelKey: `${NS}.usStates.PUERTO_RICO` },
  { value: 'RHODE ISLAND', labelKey: `${NS}.usStates.RHODE_ISLAND` },
  { value: 'SOUTH CAROLINA', labelKey: `${NS}.usStates.SOUTH_CAROLINA` },
  { value: 'SOUTH DAKOTA', labelKey: `${NS}.usStates.SOUTH_DAKOTA` },
  { value: 'TENNESSEE', labelKey: `${NS}.usStates.TENNESSEE` },
  { value: 'TEXAS', labelKey: `${NS}.usStates.TEXAS` },
  { value: 'UTAH', labelKey: `${NS}.usStates.UTAH` },
  { value: 'VERMONT', labelKey: `${NS}.usStates.VERMONT` },
  { value: 'VIRGIN ISLANDS', labelKey: `${NS}.usStates.VIRGIN_ISLANDS` },
  { value: 'VIRGINIA', labelKey: `${NS}.usStates.VIRGINIA` },
  { value: 'WASHINGTON', labelKey: `${NS}.usStates.WASHINGTON` },
  { value: 'WEST VIRGINIA', labelKey: `${NS}.usStates.WEST_VIRGINIA` },
  { value: 'WISCONSIN', labelKey: `${NS}.usStates.WISCONSIN` },
  { value: 'WYOMING', labelKey: `${NS}.usStates.WYOMING` },
]

// ---- 签证类别（§3.1，25 项）----

// ---- 签证类别（v2 §3，purposeOfTripOptions，9 项）----

export const purposeOfTripOptions: SelectOption[] = [
  { value: 'B', labelKey: `${NS}.purposeOfTrip.B` },
  { value: 'C', labelKey: `${NS}.purposeOfTrip.C` },
  { value: 'D', labelKey: `${NS}.purposeOfTrip.D` },
  { value: 'F', labelKey: `${NS}.purposeOfTrip.F` },
  { value: 'H', labelKey: `${NS}.purposeOfTrip.H` },
  { value: 'I', labelKey: `${NS}.purposeOfTrip.I` },
  { value: 'J', labelKey: `${NS}.purposeOfTrip.J` },
  { value: 'L', labelKey: `${NS}.purposeOfTrip.L` },
  { value: 'M', labelKey: `${NS}.purposeOfTrip.M` },
]

// ---- 性别（v2 §1，genderOptions，2 项）----

export const genderOptions: SelectOption[] = [
  { value: 'M', labelKey: `${NS}.gender.M` },
  { value: 'F', labelKey: `${NS}.gender.F` },
]

// ---- 婚姻状态（v2 §1，maritalStatusOptions，8 项）----

export const maritalStatusOptions: SelectOption[] = [
  { value: 'MARRIED', labelKey: `${NS}.maritalStatus.MARRIED` },
  { value: 'COMMON_LAW', labelKey: `${NS}.maritalStatus.COMMON_LAW` },
  { value: 'CIVIL_UNION', labelKey: `${NS}.maritalStatus.CIVIL_UNION` },
  { value: 'SINGLE', labelKey: `${NS}.maritalStatus.SINGLE` },
  { value: 'WIDOWED', labelKey: `${NS}.maritalStatus.WIDOWED` },
  { value: 'DIVORCED', labelKey: `${NS}.maritalStatus.DIVORCED` },
  { value: 'LEGALLY_SEPARATED', labelKey: `${NS}.maritalStatus.LEGALLY_SEPARATED` },
  { value: 'OTHER', labelKey: `${NS}.maritalStatus.OTHER` },
]

// ---- 停留时长单位（v2 §3，periodOptions，5 项）----

export const periodOptions: SelectOption[] = [
  { value: 'Y', labelKey: `${NS}.period.Y` },
  { value: 'M', labelKey: `${NS}.period.M` },
  { value: 'W', labelKey: `${NS}.period.W` },
  { value: 'D', labelKey: `${NS}.period.D` },
  { value: 'H', labelKey: `${NS}.period.H` },
]

// ---- 停留时长单位（含 <24h）（v2 §3，stayPeriodOptions，5 项）----

export const stayPeriodOptions: SelectOption[] = [
  { value: 'Y', labelKey: `${NS}.stayPeriod.Y` },
  { value: 'M', labelKey: `${NS}.stayPeriod.M` },
  { value: 'W', labelKey: `${NS}.stayPeriod.W` },
  { value: 'D', labelKey: `${NS}.stayPeriod.D` },
  { value: 'LT24H', labelKey: `${NS}.stayPeriod.LT24H` },
]

// ---- 费用支付方类型（v2 §3，payerTypeOptions，3 项）----

export const payerTypeOptions: SelectOption[] = [
  { value: 'S', labelKey: `${NS}.payerType.S` },
  { value: 'O', labelKey: `${NS}.payerType.O` },
  { value: 'C', labelKey: `${NS}.payerType.C` },
]

// ---- 费用支付方关系（v2 §3，payerRelationOptions，6 项）----

export const payerRelationOptions: SelectOption[] = [
  { value: 'C', labelKey: `${NS}.payerRelation.C` },
  { value: 'P', labelKey: `${NS}.payerRelation.P` },
  { value: 'S', labelKey: `${NS}.payerRelation.S` },
  { value: 'R', labelKey: `${NS}.payerRelation.R` },
  { value: 'F', labelKey: `${NS}.payerRelation.F` },
  { value: 'O', labelKey: `${NS}.payerRelation.O` },
]

// ---- 社交媒体平台（v2 §6，socialMediaOptions，21 项）----

export const socialMediaOptions: SelectOption[] = [
  { value: 'ASK_FM', labelKey: `${NS}.socialMedia.ASK_FM` },
  { value: 'DOUBAN', labelKey: `${NS}.socialMedia.DOUBAN` },
  { value: 'FACEBOOK', labelKey: `${NS}.socialMedia.FACEBOOK` },
  { value: 'FLICKR', labelKey: `${NS}.socialMedia.FLICKR` },
  { value: 'GOOGLE_PLUS', labelKey: `${NS}.socialMedia.GOOGLE_PLUS` },
  { value: 'INSTAGRAM', labelKey: `${NS}.socialMedia.INSTAGRAM` },
  { value: 'LINKEDIN', labelKey: `${NS}.socialMedia.LINKEDIN` },
  { value: 'MYSPACE', labelKey: `${NS}.socialMedia.MYSPACE` },
  { value: 'PINTEREST', labelKey: `${NS}.socialMedia.PINTEREST` },
  { value: 'QZONE', labelKey: `${NS}.socialMedia.QZONE` },
  { value: 'REDDIT', labelKey: `${NS}.socialMedia.REDDIT` },
  { value: 'SINA_WEIBO', labelKey: `${NS}.socialMedia.SINA_WEIBO` },
  { value: 'TENCENT_WEIBO', labelKey: `${NS}.socialMedia.TENCENT_WEIBO` },
  { value: 'TUMBLR', labelKey: `${NS}.socialMedia.TUMBLR` },
  { value: 'TWITTER', labelKey: `${NS}.socialMedia.TWITTER` },
  { value: 'TWOO', labelKey: `${NS}.socialMedia.TWOO` },
  { value: 'VINE', labelKey: `${NS}.socialMedia.VINE` },
  { value: 'VKONTAKTE', labelKey: `${NS}.socialMedia.VKONTAKTE` },
  { value: 'YOUKU', labelKey: `${NS}.socialMedia.YOUKU` },
  { value: 'YOUTUBE', labelKey: `${NS}.socialMedia.YOUTUBE` },
  { value: 'NONE', labelKey: `${NS}.socialMedia.NONE` },
]

// ---- 护照/证件类型（v2 §7，docTypeOptions，5 项）----

export const docTypeOptions: SelectOption[] = [
  { value: 'REGULAR', labelKey: `${NS}.docType.REGULAR` },
  { value: 'OFFICIAL', labelKey: `${NS}.docType.OFFICIAL` },
  { value: 'DIPLOMATIC', labelKey: `${NS}.docType.DIPLOMATIC` },
  { value: 'LAISSEZ_PASSER', labelKey: `${NS}.docType.LAISSEZ_PASSER` },
  { value: 'OTHER', labelKey: `${NS}.docType.OTHER` },
]

// ---- 联系人关系（v2 §8，relationshipOptions，7 项）----

export const relationshipOptions: SelectOption[] = [
  { value: 'RELATIVE', labelKey: `${NS}.relationship.RELATIVE` },
  { value: 'SPOUSE', labelKey: `${NS}.relationship.SPOUSE` },
  { value: 'FRIEND', labelKey: `${NS}.relationship.FRIEND` },
  { value: 'BUSINESS_ASSOCIATE', labelKey: `${NS}.relationship.BUSINESS_ASSOCIATE` },
  { value: 'EMPLOYER', labelKey: `${NS}.relationship.EMPLOYER` },
  { value: 'SCHOOL_OFFICIAL', labelKey: `${NS}.relationship.SCHOOL_OFFICIAL` },
  { value: 'OTHER', labelKey: `${NS}.relationship.OTHER` },
]

// ---- 直系亲属关系（v2 §9，immediateRelationOptions，4 项）----

export const immediateRelationOptions: SelectOption[] = [
  { value: 'SPOUSE', labelKey: `${NS}.immediateRelation.SPOUSE` },
  { value: 'FIANCE', labelKey: `${NS}.immediateRelation.FIANCE` },
  { value: 'CHILD', labelKey: `${NS}.immediateRelation.CHILD` },
  { value: 'SIBLING', labelKey: `${NS}.immediateRelation.SIBLING` },
]

// ---- 亲属在美身份（v2 §9，familyStatusOptions，4 项）----

export const familyStatusOptions: SelectOption[] = [
  { value: 'US_CITIZEN', labelKey: `${NS}.familyStatus.US_CITIZEN` },
  { value: 'LPR', labelKey: `${NS}.familyStatus.LPR` },
  { value: 'NONIMMIGRANT', labelKey: `${NS}.familyStatus.NONIMMIGRANT` },
  { value: 'OTHER', labelKey: `${NS}.familyStatus.OTHER` },
]

// ---- 配偶地址类型（v2 §9，spouseAddressOptions，5 项）----

export const spouseAddressOptions: SelectOption[] = [
  { value: 'SAME_HOME', labelKey: `${NS}.spouseAddress.SAME_HOME` },
  { value: 'SAME_MAILING', labelKey: `${NS}.spouseAddress.SAME_MAILING` },
  { value: 'SAME_US_CONTACT', labelKey: `${NS}.spouseAddress.SAME_US_CONTACT` },
  { value: 'UNKNOWN', labelKey: `${NS}.spouseAddress.UNKNOWN` },
  { value: 'OTHER', labelKey: `${NS}.spouseAddress.OTHER` },
]

// ---- 当前职业（v2 §10，occupationOptions，22 项）----

export const occupationOptions: SelectOption[] = [
  { value: 'AGRICULTURE', labelKey: `${NS}.occupation.AGRICULTURE` },
  { value: 'ARTIST', labelKey: `${NS}.occupation.ARTIST` },
  { value: 'BUSINESS', labelKey: `${NS}.occupation.BUSINESS` },
  { value: 'COMMUNICATIONS', labelKey: `${NS}.occupation.COMMUNICATIONS` },
  { value: 'COMPUTER_SCIENCE', labelKey: `${NS}.occupation.COMPUTER_SCIENCE` },
  { value: 'CULINARY', labelKey: `${NS}.occupation.CULINARY` },
  { value: 'EDUCATION', labelKey: `${NS}.occupation.EDUCATION` },
  { value: 'ENGINEERING', labelKey: `${NS}.occupation.ENGINEERING` },
  { value: 'GOVERNMENT', labelKey: `${NS}.occupation.GOVERNMENT` },
  { value: 'HOMEMAKER', labelKey: `${NS}.occupation.HOMEMAKER` },
  { value: 'LAW', labelKey: `${NS}.occupation.LAW` },
  { value: 'MEDICAL', labelKey: `${NS}.occupation.MEDICAL` },
  { value: 'MILITARY', labelKey: `${NS}.occupation.MILITARY` },
  { value: 'NATURAL_SCIENCE', labelKey: `${NS}.occupation.NATURAL_SCIENCE` },
  { value: 'NOT_EMPLOYED', labelKey: `${NS}.occupation.NOT_EMPLOYED` },
  { value: 'PHYSICAL_SCIENCE', labelKey: `${NS}.occupation.PHYSICAL_SCIENCE` },
  { value: 'RELIGIOUS', labelKey: `${NS}.occupation.RELIGIOUS` },
  { value: 'RESEARCH', labelKey: `${NS}.occupation.RESEARCH` },
  { value: 'RETIRED', labelKey: `${NS}.occupation.RETIRED` },
  { value: 'SOCIAL_SCIENCE', labelKey: `${NS}.occupation.SOCIAL_SCIENCE` },
  { value: 'STUDENT', labelKey: `${NS}.occupation.STUDENT` },
  { value: 'OTHER', labelKey: `${NS}.occupation.OTHER` },
]
