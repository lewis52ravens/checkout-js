import { CheckoutService, StepTracker, StepTrackerConfig } from "@bigcommerce/checkout-sdk";

export default class CustomStepTracker implements StepTracker {

    //private tracker: StepTracker;

    constructor (_checkoutService: CheckoutService, _stepTrackerConfig?: StepTrackerConfig) {
        //this.tracker = createStepTracker(checkoutService, stepTrackerConfig);
    }

    trackOrderComplete(): void {
        console.log('Order completed');
        //return this.tracker.trackOrderComplete();
    }
    trackCheckoutStarted(): void {
        console.log('Checkout started');
        //return this.tracker.trackCheckoutStarted();
    }
    trackStepViewed(step: string): void {
        console.log('Step Viewed: ' + step);
        //return this.tracker.trackStepViewed(step);
    }
    trackStepCompleted(step: string): void {
        console.log('Step Completed: ' + step);
        //return this.tracker.trackStepCompleted(step);
    }
}

/*
export default class CustomStepTracker implements StepTracker {
    trackCheckoutStarted(): void {
        return;
    }

    trackOrderComplete(): void {
        return;
    }

    trackStepViewed(): void {
        return;
    }

    trackStepCompleted(): void {
        return;
    }
}
*/