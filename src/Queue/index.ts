import { Event } from '../Scheduler/index'

import { totalQueues } from '../app'

export class Queue {
  public minimumArrivalTime: number;
  public maximumArrivalTime: number;
  public minmumCapacity: number;
  public maximumCapacity: number;
  public minimumAttendanceTime: number;
  public maximumAttendanceTime: number;
  public servers: number;

  public stateTimes: number[]
  private customers: number;

  constructor(data) {
    Object.assign(this, data);
    this.stateTimes = [this.maximumCapacity];
    for (let index = 0; index < this.maximumCapacity + 1; index++) {
      this.stateTimes[index] = 0;
    }
    this.customers = 0;
  }
  
  public scheduleArrival(time: number, eventQueue: number): Event[] {
    const arrivalEvent = this.arrival(time, eventQueue)
    return arrivalEvent
  }

  public scheduleDeparture(time: number, eventQueue: number): Event[] {
    const departureEvent: Event[] = this.departure(time, eventQueue);
    return departureEvent;
  }

  private arrival(time: number, eventQueue: number): Event[] {
    this.updateQueueState(time, this.customers);

    if (this.customers < this.maximumCapacity) {
      this.customers++;

      if (this.customers <= this.servers) {
        return this.scheduleDeparture(time, eventQueue);
      }

    }

    const arrivalEvent: Event = {
      type: 'arrival',
      time: time + this.U(this.minimumAttendanceTime, this.maximumAttendanceTime),
      eventQueue: eventQueue
    };

    return [arrivalEvent];
  }

  private departure(time: number, eventQueue: number): Event[] {
    this.updateQueueState(time, this.customers);
    this.customers--;

    const newTime = time + this.U(this.minimumAttendanceTime, this.maximumAttendanceTime)

    if (this.customers >= this.servers) {
      if (eventQueue < totalQueues) {
        return [...this.scheduleArrival(newTime, eventQueue + 1), ...this.scheduleDeparture(newTime, eventQueue)]
      } else {
        return [...this.scheduleDeparture(newTime, eventQueue)]
      }
    }
    return []
  }


  private updateQueueState(time: number, index: number): void {
    this.stateTimes[index] += time;
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}