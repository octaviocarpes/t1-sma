import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';
import { setTextRange } from 'typescript';

interface Event {
  from: string,
  to: string,
  time: number
  type: string
}

export class MultiQueueScheduler {
  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private eventTypes: any[]
  private finalTime: number;
  private loss: number;
  private lasTime: number;
  private lastEvent: Event[];

  constructor(
    private queues: Queue[],
    private network: any
  ) {
    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [];
    this.lasTime = 0;
    this.eventTypes = []
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

  private getFirstEvent(): Event {
    const first = this.events.pop();
    return first;
  }

  private simulateMultiQueuesWithRouting(startPoint: number, iterations: number) {
    let index = 0
    this.events.push({
      type: 'ch-1',
      from: 'Q-0',
      to: 'Q-0',
      time: startPoint
    })

    while (index < iterations) {
      index++
      const event = this.getFirstEvent()
      this.finalTime = event.time

      // console.log(event, index)

      switch(event.type) {
        case 'ch-1':
          this.ch(event, this.queues[0])
          break;

        case 'p-12':
          this.p(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'p-13':
          this.p(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'p-21':
          this.p(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'p-23':
          this.p(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'sa-2':
          this.sa(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'p-32':
          this.p(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        case 'sa-3':
          this.sa(event, this.getQueueIndex(event.from), this.getQueueIndex(event.to))
          break;

        default:
          break;
      }
    }

    this.print()
  }

  private drawQueue(randomNumber, network) {
    console.log(network)
    const keys = Object.keys(network)
    for(let i = 0; i < keys.length; i++) {
      console.log(network[keys[i]].chance)
    }
    return 0
  }

  private ch(event: Event, firstQ: Queue) {
    this.contabTime(event)

    if (firstQ.customers < firstQ.maximumCapacity) {
      firstQ.customers++

      if (firstQ.customers <= firstQ.servers) {
        const randomNumber = Math.random()
        const time = event.time + this.U(firstQ.minimumAttendanceTime, firstQ.maximumAttendanceTime)
        const q0Network = this.network[0]

        if (q0Network['Q-1'].chance < randomNumber) {
          this.scheduleEvent({
            type: 'p-12',
            from: 'Q-0',
            to: 'Q-1',
            time: time
          })
        } else {
          this.scheduleEvent({
            type: 'p-13',
            from: 'Q-0',
            to: 'Q-2',
            time: time
          })
        }
      }
    }
    const time = event.time + this.U(firstQ.minimumArrivalTime, firstQ.maximumArrivalTime)
    this.scheduleEvent({
      type: 'ch-1',
      from: 'Q-0',
      to: 'Q-0',
      time: time
    })
  }

  private p(event: Event, firstQ: number, secondQ: number) {
    this.contabTime(event)
    const first = this.queues[firstQ]
    const second = this.queues[secondQ]
    first.customers--

    if (first.customers >= first.servers) {
      const randomNumber = Math.random()
      const time = event.time + this.U(first.minimumAttendanceTime, first.maximumAttendanceTime)

      const selectedQueue = this.drawQueue(randomNumber, this.network[firstQ])

      this.scheduleEvent({
        type: `p-${first}${selectedQueue}`,
        from: `Q-${first}`,
        to: `Q-${selectedQueue}`,
        time: time,
      })
    }

    second.customers++

    if (second.customers <= second.servers) {
      const time = event.time + this.U(second.minimumAttendanceTime, second.maximumAttendanceTime)
      this.scheduleEvent({
        type: `sa-${secondQ}`,
        from: `Q-${secondQ}`,
        to: 'OUT',
        time: time,
      })
    }
  }
  
  private sa(event: Event, firstQ: number, secondQ: number) {
    this.contabTime(event)
    const first = this.queues[firstQ]

    first.customers--
    if (first.customers >= first.servers) {
      const randomNumber = Math.random()
      const time = event.time + this.U(first.minimumAttendanceTime, first.maximumAttendanceTime)

      const selectedQueue = this.drawQueue(randomNumber, this.network[firstQ])

      this.scheduleEvent({
        type: `p-${first}${selectedQueue}`,
        from: `Q-${first}`,
        to: `Q-${selectedQueue}`,
        time: time,
      })
    }
  }

  private getQueueIndex (name: string): number {
    return parseInt(name.split('-')[1])
  }

  private scheduleEvent (event: Event) {
    this.events.push(event)
  }

  public simulate(startPoint: number, iterations: number): void {
    this.simulateMultiQueuesWithRouting(startPoint, iterations)
  }

  private contabTime(event: Event) {
    const diffTime = event.time - this.lasTime
    this.lasTime = event.time

    for (let i = 0; i < this.queues.length; i++) {
      const queue = this.queues[i]
      queue.updateQueueState(diffTime, queue.customers)
    }
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}


