import { createCheckoutService, createEmbeddedCheckoutMessenger, createStepTracker, StepTracker } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component, ReactNode } from 'react';
import ReactModal from 'react-modal';

import '../../scss/App.scss';
import { CheckoutProvider } from '../checkout';
import { createErrorLogger, ErrorBoundary, ErrorLogger } from '../common/error';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, CreatedCustomer, SignUpFormValues } from '../guestSignup';
import { getLanguageService, LocaleProvider } from '../locale';

import OrderConfirmation from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    containerId: string;
    orderId: number;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
}

class OrderConfirmationApp extends Component<OrderConfirmationAppProps> {
    private accountService = new AccountService();
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private errorLogger: ErrorLogger;

    constructor(props: Readonly<OrderConfirmationAppProps>) {
        super(props);

        this.errorLogger = createErrorLogger(
            { sentry: props.sentryConfig },
            {
                errorTypes: ['UnrecoverableError'],
                publicPath: props.publicPath,
            }
        );
    }

    componentDidMount(): void {
        const { containerId, orderId } = this.props;
        console.log('OrderID: ' + orderId);
        ReactModal.setAppElement(`#${containerId}`);
    }

    render(): ReactNode {
        return (
            <ErrorBoundary logger={ this.errorLogger }>
                <LocaleProvider checkoutService={ this.checkoutService }>
                    <CheckoutProvider checkoutService={ this.checkoutService }>
                        <OrderConfirmation
                            { ...this.props }
                            createAccount={ this.createAccount }
                            createEmbeddedMessenger={ createEmbeddedCheckoutMessenger }
                            createStepTracker={ this.createStepTracker }
                            embeddedStylesheet={ this.embeddedStylesheet }
                            errorLogger={ this.errorLogger }
                        />
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorBoundary>
        );
    }

    private createAccount: (values: SignUpFormValues) => Promise<CreatedCustomer> = ({
        password,
        confirmPassword,
    }) => {
        const { orderId } = this.props;

        return this.accountService.create({
            orderId,
            newsletter: false,
            password,
            confirmPassword,
        });
    };

    private createStepTracker: () => StepTracker = () => {
        //return new ListeningStepTracker(this.checkoutService);
        return createStepTracker(this.checkoutService);
    };
}

export default OrderConfirmationApp;
