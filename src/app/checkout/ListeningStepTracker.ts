import { CheckoutService, createStepTracker, StepTracker, StepTrackerConfig } from "@bigcommerce/checkout-sdk";


export default class ListeningStepTracker implements StepTracker {
    
    private tracker: StepTracker;

    constructor (checkoutService: CheckoutService, stepTrackerConfig?: StepTrackerConfig) {
        this.tracker = createStepTracker(checkoutService, stepTrackerConfig);
    }

    trackOrderComplete(): void {
        console.log('Listening to: Order completed');
        return this.tracker.trackOrderComplete();
    }

    trackCheckoutStarted(): void {
        console.log('Listening to: Checkout Started');
        return this.tracker.trackCheckoutStarted();
    }

    trackStepViewed(step: string): void {
        console.log('Listening to: Step Viewed - ' + step);
        return this.tracker.trackStepViewed(step);
    }

    trackStepCompleted(step: string): void {
        console.log('Listening to: Step Completed - ' + step)
        return this.tracker.trackStepCompleted(step);
    }
}