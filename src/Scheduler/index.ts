import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';

export interface Event {
  type: 'ch1'| 'sa2' | 'p12';
  time: number;
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
    this.events.push({
      time: startPoint,
      type: 'ch1',
    });

    while(index < iterations) {
      const event = this.getFirstEvent()
      index++;

      console.log(event)

      switch (event.type) {
        case 'ch1':
          this.ch1(event);
          return;

        case 'sa2':
          this.sa2(event);
          return;

        case 'p12':
          this.p12(event);
          return;

        default:
          return;
      }
    }
  }

  private contabTime(event: Event) {
    const firstQueue = this.queues[0];
    const secondQueue = this.queues[1];
    firstQueue.updateQueueState(event.time, firstQueue.customers)
    secondQueue.updateQueueState(event.time, secondQueue.customers)
  }

  private ch1(event : Event) {
    const firstQueue = this.queues[0]
    this.contabTime(event)

    if (firstQueue.customers < firstQueue.maximumCapacity) {
      firstQueue.customers++;

      if (firstQueue.customers <= firstQueue.servers) {
        // Agenda p12
        const newTime = event.time + this.U(firstQueue.minimumAttendanceTime, firstQueue.maximumAttendanceTime)
        this.scheduleP12(newTime)
      }
    }
    //Agenda ch1
    const newTime = event.time + this.U(firstQueue.minmumCapacity, firstQueue.maximumCapacity)
    this.scheduleCh1(newTime)
  }

  private scheduleCh1(time) {
    this.events.push({
      time,
      type: 'ch1',
    })
  }

  private p12(event: Event) {
    this.contabTime(event)
    const firstQueue = this.queues[0]
    const secondQueue = this.queues[1]

    firstQueue.customers--;

    if (firstQueue.customers >= firstQueue.minimumAttendanceTime) {
      const newTime = event.time + this.U(firstQueue.minimumAttendanceTime, firstQueue.maximumAttendanceTime)
      this.scheduleP12(newTime)
    }

    if (secondQueue.customers < secondQueue.maximumCapacity) {
      secondQueue.customers++;

      if (secondQueue.customers <= secondQueue.minmumCapacity) {
        const newTime = event.time + this.U(secondQueue.minimumAttendanceTime, secondQueue.maximumAttendanceTime)
        this.scheduleP12(newTime)
      }
    }
  }

  private scheduleP12(time) {
    this.events.push({
      time,
      type: 'p12',
    })
  }

  private sa2(event: Event) {
    this.contabTime(event)
    const secondQueue = this.queues[1]

    secondQueue.customers--;

    if (secondQueue.customers >= secondQueue.minmumCapacity) {
      const newTime = event.time + this.U(secondQueue.minimumAttendanceTime, secondQueue.maximumAttendanceTime)
      this.scheduleSA2(newTime)
    }
  }

  private scheduleSA2(time) {
    this.events.push({
      time,
      type: 'sa2',
    })
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}



