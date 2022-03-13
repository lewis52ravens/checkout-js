import { ShippingOption } from "@bigcommerce/checkout-sdk";
import _ from "lodash";
import React from "react";
import { Component, ReactNode } from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { TimeSlot } from "./ScheduleInfo";


export interface TimeSlotProps {
    selectedDate?: Date;
    selectedTime?: TimeSlot;
    shippingOption?: ShippingOption;
    hasData: boolean;
    onSelectTimeSlot(slot: TimeSlot): void;
    getTimeSlotsForDate(date: Date): TimeSlot[];
}

class TimeSlotSelector extends Component<TimeSlotProps> {

    constructor(props: any) {
        super(props);
    }

    async componentDidMount(): Promise<void> {
        // do stuff
        return Promise.resolve();
    }

    render(): ReactNode {
        const {
            selectedDate,
            selectedTime,
            shippingOption,
            hasData,
            onSelectTimeSlot,
            getTimeSlotsForDate
        } = this.props;
        
        shippingOption;

        let listItems: JSX.Element[];
        
        if (!hasData) {
            listItems = [(
                <ListGroupItem key="loadingTimeSlot" disabled>
                    Loading...
                </ListGroupItem>
            )]
        } else if (selectedDate) {
            const slots = getTimeSlotsForDate(selectedDate);
            listItems = slots.map((slot) => {
                const active = _.isEqual(slot, selectedTime);
                return (
                    <ListGroupItem
                        as='a'
                        key={ slot.startTime.valueOf() }
                        disabled={ !slot.isAvailable }
                        action
                        active={ active }
                        onClick={ () => {this.handleTimeSlotClick(slot, onSelectTimeSlot)} }
                        title={ slot.isAvailable ? "" : "Unavailable"}
                    >
                        {slot.displayString}
                    </ListGroupItem>
                );
            });
        } else {
            listItems = [(
                <ListGroupItem key="blankTimeSlot" disabled>
                    No date selected    
                </ListGroupItem>
            )]
        }

        return (
            <div className="TimeSlots">
                <ListGroup>
                    {listItems}
                </ListGroup>
            </div>
        );
    }

    handleTimeSlotClick(slot: TimeSlot, handler: (s: TimeSlot) => void) {
        if (slot.isAvailable) {
            handler(slot);
        }
    }
}

export default TimeSlotSelector;