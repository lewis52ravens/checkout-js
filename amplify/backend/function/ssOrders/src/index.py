from datetime import date, datetime, time
from enum import Enum
import json
import os
from typing import Optional, TypedDict

import boto3

from dbTypes import TSType, TimeSlot
#from amplify.backend.function.ssOrders.src.dbTypes import TSType
#from dbTypes import TSType, TimeSlot, TimeSlotRaw

#from amplify.backend.function.ssOrders.src.dbTypes import TSType, TimeSlot, TimeSlotRaw


class PostInputs(TypedDict):
    orderId: str
    orderType: TSType
    orderDate: date
    startTime: time
    endTime: time


def handler(event, context):
    print('received event:')
    print(event)

    apiId = os.environ.get('API_STONEANDSEEDADMINPANEL2_GRAPHQLAPIIDOUTPUT')
    env = os.environ.get('ENV')
    timeslotTableName = 'TimeSlot-' + str(apiId) + '-' + str(env)
    dynamo = boto3.resource('dynamodb')
    timeslotDB = dynamo.Table(timeslotTableName)

    pi = getPostParameters(event=event)
    if pi:
        ts = TimeSlot(
            isDisabled=False,
            isBooked=True,
            orderID=pi['orderId'],
            startTime=pi['startTime'],
            endTime=pi['endTime'],
            tsDate=pi['orderDate'],
            tsType=pi['orderType']
        )

        timeslotDB.put_item(
            Item=ts.toPayload()
        )

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Hello from your new Amplify Python lambda!')
    }


def getPostParameters(event: dict[str, dict[str, str]]) -> Optional[PostInputs]:
    headers = event.get('headers')
    if headers:
        orderId = headers.get('order_id')
        orderType = TSType(headers.get('type'))
        startTimeString = headers.get('startTime')
        lengthString = headers.get('length')
        if startTimeString and orderId and lengthString:
            startTimeStamp = float(startTimeString) / 1000.0
            startDateTime = datetime.fromtimestamp(startTimeStamp)
            startTime = startDateTime.time()
            length = int(lengthString)
            lengthHour = int(length/60)
            lengthMinute = float(length)/60.0 - float(lengthHour)
            endTime = startTime.replace(
                hour=startTime.hour + lengthHour, minute=startTime.minute + int(lengthMinute))
            return PostInputs(
                orderId=orderId,
                orderType=orderType,
                orderDate=startDateTime.date(),
                startTime=startTime,
                endTime=endTime
            )
