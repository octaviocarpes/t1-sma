import TinyQueue from "tinyqueue";
import { Event } from '../Event';
import { Queue } from "../Queue";

export class DoubleQueueScheduler {

  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lasTime: number;
  private lastEvent: Event[];

  constructor(
    private queues: Queue[],
  ) {
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [];
    this.lasTime = 0;
  }

  public print(): void {
    console.log(`Total simulation time: ${this.finalTime}`);
    this.queues.forEach((queue, index) => {
      console.log(`Queue : Q${index + 1} (G/G/${queue.minmumCapacity}/${queue.maximumCapacity})`)
      queue.stateTimes.forEach((element, index) => {
        const num = element / this.finalTime
        console.log(`State ${index} time: ${element} - ${(num * 100).toFixed(2)}%`)
      });
      console.log('\n')
    })
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }

  private getFirstEvent(): Event {
    const first = this.events.pop();
    return first;
  }

  private contabTime(event: Event) {
    const diffTime = event.time - this.lasTime
    this.lasTime = event.time

    for (let i = 0; i < this.queues.length; i++) {
      const queue = this.queues[i]
      queue.updateQueueState(diffTime, queue.customers)
    }
  }

  private scheduleEvent (event: Event) {
    this.events.push(event)
  }

  public simulateDoubleQueues(startPoint: number, iterations: number) {
    console.log('simulating double queues...')
    let index = 0;
    this.events.push(new Event('ch1', 'q-0', 'q-0', startPoint))
    while(index < iterations) {
      const event = this.getFirstEvent()
      this.finalTime = event.time
      index++;

      switch (event.type) {
        case 'ch1':
          this.ch1(event);
          break;

        case 'sa2':
          this.sa2(event);
          break;

        case 'p12':
          this.p12(event);
          break;

        default:
          break;
      }
    }

    this.print()
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
    this.events.push(new Event('ch1', 'queue-0', 'queue-0', time))
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
        this.scheduleSA2(newTime)
      }
    }
  }

  private scheduleP12(time) {
    this.events.push(new Event('p12', 'queue-0', 'queue-1', time))
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
    this.events.push(new Event('sa2', 'queue-1', 'queue-1', time))
  }
}