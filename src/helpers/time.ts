import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration'
import * as isToday from 'dayjs/plugin/isToday'
import * as timezone from 'dayjs/plugin/timezone'
import * as utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isToday)
dayjs.extend(duration)

export const time = dayjs
