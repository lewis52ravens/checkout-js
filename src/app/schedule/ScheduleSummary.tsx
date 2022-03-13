import { FunctionComponent } from "enzyme";
import React from "react";
import { TimeSlot } from "./ScheduleInfo";

export interface ScheduleSummaryProps {
    timeSlot?: TimeSlot;
}

export const ScheduleSummary: FunctionComponent<ScheduleSummaryProps> = ({
    timeSlot,
}) => {

    if (timeSlot) {
        const dateString = timeSlot?.date.toLocaleDateString();
        const timeString = timeSlot?.displayString;

        return (
            <div className="schedule-info">
                <span className="schedule-info__date">
                    { dateString }
                </span>
                &nbsp;
                <span className="schedule-info__time">
                    { timeString }
                </span>
            </div>
        );
    } else {
        
        return (
            <div className="schedule-info">
                <span className="schedule-info__no-selection">
                    "No date selected"
                </span>
            </div>
        )
    }
}