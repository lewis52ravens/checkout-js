import { Address, Cart, CheckoutRequestBody, CheckoutSelectors, ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { LoadingOverlay } from '../ui/loading';
// import { getShippableItemsCount } from '../shipping';
// import getShippingMethodId from '../shipping/getShippingMethodId';

export interface ScheduleProps {
    isReady: boolean;
    hasCartChanged: boolean;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    navigateNextStep(): void;
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
}

class Schedule extends Component<ScheduleProps & WithCheckoutScheduleProps, ScheduleState> {
    constructor(props: any) {
        super(props);

        this.state = {
            isInitializing: true,
        };
    }

    async componentDidMount(): Promise<void> {
        // do stuff
        return Promise.resolve();
    }

    render(): ReactNode {
        let name = 'scheduling section';

        const {
            isInitializing,
        } = this.state;
        if (isInitializing) {
            name = 'Scheduling section';
        }

        return (
            <div className="checkout-form">
                <LoadingOverlay
                    isLoading={ isInitializing }
                    unmountContentWhenLoading
                >
                    <p>
                        This is the
                        { name }
                    </p>
                </LoadingOverlay>
            </div>
        );
    }
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
