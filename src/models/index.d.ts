import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum OrderType {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
  NONE = "NONE"
}

export declare class TimeSlotBase {
  readonly startTime: string;
  readonly endTime: string;
  readonly dayOfWeek: number;
  constructor(init: ModelInit<TimeSlotBase>);
}

type SettingsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type TimeSlotMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Settings {
  readonly id: string;
  readonly ordersPage?: string | null;
  readonly availableTimes?: (TimeSlotBase | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Settings, SettingsMetaData>);
  static copyOf(source: Settings, mutator: (draft: MutableModel<Settings, SettingsMetaData>) => MutableModel<Settings, SettingsMetaData> | void): Settings;
}

export declare class TimeSlot {
  readonly id: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime?: string | null;
  readonly isBooked?: boolean | null;
  readonly isDisabled?: boolean | null;
  readonly orderID: string;
  readonly type?: OrderType | keyof typeof OrderType | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<TimeSlot, TimeSlotMetaData>);
  static copyOf(source: TimeSlot, mutator: (draft: MutableModel<TimeSlot, TimeSlotMetaData>) => MutableModel<TimeSlot, TimeSlotMetaData> | void): TimeSlot;
}