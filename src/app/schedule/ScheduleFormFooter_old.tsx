import React, { PureComponent, ReactNode } from "react";
import { TranslatedString } from "../locale";
import { Button, ButtonVariant } from "../ui/button";

export interface ScheduleFormFooterProps {
    onSubmit(): Promise<void>;
    isDateSelected: boolean;
}

class ScheduleFormFooter extends PureComponent<ScheduleFormFooterProps> {
    render(): ReactNode {
        const {
            onSubmit,
            isDateSelected,
        } = this.props;

        return <>
            <div className='form-actions'>
                <Button
                    disabled={ !isDateSelected }
                    id="checkout-schedule-continue"
                    onClick={ onSubmit }
                    type="submit"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </>;
    }
}

export default ScheduleFormFooter;
