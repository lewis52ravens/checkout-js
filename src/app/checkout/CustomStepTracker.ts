import { StepTracker } from "@bigcommerce/checkout-sdk";


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