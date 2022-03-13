import { FunctionComponent } from "enzyme";
import { FormikProps, withFormik } from "formik";
import React, { memo } from "react";
import { number, object, string } from "yup";
import { TranslatedString, withLanguage, WithLanguageProps } from "../locale";
import { Button, ButtonVariant } from "../ui/button";
import { Fieldset, Form, Input } from "../ui/form";
import { TimeSlot } from "./ScheduleInfo";

export interface ScheduleFormFooterProps {
    onSubmitSchedule(data: ScheduleFormValues): void;
    selectedDateNum?: number;
    selectedTime?: TimeSlot;
}

export interface ScheduleFormValues {
    selectedDateNum: number;
    selectedTime: string;
}

const ScheduleFormFooter: FunctionComponent<ScheduleFormFooterProps & WithLanguageProps & FormikProps<ScheduleFormValues>> = ({
    selectedDateNum,
    selectedTime,
}) => {
    const isDateSelected = selectedDateNum != undefined && selectedTime != undefined;

    return (
        <Form
            className='checkout-form'
            id='checkout-schedule'
            testId='checkout-schedule'
        >
            <Fieldset>
                <Input
                    type='hidden'
                    name="selectedDateNum"
                    value={ selectedDateNum }
                />
                <Input
                    type='hidden'
                    name="selectedTime"
                    value={ selectedTime?.displayString }
                />

                <div className="form-actions">
                    <Button
                        disabled={ !isDateSelected }
                        id="checkout-schedule-continue"
                        variant={ ButtonVariant.Primary }
                        type="submit"
                    >
                        <TranslatedString id="common.continue_action" />
                    </Button>
                </div>
            </Fieldset>
        </Form>
    );
}

export default withLanguage(withFormik<ScheduleFormFooterProps & WithLanguageProps, ScheduleFormValues>({
    mapPropsToValues: ({
        selectedDateNum,
        selectedTime,
    }) => ({
        selectedDateNum: selectedDateNum ? selectedDateNum : -1,
        selectedTime: selectedTime ? selectedTime.displayString : '',
    }),
    handleSubmit: (_values, { props: { onSubmitSchedule, selectedDateNum, selectedTime } }) => {
        const vals: ScheduleFormValues = {
            selectedDateNum: selectedDateNum ? selectedDateNum : -1,
            selectedTime: selectedTime ? selectedTime.displayString : '',
        };
        onSubmitSchedule(vals);
    },

    validationSchema: () => {
        const dateNum = number()
            .integer();
        const time = string()
            .max(256);
        const baseSchema = object({ dateNum, time });

        return baseSchema;
    },
})(memo(ScheduleFormFooter)));