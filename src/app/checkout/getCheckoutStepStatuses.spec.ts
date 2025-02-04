import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';

import { getAddressFormFields, getAddressFormFieldsWithCustomRequired } from '../address/formField.mock';
import { getBillingAddress, getEmptyBillingAddress } from '../billing/billingAddresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCustomer, getGuestCustomer } from '../customer/customers.mock';
import { getOrder } from '../order/orders.mock';
import { getPaymentMethod } from '../payment/payment-methods.mock';
import { getConsignment } from '../shipping/consignment.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import { getCheckoutWithAmazonPay, getCheckoutWithPayments } from './checkouts.mock';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';
import CheckoutStepType from './CheckoutStepType';

describe('getCheckoutStepStatuses()', () => {
    let service: CheckoutService;
    let state: CheckoutSelectors;

    beforeEach(() => {
        service = createCheckoutService();
        state = service.getState();
    });

    describe('customer step', () => {
        it('is marked as complete if email is provided by guest shopper', () => {
            jest.spyOn(state.data, 'getBillingAddress')
                .mockReturnValue(getBillingAddress());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete)
                .toEqual(true);
        });

        it('is marked as complete if email is provided by returning shopper', () => {
            jest.spyOn(state.data, 'getCustomer')
                .mockReturnValue(getCustomer());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete)
                .toEqual(true);
        });

        it('is marked as complete if email is provided by digital wallet', () => {
            jest.spyOn(state.data, 'getCheckout')
                .mockReturnValue(getCheckoutWithPayments());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete)
                .toEqual(true);
        });

        it('is marked as incomplete if email is not provided', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isComplete)
                .toEqual(false);
        });

        it('is marked as editable if email is provided by guest shopper directly', () => {
            jest.spyOn(state.data, 'getCustomer')
                .mockReturnValue(getGuestCustomer());

            // Email address is surfaced through billing address for guest shoppers
            jest.spyOn(state.data, 'getBillingAddress')
                .mockReturnValue(getBillingAddress());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isEditable)
                .toEqual(true);
        });

        it('is marked as non-editable if email is provided by digital wallet', () => {
            jest.spyOn(state.data, 'getCheckout')
                .mockReturnValue(getCheckoutWithPayments());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isEditable)
                .toEqual(false);
        });

        it('is marked as non-editable if step is incomplete', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Customer })!.isEditable)
                .toEqual(false);
        });
    });

    describe('billing step', () => {
        it('is marked as complete if billing address is provided', () => {
            jest.spyOn(state.data, 'getBillingAddress')
                .mockReturnValue(getBillingAddress());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Billing })!.isComplete)
                .toEqual(true);
        });

        it('is marked as complete if billing address is provided by digital wallet', () => {
            jest.spyOn(state.data, 'getCheckout')
                .mockReturnValue(getCheckoutWithPayments());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Billing })!.isComplete)
                .toEqual(true);
        });

        it('is marked as incomplete if billing address is not provided', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Billing })!.isComplete)
                .toEqual(false);
        });

        it('is marked as non-editable if step is incomplete', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Billing })!.isEditable)
                .toEqual(false);
        });

        describe('amazonpay', () => {
            it('is marked as complete if billing address is not provided', () => {
                jest.spyOn(state.data, 'getCheckout')
                    .mockReturnValue(getCheckoutWithAmazonPay());

                const steps = getCheckoutStepStatuses(state);

                expect(find(steps, { type: CheckoutStepType.Billing }))
                    .toHaveProperty('isComplete', true);
            });

            it('is marked as complete if billing address is not provided and custom fields are valid', () => {
                jest.spyOn(state.data, 'getCheckout')
                    .mockReturnValue(getCheckoutWithAmazonPay());
                jest.spyOn(state.data, 'getBillingAddress')
                    .mockReturnValue({
                        ...getEmptyBillingAddress(),
                        customFields: [{ fieldId: 'foo', fieldValue: 'foo' }],
                    });
                jest.spyOn(state.data, 'getBillingAddressFields')
                    .mockReturnValue(getAddressFormFieldsWithCustomRequired());

                const steps = getCheckoutStepStatuses(state);

                expect(find(steps, { type: CheckoutStepType.Billing }))
                    .toHaveProperty('isComplete', true);
            });

            it('is marked as incomplete if billing address is not provided but custom fields are invalid', () => {
                jest.spyOn(state.data, 'getCheckout')
                    .mockReturnValue(getCheckoutWithAmazonPay());
                jest.spyOn(state.data, 'getBillingAddress')
                    .mockReturnValue({
                        ...getEmptyBillingAddress(),
                        customFields: [{ fieldId: 'foo', fieldValue: '' }],
                    });
                jest.spyOn(state.data, 'getBillingAddressFields')
                    .mockReturnValue(getAddressFormFieldsWithCustomRequired());

                const steps = getCheckoutStepStatuses(state);

                expect(find(steps, { type: CheckoutStepType.Billing }))
                    .toHaveProperty('isComplete', false);
            });

            it('is marked as non-editable if step is complete and there are no custom fields', () => {
                jest.spyOn(state.data, 'getCheckout')
                    .mockReturnValue(getCheckoutWithAmazonPay());
                jest.spyOn(state.data, 'getBillingAddress')
                    .mockReturnValue(getBillingAddress());

                const steps = getCheckoutStepStatuses(state);

                expect(find(steps, { type: CheckoutStepType.Billing }))
                    .toHaveProperty('isEditable', false);
            });

            it('is marked as editable if step is complete and there is custom fields', () => {
                jest.spyOn(state.data, 'getCheckout')
                    .mockReturnValue(getCheckoutWithAmazonPay());
                jest.spyOn(state.data, 'getBillingAddress')
                    .mockReturnValue(getBillingAddress());
                jest.spyOn(state.data, 'getBillingAddressFields')
                    .mockReturnValue(getAddressFormFields());

                const steps = getCheckoutStepStatuses(state);

                expect(find(steps, { type: CheckoutStepType.Billing }))
                    .toHaveProperty('isEditable', true);
            });
        });
    });

    describe('shipping step', () => {
        it('is marked as complete if shipping address and option are provided and there are no unassigned line items', () => {
            jest.spyOn(state.data, 'getShippingAddress')
                .mockReturnValue(getShippingAddress());

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([getConsignment()]);

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete)
                .toEqual(true);
        });

        it('is marked as incomplete if shipping address is not provided', () => {
            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([getConsignment()]);

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete)
                .toEqual(false);
        });

        it('is marked as complete if shipping address is not valid but payment is amazon', () => {
            jest.spyOn(state.data, 'getShippingAddress')
                .mockReturnValue({
                    ...getShippingAddress(),
                    address1: '',
                });

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getSelectedPaymentMethod')
                .mockReturnValue({
                    ...getPaymentMethod(),
                    id: 'amazon',
                });

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([getConsignment()]);

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete)
                .toEqual(true);
        });

        it('is marked as incomplete if shipping option is not provided', () => {
            jest.spyOn(state.data, 'getShippingAddress')
                .mockReturnValue(getShippingAddress());

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([{
                    ...getConsignment(),
                    selectedShippingOption: undefined,
                }]);

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete)
                .toEqual(false);
        });

        it('is marked as incomplete if there are unassigned line items', () => {
            jest.spyOn(state.data, 'getShippingAddress')
                .mockReturnValue(getShippingAddress());

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([{
                    ...getConsignment(),
                    lineItemIds: [],
                }]);

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isComplete)
                .toEqual(false);
        });

        it('is marked as required if cart contains physical items', () => {
            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isRequired)
                .toEqual(true);
        });

        it('is marked as not required if cart does not contain physical items', () => {
            jest.spyOn(state.data, 'getCart')
                .mockReturnValue({
                    ...getCart(),
                    lineItems: {
                        ...getCart().lineItems,
                        physicalItems: [],
                    },
                });

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isRequired)
                .toEqual(false);
        });

        it('is marked as not editable if cart does not contain physical items', () => {
            jest.spyOn(state.data, 'getCustomer')
                .mockReturnValue(getCustomer());

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue(getCart());

            jest.spyOn(state.data, 'getConsignments')
                .mockReturnValue([getConsignment()]);

            jest.spyOn(state.data, 'getShippingAddress')
                .mockReturnValue(getShippingAddress());

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })!.isEditable)
                .toEqual(true);

            // Mock new state
            state = { ...state };

            jest.spyOn(state.data, 'getCart')
                .mockReturnValue({
                    ...getCart(),
                    lineItems: {
                        ...getCart().lineItems,
                        physicalItems: [],
                    },
                });

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })!.isEditable)
                .toEqual(false);
        });

        it('is marked as non-editable if step is incomplete', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Shipping })!.isEditable)
                .toEqual(false);
        });
    });

    describe('payment step', () => {
        it('is marked as complete if order is complete', () => {
            jest.spyOn(state.data, 'getOrder')
                .mockReturnValue(getOrder());

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Payment })!.isComplete)
                .toEqual(true);
        });

        it('is marked as incomplete if order is incomplete', () => {
            jest.spyOn(state.data, 'getOrder')
                .mockReturnValue({
                    ...getOrder(),
                    isComplete: false,
                });

            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Payment })!.isComplete)
                .toEqual(false);
        });

        it('is marked as non-editable if step is incomplete', () => {
            const steps = getCheckoutStepStatuses(state);

            // tslint:disable-next-line:no-non-null-assertion
            expect(find(steps, { type: CheckoutStepType.Payment })!.isEditable)
                .toEqual(false);
        });
    });

    it('returns steps in order', () => {
        const steps = getCheckoutStepStatuses(state);

        expect(steps.map(step => step.type))
            .toEqual([
                CheckoutStepType.Customer,
                CheckoutStepType.Shipping,
                CheckoutStepType.Billing,
                CheckoutStepType.Schedule,
                CheckoutStepType.Payment,
            ]);
    });

    it('marks latter steps as non-editable if earlier steps are incomplete', () => {
        jest.spyOn(state.data, 'getShippingAddress')
            .mockReturnValue(undefined);

        jest.spyOn(state.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(state.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        const steps = getCheckoutStepStatuses(state);

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(steps, { type: CheckoutStepType.Billing })!.isEditable)
            .toEqual(false);
    });

    it('does not mark latter steps as non-editable if earlier steps are complete', () => {
        jest.spyOn(state.data, 'getBillingAddress')
            .mockReturnValue(getBillingAddress());

        jest.spyOn(state.data, 'getShippingAddress')
            .mockReturnValue(getShippingAddress());

        jest.spyOn(state.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(state.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        const steps = getCheckoutStepStatuses(state);

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(steps, { type: CheckoutStepType.Billing })!.isEditable)
            .toEqual(true);
    });

    it('marks first incomplete step as active', () => {
        const steps = getCheckoutStepStatuses(state);

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(steps, { type: CheckoutStepType.Customer })!.isActive)
            .toEqual(true);
    });

    it('does not mark incomplete step as active if it is not required', () => {
        jest.spyOn(state.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        // If cart has physical items, shipping step should be active
        jest.spyOn(state.data, 'getCart')
            .mockReturnValue(getCart());

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })!.isActive)
            .toEqual(true);

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Billing })!.isActive)
            .toEqual(false);

        // Mock a new state
        state = { ...state };

        // If cart has no physical item, shipping step shouldn't be active
        jest.spyOn(state.data, 'getCart')
            .mockReturnValue({
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [],
                },
            });

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Shipping })!.isActive)
            .toEqual(false);

        // tslint:disable-next-line:no-non-null-assertion
        expect(find(getCheckoutStepStatuses(state), { type: CheckoutStepType.Billing })!.isActive)
            .toEqual(true);
    });
});
