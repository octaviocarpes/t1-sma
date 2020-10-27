import TinyQueue from "tinyqueue";
import { Event } from '../Event';
import { Queue } from "../Queue";

export class SingleQueueScheduler {

  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lasTime: number;
  private lastEvent: Event[];

  constructor(
    private queue,
  ) {
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [];
    this.lasTime = 0;
  }

  public print(): void {
    console.log(`Total simulation time: ${this.finalTime}`);
    console.log(`Queue : Q${0} (G/G/${this.queue.minmumCapacity}/${this.queue.maximumCapacity})`)
      this.queue.stateTimes.forEach((element, index) => {
        const num = element / this.finalTime
        console.log(`State ${index} time: ${element} - ${(num * 100).toFixed(2)}%`)
      });
      console.log('\n')
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
    const queue = this.queue
    queue.updateQueueState(diffTime, queue.customers)
  }

  private scheduleEvent (event: Event) {
    this.events.push(event)
  }

  public simulateSingleQueue(startPoint: number, iterations: number) {
    console.log('simulating single queue...')
    let index = 0
    this.events.push(new Event('arrival', 'q-0', 'q-0', startPoint))
    const queue = this.queue
    while (index < iterations) {
      const event = this.getFirstEvent()
      this.finalTime = event.time

      index++

      if (event.type === 'arrival') {
        this.contabTime(event)
        if (queue.customers < queue.maximumCapacity) {
          queue.customers++

          if (queue.customers <= queue.servers) {
            const time = event.time + this.U(queue.minimumAttendanceTime, queue.maximumAttendanceTime)
            this.scheduleEvent(new Event('departure', 'q-0', 'q-0', time))
          }
        }
        const time = event.time + this.U(queue.minmumCapacity, queue.maximumCapacity)
        this.scheduleEvent(new Event('arrival', 'q-0', 'q-0', time))
      } else {
        this.contabTime(event)
        queue.customers--

        if (queue.customers >= queue.minmumCapacity) {
          const time = event.time + this.U(queue.minmumCapacity, queue.maximumCapacity)
          this.scheduleEvent(new Event('departure', 'q-0', 'q-0', time))
        }
      }
    }

    this.print()
  }
}