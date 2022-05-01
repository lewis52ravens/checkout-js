import { DataStore } from '@aws-amplify/datastore';
import { TimeSlot as TimeSlotAWS } from '../../models';
import ScheduleInfo, { Month, Day, TimeSlot, MonthSymbol } from './ScheduleInfo';

export default class ScheduleInfoTest implements ScheduleInfo {
    
    staleLimit: 30000 = 30000;
    staleTimer: 8000 = 8000;
    hasData: boolean;
    isStale: boolean;
    currentMonth?: Month;
    nextMonth?: Month;
    prevMonth?: Month;
    lastUpdate: number
    updateCounter: number;
    
    constructor() {
        DataStore.observe(TimeSlotAWS).subscribe(msg => {
            console.log(msg.model, msg.opType, msg.element);
        })
        this.hasData = false;
        this.isStale = true;
        this.lastUpdate = -1 * this.staleLimit;
        this.updateCounter = 0;

        setInterval(this.checkStaleness, this.staleTimer);
    }


    private checkStaleness() {
        if (!this.isStale && this.currentMonth) {
            const check = Date.now();
            if (check - this.lastUpdate > this.staleLimit) {
                this.isStale = true;
                this.updateAllData(this.currentMonth);
            }
        }
    }

    public isUpdating(): boolean {
        return this.updateCounter == 0;
    }

    public getInfoForDate(date: Date): Day {
        if (this.hasData) {
            if (date.getMonth() != this.currentMonth?.value || date.getFullYear() != this.currentMonth.year) {
                throw new Error('Date is not in the month currently being viewed');
            } else {
                return this.currentMonth.days[date.getDate()-1];
            }
        } else {
            return {
                hasAvailableSlots: false,
                isEnabled: false,
                timeSlots: []
            };
        }
    }

    public getTimeSlotsForDate(date: Date): TimeSlot[] {
        if (date.getMonth() != this.currentMonth?.value || date.getFullYear() != this.currentMonth?.year) {
            throw new Error('Date is not in the month currently being viewed');
        } else {
            return this.currentMonth.days[date.getDate()-1].timeSlots;
        }
    }

    public async changeMonth(month: number, year: number): Promise<boolean> {
        this.hasData = false;
        const newMonth: MonthSymbol = {
            value: month,
            year: year
        };

        if (this.isStale) {
            return this.updateAllData(newMonth);
        } else {
            if (newMonth.value == this.prevMonth?.value && newMonth.year == this.prevMonth.year) {
                this.nextMonth = this.currentMonth;
                this.currentMonth = this.prevMonth;
                try {
                    this.prevMonth = await this.fetchData(getPrevMonth(newMonth));
                    this.hasData = true;
                    return true;
                } catch (e) {
                    console.error('Error retrieving schedule data from server for month: ' + getPrevMonth(newMonth).value);
                    console.error(e);
                    this.hasData = false;
                    return false;
                }
            } else if (newMonth.value == this.nextMonth?.value && newMonth.year == this.nextMonth.year) {
                this.prevMonth = this.currentMonth;
                this.currentMonth = this.nextMonth;
                try {
                    this.nextMonth = await this.fetchData(getNextMonth(newMonth));
                    this.hasData = true;
                    return true;
                } catch (e) {
                    console.error('Error retrieving schedule data from server for month: ' + getNextMonth(newMonth).value);
                    console.error(e);
                    this.hasData = false;
                    return false;
                }
            } else if (newMonth.value == this.currentMonth?.value && newMonth.year == this.currentMonth.year) {
                return true;
            } else {
                return this.updateAllData(newMonth);
            }
        }

    }

    private async updateAllData(centerMonth: MonthSymbol): Promise<boolean> {
        const promises = Promise.all([
            this.fetchData(getPrevMonth(centerMonth)),
            this.fetchData(centerMonth),
            this.fetchData(getNextMonth(centerMonth))
        ]);
        let months: [Month, Month, Month];
        try {
            months = await promises;
            this.prevMonth = months[0];
            this.currentMonth = months[1];
            this.nextMonth = months[2];
            this.hasData = true;
            this.isStale = false;
            this.lastUpdate = Date.now();
            return true;
        } catch (e) {
            console.error('Error retrieving schedule data from server for month: ' + centerMonth.value + ' (including surrounding months)');
            console.error(e);
            this.hasData = false;
            return false;
        }   
    }

    private fetchData(selectedMonth: MonthSymbol): Promise<Month> {
        this.updateCounter++;
        //TODO: Pull data from database and transform
        const m = makeTestMonth(selectedMonth);
        this.updateCounter--;
        return Promise.resolve(m);
    }
}

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

function makeTestMonth(month: MonthSymbol): Month {
    let testMonth: Month = {
        year: month.year,
        value: month.value,
        days: []
    };
    const nextMonth = getNextMonth(month);
    const numDays = new Date(nextMonth.year, nextMonth.value, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
        testMonth.days.push( makeTestDay(month.year, month.value, i) );
    }
    return testMonth;
}

function makeTestDay(year: number, month: number, date: number): Day {
    const day = new Date(year, month, date);
    const dow = day.getDay();
    if (dow == 6) {
        let timeSlots: TimeSlot[] = [];
        let anyAvailable = false;
        for (let i = 0; i < 8; i++) {
            const ts = makeTestTimeSlot(day, 9+i);
            if (ts.isAvailable) {
                anyAvailable = true;
            }
            timeSlots.push(ts);
        }
        return {
            isEnabled: true,
            timeSlots: timeSlots,
            hasAvailableSlots: anyAvailable
        }
    } else if (dow == 0) {
        let timeSlots: TimeSlot[] = [];
        let anyAvailable = false;
        for (let i = 0; i < 2; i++) {
            const ts = makeTestTimeSlot(day, 8+i);
            if (ts.isAvailable) {
                anyAvailable = true;
            }
            timeSlots.push(ts);
        }
        return {
            isEnabled: true,
            timeSlots: timeSlots,
            hasAvailableSlots: anyAvailable
        };
    } else {
        return {
            isEnabled: false,
            timeSlots: [],
            hasAvailableSlots: false
        };
    }
}

function makeTestTimeSlot(date: Date, startTime: number, isAvailable?: boolean): TimeSlot {
    const available = isAvailable != undefined ? isAvailable : ( Math.random() < 0.8 );
    let startDate = new Date(date);
    let endDate = new Date(date);
    startDate.setHours(startTime, 0, 0, 0);
    endDate.setHours(startTime+1, 0, 0, 0);
    const dtOptions: Intl.DateTimeFormatOptions = {
        hour12: true,
        timeStyle: 'short'
    };
    const dtFormat = new Intl.DateTimeFormat('en-US', dtOptions);
    const sParts = dtFormat.formatToParts(startDate);
    const eParts = dtFormat.formatToParts(endDate);
    const sPeriod = sParts.find((val) => val.type == 'dayPeriod' );
    const sHour = sParts.find((val) => val.type == 'hour');
    const ePeriod = eParts.find((val) => val.type == 'dayPeriod');
    const eHour = eParts.find((val) => val.type == 'hour');
    //const sString = startDate.toLocaleTimeString([], dtFormat);
    //const eString = endDate.toLocaleTimeString([], dtFormat);
    
    const displayString = `${sHour?.value} ${sPeriod?.value} - ${eHour?.value} ${ePeriod?.value}`;
    return {
        date: date,
        startTime: startDate,
        endTime: endDate,
        isAvailable: available,
        displayString: displayString
    };
}
