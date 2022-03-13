import { Address, Cart, CheckoutRequestBody, CheckoutSelectors, ShippingOption } from '@bigcommerce/checkout-sdk';
import Calendar, { CalendarTileProperties, DateCallback, ViewCallback } from 'react-calendar';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
//import { LoadingOverlay } from '../ui/loading';
import ScheduleFormFooter, { ScheduleFormValues } from './ScheduleFormFooter';
import './Schedule.scss';
import ScheduleInfo, { TimeSlot } from './ScheduleInfo';
import TimeSlotSelector from './TimeSlotSelector';
import { Col, Container, Row } from 'react-bootstrap';
import { noop } from 'lodash';
//import 'react-calendar/dist/Calendar.css';

// import { getShippableItemsCount } from '../shipping';
// import getShippingMethodId from '../shipping/getShippingMethodId';

export interface ScheduleProps {
    isReady: boolean;
    hasCartChanged: boolean;
    timeSlot?: TimeSlot;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onTimeSlotSelected(timeSlot: TimeSlot): void;
    navigateNextStep(isTimeSelected: boolean): void;
}

export interface WithCheckoutScheduleProps {
    cart: Cart;
    shippingAddress?: Address;
    shippingOption?: ShippingOption;
    isLoading: boolean;
    isGuest: boolean;
    isInitializing: boolean;
    initializeScheduling(address: Address, shipOption: ShippingOption): Promise<any>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
}

interface ScheduleState {
    isInitializing: boolean;
    selectedDate?: Date;
    selectedDateNum?: number;
    loadedData: boolean;
}

class Schedule extends Component<ScheduleProps & WithCheckoutScheduleProps, ScheduleState> {

    schedule: ScheduleInfo;

    constructor(props: any) {
        super(props);
        this.schedule = new ScheduleInfo();
        
        if (this.props.timeSlot) {
            this.state = {
                isInitializing: true,
                loadedData: false,
                selectedDate: this.props.timeSlot.date,
                selectedDateNum: this.props.timeSlot.date.valueOf(),
            }
        }
    }

    async componentDidMount(): Promise<void> {
        const date: Date = this.state?.selectedDate ? this.state.selectedDate : new Date();
        //const date = new Date();
        const gotSchedule = await this.schedule.changeMonth(date.getMonth(), date.getFullYear());
        if (gotSchedule) {
            this.setState({isInitializing: false, loadedData: true});
            return;
        } else {
            this.setState({isInitializing: false, loadedData: false});
            return;
        }
    }

    render(): ReactNode {
        const {
            shippingOption,
            onTimeSlotSelected,
            timeSlot,
        } = this.props;

        const {
            selectedDate,
            selectedDateNum,
            loadedData,
        } = this.state ?? {};
        
        const getTimeSlots = this.schedule.getTimeSlotsForDate;

        return (
            <div className="Calendar">
                
                    <Container fluid='md'>
                        <Row>
                            <Col xs={7}>
                                <div className='Calendar__container'>
                                    <span className='Calendar__container__content'>
                                        <Calendar
                                            calendarType="US"
                                            minDate={ new Date() }
                                            minDetail="month"
                                            showNeighboringMonth={ false }
                                            onActiveStartDateChange={ this.handleViewChange }
                                            onClickDay={ this.handleDateClicked }
                                            tileDisabled={ this.isDateDisabled }
                                            tileClassName={ (props) => { return this.getDateClass(loadedData, props) } }
                                        />
                                    </span>
                                </div>
                            </Col>
                            <Col>
                                <TimeSlotSelector
                                    getTimeSlotsForDate={ getTimeSlots.bind(this.schedule) }
                                    onSelectTimeSlot={ onTimeSlotSelected }
                                    shippingOption={ shippingOption }
                                    selectedDate={ selectedDate }
                                    selectedTime={ timeSlot }
                                    hasData={ loadedData }
                                />
                            </Col>
                        </Row>
                    </Container>

                    <ScheduleFormFooter
                        selectedDateNum={ selectedDateNum }
                        selectedTime= { timeSlot }
                        onSubmitSchedule={ this.handleScheduleSubmit }
                    />
                
            </div>
        );
    }

    private getDateClass = (isDataLoaded: boolean, props: CalendarTileProperties): string | string[] | null => {
        if (props.view == 'month' && isDataLoaded) {
            const day = this.schedule.getInfoForDate(props.date);
            if (!day.isEnabled) {
                return 'Day__Disabled'
            } else if (!day.hasAvailableSlots) {
                return 'Day__Unavailable';
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private isDateDisabled = (props: CalendarTileProperties): boolean => {
        const info = this.schedule.getInfoForDate(props.date);
        const enabled = info.isEnabled;
        return !enabled;
        //return !this.schedule.getInfoForDate(props.date).isEnabled;
    }

    private handleViewChange: ViewCallback = async (callbackProps) => {
        const newMonth = callbackProps.activeStartDate.getMonth();
        const newYear = callbackProps.activeStartDate.getFullYear();
        await this.schedule.changeMonth(newMonth, newYear);
    };

    private handleDateClicked: DateCallback = (value, _event) => {
        this.setState({selectedDate: value, selectedDateNum: value.valueOf()});
    }

    private handleScheduleSubmit: (formValues: ScheduleFormValues) => Promise<void> = async (formValues) => {
        const {
            navigateNextStep = noop,
            onUnhandledError = noop,
        } = this.props;

        const selectedDate = formValues.selectedDateNum;
        const selectedTime = formValues.selectedTime;
        console.log('Selected Date: ' + selectedDate);
        console.log('Selected Time: ' + selectedTime);
        try {
            if (selectedDate != -1 && selectedTime != '') {
                console.log('selected date exists');
                navigateNextStep(true);
            } else {
                console.log('No date selected');
                navigateNextStep(false);
            }
        } catch (e: any) {
            console.error(e);
            onUnhandledError(e);
        }
    };
}

export function mapToScheduleProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutScheduleProps | null {
    const {
        data: {
            getCart,
            getCheckout,
            getConfig,
            getCustomer,
            getOrder,
            getShippingAddress,
            getSelectedShippingOption,
        },
        statuses: {
            isShippingStepPending,
            isSelectingShippingOption,
            isUpdatingConsignment,
            isCreatingConsignments,
            isCreatingCustomerAddress,
            isUpdatingCheckout,
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    //const consignments = getConsignments() || [];
    const customer = getCustomer();
    const { isComplete = false } = getOrder() || {};
    const cart = getCart();

    if (!checkout || !config || !customer || !cart || isComplete) {
        return null;
    }

    // Don't think we need anything from config
    /*
    const {
        checkoutSettings: {
            
        },
    } = config;
    */

    // const methodId = getShippingMethodId(checkout);
    // const shippableItemsCount = getShippableItemsCount(cart);
    const isLoading = (
        isShippingStepPending() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress() ||
        getShippingAddress() === undefined ||
        getSelectedShippingOption() === undefined
    );

    const shippingAddress = getShippingAddress();
    const shippingOption = getSelectedShippingOption();
    const initScheduling = (address: Address, shipOption: ShippingOption) => {
        return Promise.resolve({address, shipOption});
    };

    return {
        cart,
        shippingAddress,
        shippingOption,
        isLoading,
        isGuest: customer.isGuest,
        isInitializing: false,
        initializeScheduling: initScheduling,
        updateCheckout: checkoutService.updateCheckout,
    };
}

export default withCheckout(mapToScheduleProps)(Schedule);
