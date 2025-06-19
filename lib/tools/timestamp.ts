import { TimestampToolInput, TimestampToolOptions, TimestampToolOutput } from '@/lib/types/tools';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const processTimestamp = (input: TimestampToolInput, options?: TimestampToolOptions): TimestampToolOutput => {
    try {
        let date;
        if (typeof input.timestamp === 'number') {
            date = dayjs.unix(input.timestamp);
        } else {
            date = dayjs(input.timestamp);
        }

        if (!date.isValid()) {
            throw new Error('Invalid timestamp or date string.');
        }

        const format = options?.format || 'YYYY-MM-DD HH:mm:ss';
        const tz = options?.timezone || dayjs.tz.guess();

        const humanReadableDate = date.tz(tz).format(format);
        const unixTimestamp = date.unix();

        return { humanReadableDate, unixTimestamp };
    } catch (error: unknown) {
        return {
            humanReadableDate: '',
            unixTimestamp: 0,
            errorMessage: error instanceof Error ? error.message : 'Timestamp processing error.',
        };
    }
};
