import { DataStore, DataStoreSnapshot, SortDirection } from "@aws-amplify/datastore";
import ScheduleInfo, { Day, Month, MonthSymbol, TimeSlot } from "./ScheduleInfo";
import { TimeSlot as TimeSlotAWS, Settings, OrderTypeWeight } from '../../models';
import { ZenObservable } from 'zen-observable-ts';
import { Predicates } from "@aws-amplify/datastore/lib-esm/predicates";

export default class ScheduleInfoFromAmplify implements ScheduleInfo {

    currentMonth?: Month;
    nextMonth?: Month;
    prevMonth?: Month;
    next2Month?: Month;
    prev2Month?: Month;
    subscription!: ZenObservable.Subscription;
    settings?: Settings;
    isProcessing: boolean = false;
    isSynced: boolean = false;
    settingsPromise: Promise<void>;
    internalSlots: InternalTimeSlot[];
    

    constructor() {
        this.internalSlots = [];
        const thisMonth = this.getCurrentMonth();
        this.settingsPromise = DataStore.query(Settings, Predicates.ALL, {
            sort: s => s.updatedAt(SortDirection.DESCENDING)
        }).then( value => {
            this.settings = value[0];
            console.log(this.settings);
        });
        this.changeMonth(thisMonth.value, thisMonth.year);
    }

    isUpdating(): boolean {
        if (!this.settings) {
            return true;
        } else if (!this.isSynced) {
            return true;
        } else if (this.isProcessing) {
            return true;
        }
        //throw new Error("Method not implemented.");
        return false;
    }
    getInfoForDate(date: Date): Day {
        if (this.settings) {
            let availableTimes = this.settings.availableTimes?.find( at => at!.dayOfWeek-1 == date.getUTCDay());
            if (availableTimes) {
                return this.buildDay(date, availableTimes.startTime, availableTimes.endTime);
            } else {
                return {
                    isEnabled: false,
                    timeSlots: [],
                    hasAvailableSlots: false
                };
            }
        } else {
            return {
                isEnabled: false,
                timeSlots: [],
                hasAvailableSlots: false
            };
        }
    }
    getTimeSlotsForDate(date: Date): TimeSlot[] {
        return this.getInfoForDate(date).timeSlots;
    }

    async changeMonth(month: number, year: number): Promise<boolean> {
        await this.settingsPromise;
        const startMonth = getPrevMonth(getPrevMonth({value: month, year: year}));
        const endMonth = getNextMonth(getNextMonth({value: month, year: year}));
        const startFirst = `${startMonth.year}-${(startMonth.value+1).toLocaleString('en-US', calOptions)}-01`;
        const endLast = `${endMonth.year}-${(endMonth.value+1).toLocaleString('en-US', calOptions)}-${daysInMonth(endMonth).toLocaleString('en-US', calOptions)}`;
        console.log('Start date: ' + startFirst);
        console.log('End date: ' + endLast);
        //TODO: Determine if I need to set up pagination for this query
        this.subscription = DataStore.observeQuery(TimeSlotAWS,
            ts => ts.date('ge', startFirst).date('le', endLast),
            { sort: ts => ts.date(SortDirection.ASCENDING).startTime(SortDirection.ASCENDING) }
            ).subscribe(this.updateSubscription.bind(this));
        return Promise.resolve(true);
    }

    private async updateSubscription(snapshot: DataStoreSnapshot<TimeSlotAWS>) {
        await this.settingsPromise;
        this.isProcessing = true;
        this.internalSlots = [];
        if (this.settings) {
            const { items, isSynced } = snapshot;
        
            console.log(`[Snapshot] item count: ${items.length}, isSynced: ${isSynced}`);
            items.forEach( (item) => {
                const [year, month, day] = item.date.split('-');
                const [hour, min] = item.startTime.split(':');
                let date = new Date();
                date.setUTCFullYear(parseInt(year), parseInt(month)-1, parseInt(day));
                date.setUTCHours(parseInt(hour),parseInt(min),0,0);
                let slotIndex = this.internalSlots.findIndex( is => is.startTime.valueOf() == date.valueOf());
                if (slotIndex >= 0) {
                    this.internalSlots[slotIndex].orders.push(item);
                } else {
                    let endTime = new Date(date);
                    endTime.setUTCMinutes(endTime.getUTCMinutes() + this.settings!.timeSlotDuration);
                    let its = new InternalTimeSlot(date, endTime);
                    its.orders.push(item);
                    this.internalSlots.push(its);
                }
            });
            this.isProcessing = false;
            this.isSynced = isSynced;
        } else {
            console.log('Attempted to update subscription without settings object');
        }
        
    }

    private getCurrentMonth(): MonthSymbol {
        const now = new Date();
        return {
            year: now.getFullYear(),
            value: now.getMonth()
        };
    }

    private buildDay(date: Date, startTime: string, endTime: string): Day {
        //let times: { startTime: Date, endTime: Date}[] = [];
        const increment = this.settings!.timeSlotDuration;
        let startDate = new Date(date);
        let endDate = new Date(date);
        const [sHour, sMin] = startTime.split(':');
        const [eHour, eMin] = endTime.split(':');
        startDate.setUTCHours(parseInt(sHour), parseInt(sMin), 0, 0);
        endDate.setUTCHours(parseInt(eHour), parseInt(eMin), 0, 0);
        
        let time = startDate;
        let timeslots: TimeSlot[] = [];
        let available = false;
        while (time.valueOf() < endDate.valueOf()) {
            let nextTime = new Date(time);
            nextTime.setUTCMinutes(nextTime.getUTCMinutes() + increment);
            let internalSlot = this.internalSlots.find( is => {
                return is.startTime.valueOf() == time.valueOf();
            });
            if (internalSlot) {
                let newTS = internalSlot.toTimeSlot(this.settings!.ordersPerSlot, this.settings!.orderTypeWeights || []);
                if (newTS.isAvailable) {
                    available = true;
                }
                timeslots.push(newTS);
            } else {
                timeslots.push({
                    date: date,
                    startTime: new Date(time),
                    endTime: new Date(nextTime),
                    isAvailable: true,
                    displayString: makeDisplayString(time, nextTime)
                });
                available = true;
            }
            time.setTime(nextTime.getTime());
        }
        return {
            isEnabled: true,
            timeSlots: timeslots,
            hasAvailableSlots: available
        };
    }
    
}

const calOptions: Intl.NumberFormatOptions = { minimumIntegerDigits: 2 };
function getNextMonth(month: MonthSymbol): MonthSymbol {
    if (month.value < 11) {
        return {
            value: month.value + 1,
            year: month.year
        };
    } else {
        return {
            value: 0,
            year: month.year + 1
        };
    }
}
function getPrevMonth(month: MonthSymbol): MonthSymbol {
    if (month.value > 0) {
        return {
            value: month.value - 1,
            year: month.year
        };
    } else {
        return {
            value: 11,
            year: month.year - 1
        };
    }
}
function daysInMonth(month: MonthSymbol): number {
    return new Date(month.year, month.value, 0).getDate();
}

function makeDisplayString(startTime: Date, endTime: Date): string {
    const dtOptions: Intl.DateTimeFormatOptions = {
        hour12: true,
        timeStyle: 'short'
    };
    const dtFormat = new Intl.DateTimeFormat('en-US', dtOptions);
    const sParts = dtFormat.formatToParts(startTime);
    const eParts = dtFormat.formatToParts(endTime);
    const sPeriod = sParts.find((val) => val.type == 'dayPeriod');
    const sHour = sParts.find((val) => val.type == 'hour');
    const ePeriod = eParts.find((val) => val.type == 'dayPeriod');
    const eHour = eParts.find((val) => val.type == 'hour');
    const displayString = `${sHour?.value} ${sPeriod?.value} - ${eHour?.value} ${ePeriod?.value}`;
    return displayString;
}

class InternalTimeSlot {
    startTime: Date;
    endTime: Date;
    orders: TimeSlotAWS[];

    constructor(startTime: Date, endTime: Date) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.orders = [];
    }

    toTimeSlot(ordersPerSlot: number, orderWeights: OrderTypeWeight[]): TimeSlot {
        let date = new Date(this.startTime);
        date.setUTCHours(0,0,0,0);
        let count = 0;
        let isAvailable = true;
        this.orders.forEach( order => {
            if (order.isBooked) {
                const weight = orderWeights.find( ow => ow.orderType == order.type);
                if (weight) {
                    count += weight.weight;
                }
            } else if (order.isDisabled) {
                isAvailable = false;
            }
        });
        if (count >= ordersPerSlot) {
            isAvailable = false;
        }

        return {
            date: date,
            startTime: this.startTime,
            endTime: this.endTime,
            isAvailable: isAvailable,
            displayString: makeDisplayString(this.startTime, this.endTime)
        };
    }
}