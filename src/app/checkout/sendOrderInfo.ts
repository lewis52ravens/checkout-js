import { DataStore } from "@aws-amplify/datastore";
import { TimeSlot as TimeSlotAWS} from "../../models";
import { TimeSlot } from "../schedule/ScheduleInfo";


export default function sendOrderInfo(selectedTime: TimeSlot) {
    let [date, _time] = selectedTime.date.toISOString().split('T');
    date = date + 'Z';
    let [_startDate, startTime] = selectedTime.startTime.toISOString().split('T');
    let [_endDate, endTime] = selectedTime.endTime.toISOString().split('T');
    selectedTime
}