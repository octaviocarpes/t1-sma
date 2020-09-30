import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';

export interface Event {
  type: string;
  time: number;
  eventQueue: number;
}

export class Scheduler {
  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lastEvent: Event[];

  constructor(
    private queues: Queue[]
  ) {
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [];
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

  private getFirstEvent(): Event {
    const first = this.events.pop();
    return first;
  }

  public simulate(startPoint: number, iterations: number): void {
    let index = 0;
    const firstEvents: Event[] = this.queues[0].scheduleArrival(startPoint, 0);
    console.log(firstEvents)
    this.events.push(firstEvents[0]);

    while(index < iterations) {
      const event = this.getFirstEvent();
      if (event.type === 'arrival') {
        const newEvent: Event[] = this.queues[event.eventQueue].scheduleArrival(event.time, event.eventQueue);
        newEvent.forEach(event => {
          this.events.push(event);
        });
      } else {
        const newEvent: Event[] = this.queues[event.eventQueue].scheduleDeparture(event.time, event.eventQueue);
        newEvent.forEach(event => {
          this.events.push(event);
        });
      }
      index++;
    }
  }
}
