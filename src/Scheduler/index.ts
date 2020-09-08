import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';

interface Event {
  type: string;
  time: number;
}

export class Scheduler {
  private customers: number;
  private simulations: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lastEvent: Event[];

  constructor(
    private queue: Queue
  ) {
    this.customers = 0;
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [{ type: 'arrival', time: 0 }]
  }

  public print(): void {
    console.log(`Total simulation time: ${this.finalTime}`);
    this.queue.stateTimes.forEach((element, index) => {
      const num = element / this.finalTime
      console.log(`Total Q${index} state time: ${element} - ${(num * 100).toFixed(2)}%`)
    });
    console.log(`Loss time: ${this.finalTime - (this.queue.stateTimes.reduce((a, b) => a + b))}`);
    console.log(`Loss: ${this.loss}`);
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
    const lEvent = this.lastEvent.pop()
    const time = event.time - lEvent.time;
    this.updateQueueState(time, this.customers);
    if (this.customers < this.queue.maximumCapacity) {
      this.customers++;
      if (this.customers <= this.queue.servers) {
        this.scheduleDeparture(event.time + this.U(this.queue.minimumAttendanceTime, this.queue.maximumAttendanceTime));
      }
    } else {
      // console.log('loss');
      this.loss++;
    }
    this.lastEvent.push(event);
    this.scheduleArrival(event.time + this.U(this.queue.minimumArrivalTime, this.queue.maximumArrivalTime));
  }

  private departure(event: Event) {
    const lEvent = this.lastEvent.pop()
    const time = event.time - lEvent.time;
    this.updateQueueState(time, this.customers);
    this.customers--;
    this.lastEvent.push(event);
    if (this.customers >= this.queue.servers) {
      this.scheduleDeparture(event.time + this.U(this.queue.minimumAttendanceTime, this.queue.maximumAttendanceTime))
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
