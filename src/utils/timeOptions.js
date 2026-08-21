import { minutesToTimeStr } from './dateUtils.js'

export const LAST_SLOT_MINUTES = 23 * 60 + 50

/** Every 10-minute slot in a day, 'HH:mm', for time-picker dropdowns. */
export const TIME_OPTIONS = Array.from({ length: 144 }, (_, i) => minutesToTimeStr(i * 10))
