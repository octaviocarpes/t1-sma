import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';

interface Event {
  type: string;
  time: number;
  currentQueue: number;
}

export class Scheduler {
  private customers: number;
  private simulations: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lastEvent: Event[];

  constructor(
    private queues: Queue[]
  ) {
    this.customers = 0;
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = []
  }

  public print(): void {
    console.log(`Total simulation time: ${this.finalTime}`);
    this.queues.forEach((queue, index) => {
      console.log(`QUEUE ${index}:`)
      queue.stateTimes.forEach((element, index) => {
        const num = element / this.finalTime
        console.log(`Total Q${index} state time: ${element} - ${(num * 100).toFixed(2)}%`)
      });
    })
  }

  public simulate(startPoint: number, times: number): void {
    let index = 0;
    this.scheduleArrival(startPoint);
    while(index < times) {
      const event = this.getFirstEvent();
      if (event.type === 'arrival') {
        this.arrival(event, event.currentQueue);
      } else this.departure(event, event.currentQueue);
      index++;
    }
  }

  private arrival(event: Event, queueIndex: number) {
    const lEvent = this.lastEvent.pop()
    const time = event.time - lEvent.time;
    this.updateQueueState(time, this.customers);
    if (this.customers < this.queues[queueIndex].maximumCapacity) {
      this.customers++;
      if (this.customers <= this.queues[queueIndex].servers) {
        this.scheduleDeparture(event.time + this.U(this.queues[queueIndex].minimumAttendanceTime, this.queues[queueIndex].maximumAttendanceTime));
        if (queueIndex < this.queues.length - 1) {
          const eventTime: number = event.time;
          const mediumTime: number = this.U(this.queues[queueIndex + 1].minimumAttendanceTime, this.queues[queueIndex + 1].maximumAttendanceTime);
          this.scheduleArrival(eventTime + mediumTime);
        }
      }
    } else {
      // console.log('loss');
      this.loss++;
    }
    this.lastEvent.push(event);
    this.scheduleArrival(event.time + this.U(this.queues[queueIndex].minimumArrivalTime, this.queues[queueIndex].maximumArrivalTime));
  }

  private departure(event: Event, queueIndex: number) {
    const lEvent = this.lastEvent.pop()
    const time = event.time - lEvent.time;
    this.updateQueueState(time, this.customers);
    this.customers--;
    this.lastEvent.push(event);
    if (this.customers >= this.queues[queueIndex].servers) {
      this.scheduleDeparture(event.time + this.U(this.queues[queueIndex].minimumAttendanceTime, this.queues[queueIndex].maximumAttendanceTime))
    }
  }

  private scheduleArrival(time: number): void {
    this.finalTime = time;
    const arrivalEvent = {
      type: 'arrival',
      time: time
    }
    this.simulations.push(arrivalEvent);
  }

  private scheduleDeparture(time: number): void {
    this.finalTime = time;
    const departureEvent = {
      type: 'departure',
      time: time
    }
    this.simulations.push(departureEvent);
  }

  private updateQueueState(time: number, index: number): void {
    this.queue.stateTimes[index] += time;
  }

  private getFirstEvent(): Event {
    const first = this.simulations.pop();
    return first;
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}
