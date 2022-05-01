
export interface TimeSlot {
    date: Date;
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
    displayString: string;
}

export interface Day {
    isEnabled: boolean;
    timeSlots: TimeSlot[];
    hasAvailableSlots: boolean;
}

export interface Month {
    year: number;
    value: number;
    days: Day[];
}

/** Stores a month using the values from a Date object, starting at 0 and going to 11. */
export interface MonthSymbol {
    year: number;
    value: number;
}

export default class ScheduleInfo {

    isUpdating(): boolean;
    getInfoForDate(date: Date): Day;
    getTimeSlotsForDate(date: Date): TimeSlot[];
    async changeMonth(month: number, year: number): Promise<boolean>;


}