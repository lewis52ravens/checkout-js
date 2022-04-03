
from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
from typing import Iterator, List, Mapping, Optional, TypedDict, Union


class AvailableTimeRaw(TypedDict):
    startTime: str
    dayOfWeek: Decimal
    endTime: str

class SettingsRaw(TypedDict):
    __typename: str
    _lastChangedAt: Decimal
    availableTimes: List[AvailableTimeRaw]

class AvailableTime:
    startTime: time
    endTime: time
    dayOfWeek: int

    def __init__(self, timeDict: AvailableTimeRaw):
        self.dayOfWeek = int(timeDict['dayOfWeek'])
        self.startTime = parseTime(timeDict['startTime'])
        self.endTime = parseTime(timeDict['endTime'])


class Settings:
    lastChangedAt: datetime
    availableTimes: List[AvailableTime]

    def __init__(self, settingsDict: SettingsRaw):
        self.lastChangedAt = datetime.fromtimestamp(float(settingsDict['_lastChangedAt'])/1000.0)
        self.availableTimes = []
        for aTime in settingsDict['availableTimes']:
            self.availableTimes.append(AvailableTime(aTime))

class TSType(Enum):
    PICKUP = 'PICKUP'
    DELIVERY = 'DELIVERY'
    NONE = 'NONE'

class TimeSlotPayload(TypedDict):
    isDisabled: bool
    isBooked: bool
    orderID: str
    startTime: str
    endTime: str
    date: str
    type: str

class TimeSlotPayloadA(Mapping[str, Union[str, bool]]):
    isDisabled: bool
    isBooked: bool
    orderID: str
    startTime: str
    endTime: str
    date: str
    type: str

    def __init__(self, isDisabled: bool, isBooked: bool, orderID: str, startTime: str, endTime: str, date: str, type: str) -> None:
        self.isDisabled = isDisabled
        self.isBooked = isBooked
        self.orderID = orderID
        self.startTime = startTime
        self.endTime = endTime
        self.date = date
        self.type = type

    def __getitem__(self, __k: str) -> Union[str, bool]:
        if __k == 'isDisabled':
            return self.isDisabled
        elif __k == 'isBooked':
            return self.isBooked
        elif __k == 'orderID':
            return self.orderID
        elif __k == 'startTime':
            return self.startTime
        elif __k == 'endTime':
            return self.endTime
        elif __k == 'date':
            return self.date
        elif __k == 'type':
            return self.type
        else:
            return super().__getitem__(__k)
    def __iter__(self) -> Iterator[Union[str, bool]]:
        return super().__iter__()
    def __len__(self) -> int:
        return 7

class TimeSlotRaw(TypedDict):
    _lastChangedAt: Optional[Decimal]
    isDisabled: bool
    isBooked: bool
    orderID: str
    startTime: str
    endTime: str
    date: str
    type: str
    id: str
    createdAt: str
    updatedAt: str


class TimeSlot:
    lastchangedAt: Optional[datetime]
    isDisabled: bool
    isBooked: bool
    orderID: str
    startTime: time
    endTime: time
    tsDate: date
    tsType: TSType
    id: Optional[str]
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

    def __init__(self, isDisabled: bool, isBooked: bool, orderID: str, startTime: time, endTime: time, tsDate: date, tsType: TSType, id: Optional[str]=None, lastchangedAt: Optional[datetime]=None, createdAt: Optional[datetime]=None, updatedAt: Optional[datetime]=None):
        self.lastchangedAt = lastchangedAt
        self.isDisabled = isDisabled
        self.isBooked = isBooked
        self.orderID = orderID
        self.startTime = startTime
        self.endTime = endTime
        self.tsDate = tsDate
        self.tsType = tsType
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt

    @classmethod
    def fromRaw(cls, tsDict: TimeSlotRaw):
        lastChanged: Optional[datetime] = None
        createdAt: Optional[datetime] = None
        updatedAt: Optional[datetime] = None

        if tsDict['_lastChangedAt']:
            lastChanged=datetime.fromtimestamp(float(tsDict['_lastChangedAt'])/1000.0)
        if tsDict['createdAt'] == '':
            createdAt = parseDateTime(tsDict['createdAt'])
        if tsDict['updatedAt'] == '':
            updatedAt = parseDateTime(tsDict['updatedAt'])
        return cls(
            lastchangedAt=lastChanged,
            isDisabled=tsDict['isDisabled'],
            isBooked=tsDict['isBooked'],
            orderID=tsDict['orderID'],
            startTime=parseTime(tsDict['startTime']),
            endTime=parseTime(tsDict['endTime']),
            tsDate=parseDate(tsDict['date']),
            tsType=TSType(tsDict['type']),
            id=tsDict['id'],
            createdAt=createdAt,
            updatedAt=updatedAt
        )

    def toPayload(self) -> dict:
        return {
            '__typename': 'TimeSlot',
            'id': self.orderID,
            'isDisabled': self.isDisabled,
            'isBooked': self.isBooked,
            'orderID': self.orderID,
            'startTime': loadTime(self.startTime),
            'endTime': loadTime(self.endTime),
            'date': loadDate(self.tsDate),
            'type': self.tsType.value
        }

    def __str__(self):
        return '(' + str(self.tsDate) + '): ' + str(self.startTime) + ' - ' + str(self.endTime)

    def getStartDatetime(self):
        return datetime.combine(self.tsDate, self.startTime)
    
    def toJSON(self) -> dict:
        return {
            'lastChangedAt': dumpDatetime(self.lastchangedAt),
            'isDisabled': self.isDisabled,
            'isBooked': self.isBooked,
            'orderID': self.orderID,
            'startTime': self._dumpTime(self.startTime),
            'endTime': self._dumpTime(self.endTime),
            'date': dumpDate(self.tsDate),
            'type': self.tsType.name,
            'id': self.id,
            'createdAt': dumpDatetime(self.createdAt),
            'updatedAt': dumpDatetime(self.updatedAt)
        }

    def _dumpTime(self, t: time) -> float:
        dt = datetime.combine(self.tsDate, t)
        return dumpDatetime(dt)



####################################################################################################    

def dumpDate(d: date) -> float:
    t = time(0,0,0)
    dt = datetime.combine(d,t)
    return dumpDatetime(dt)

def dumpDatetime(dt: Optional[datetime]) -> float:
    if dt:
        return int(dt.timestamp() * 1000.0)
    else:
        return 0

def loadTime(value: time) -> str:
    return value.isoformat(timespec='minutes')

def loadDate(value: date) -> str:
    return value.isoformat()

def loadDateTime(value: datetime) -> str:
    dateFormat = "%Y-%m-%dT%H:%M:%S.%fZ"
    return value.strftime(dateFormat)

def parseTime(timeString: str) -> time:
    (hour, min) = timeString.split(':')
    return time(hour=int(hour), minute=int(min))

def parseDate(dateString: str) -> date:
    (year, month, day) = dateString.split('-')
    return date(int(year), int(month), int(day))

def parseDateTime(dateString: str) -> datetime:
    dateFormat = "%Y-%m-%dT%H:%M:%S.%fZ"
    return datetime.strptime(dateString, dateFormat)