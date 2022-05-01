// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderType = {
  "DELIVERY": "DELIVERY",
  "PICKUP": "PICKUP",
  "NONE": "NONE"
};

const { Settings, TimeSlot, OrderTypeWeight, TimeSlotBase } = initSchema(schema);

export {
  Settings,
  TimeSlot,
  OrderType,
  OrderTypeWeight,
  TimeSlotBase
};