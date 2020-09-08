import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';

interface Event {
  type: string;
  time: number;
}

interface Loss {
  type: string
}

export class Scheduler {
  private customers: number;
  private simulations: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private lastEvent: Event;

  constructor(
    private queue: Queue
  ) {
    this.customers = 0;
    this.finalTime = 0;
    this.lastEvent = { type: 'arrival', time: 0 }
  }

  public print(): void {
    console.log(this.simulations.length);
    console.log(this.customers);
    console.log(this.finalTime);
    console.log(this.queue.stateTimes);
  }

  public simulate(startPoint: number, times: number): void {
    let index = 0;
    this.scheduleArrival(startPoint);
    while(index < times) {
      const event = this.getFirstEvent();
      if (event.type === 'arrival') {
        this.arrival(event);
      } else this.departure(event);
      index++;
    }
  }

  private arrival(event: Event) {
    const time = this.finalTime - this.lastEvent.time;
    this.updateQueueState(time, this.customers);
    if (this.customers < this.queue.maximumCapacity) {
      this.customers++;
      if (this.customers <= this.queue.servers) {
        this.scheduleDeparture(event.time + this.U(this.queue.minmumCapacity, this.queue.maximumCapacity));
      }
    } else {
      console.log('loss');
    }
    this.lastEvent = Object.assign(event);
    this.scheduleArrival(event.time + this.U(this.queue.minimumArrivalTime, this.queue.maximumArrivalTime));
  }
  
  private departure(event: Event) {
    const time = this.finalTime - this.lastEvent.time;
    this.updateQueueState(time, this.customers);
    this.customers--;
    if (this.customers >= this.queue.servers) {
      this.lastEvent = Object.assign(event);
      this.scheduleDeparture(this.U(event.time + this.queue.minmumCapacity, this.queue.maximumCapacity))
    }
  }

  private scheduleArrival(time: number): void {
    this.finalTime = this.finalTime + time;
    const arrivalEvent = {
      type: 'arrival',
      time: time
    }
    this.simulations.push(arrivalEvent);
  }
  
  private scheduleDeparture(time: number): void {
    this.finalTime = this.finalTime + time;
    const departureEvent = {
      type: 'departure',
      time: time
    }
    this.simulations.push(departureEvent);
  }

  private updateQueueState(time: number, index: number): void {
    this.queue[index]+=time;
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