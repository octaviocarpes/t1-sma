import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';
import { setTextRange } from 'typescript';
import { MultiQueue } from '../Queue/MultiQueue';

interface Event {
  time: number
  type: 'ARRIVAL' | 'TRANSITION' | 'DEPARTURE'
  destination: string
  origin: string
}

export class MultiQueueScheduler {
  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lasTime: number;
  private lastEvent: Event[];
  private queues: MultiQueue[]
  private randomNumbers: number[]

  constructor(definition: any) {
    this.queues = []

    for (let i = 0; i < definition.queues.length; i++) {
      const queue = new MultiQueue(definition.queues[i])
      this.queues.push(queue)
    }

    this.finalTime = 0;
    this.loss = 0;
    this.lastEvent = [];
    this.lasTime = 0;
    this.randomNumbers = []
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

  private getQueueByName(name: string) {
    return this.queues.filter(queue => queue.name === name)[0]
  }

  private consumeRandom() {
    return this.randomNumbers.pop()
  }

  private simulateMultiQueuesWithRouting(startPoint: number) {
    this.events.push({
      type: 'ARRIVAL',
      time: startPoint,
      destination: 'Q1',
      origin: 'Customer'
    })

    while (this.randomNumbers.length) {
      const event = this.getFirstEvent()
      this.finalTime = event.time

      switch(event.type) {
        case 'ARRIVAL':
          this.treatArrivalEvent(event)
          break;

        case 'TRANSITION':
          this.treatTransitionEvent(event)
          break;

        case 'DEPARTURE':
          this.treatDepartureEvent(event)
          break;
      }
    }

    this.print()
  }

  private treatArrivalEvent(event: Event) {
    this.contabTime(event)
    const queue = this.getQueueByName(event.destination)

    if (queue.customers < queue.maximumCapacity) {
      queue.customers++

      if (queue.customers <= queue.servers) {
        const rng = this.consumeRandom()
        const time = event.time + this.U(queue.minimumAttendanceTime, queue.maximumAttendanceTime)
        const destination = queue.drawDestination(rng)
        this.scheduleEvent({
          time,
          destination,
          origin: queue.name,
          type: 'TRANSITION'
        })
      }
    }

    const time = event.time + this.U(queue.minimumArrivalTime, queue.maximumArrivalTime)
    this.scheduleEvent({
      time,
      origin: 'Customer',
      destination: 'Q1',
      type: 'ARRIVAL'
    })
  }

  private treatTransitionEvent(event: Event) {
    this.contabTime(event)
    const originQueue = this.getQueueByName(event.origin)
    const destinationQueue = this.getQueueByName(event.destination)

    originQueue.customers--
    if (originQueue.customers >= originQueue.servers) {
      const rng = this.consumeRandom()
      const time = event.time + this.U(originQueue.minimumAttendanceTime, originQueue.maximumAttendanceTime)
      const destination = originQueue.drawDestination(rng)

      if (destination === 'OUT') {
        this.scheduleEvent({
          time,
          origin: originQueue.name,
          destination,
          type: 'DEPARTURE'
        })
      } else {
        this.scheduleEvent({
          time,
          origin: originQueue.name,
          destination,
          type: 'TRANSITION'
        })
      }
    }

    if (destinationQueue.customers < destinationQueue.maximumCapacity) {
      destinationQueue.customers++
      if (destinationQueue.customers <= destinationQueue.servers) {
        const rng = this.consumeRandom()
        const time = event.time + this.U(destinationQueue.minimumAttendanceTime, destinationQueue.maximumAttendanceTime)
        const destination = destinationQueue.drawDestination(rng)

        if (destination === 'OUT') {
          this.scheduleEvent({
            time,
            origin: destinationQueue.name,
            destination,
            type: 'DEPARTURE'
          })
        } else {
          this.scheduleEvent({
            time,
            origin: destinationQueue.name,
            destination,
            type: 'TRANSITION'
          })
        }
      }
    }
  }

  private treatDepartureEvent(event: Event) {
    this.contabTime(event)
    const queue = this.getQueueByName(event.origin)

    queue.customers--
    if (queue.customers >= queue.servers) {
      const rng = this.consumeRandom()
      const time = event.time + this.U(queue.minimumAttendanceTime, queue.maximumAttendanceTime)
      const destination = queue.drawDestination(rng)

      if (destination === 'OUT') {
        this.scheduleEvent({
          time,
          origin: queue.name,
          destination,
          type: 'DEPARTURE'
        })
      } else {
        this.scheduleEvent({
          time,
          origin: queue.name,
          destination,
          type: 'TRANSITION'
        })
      }
    }
  }

  private scheduleEvent (event: Event) {
    this.events.push(event)
  }

  public simulate(startPoint: number, iterations: number): void {
    let count = 0
    while (count < iterations) {
      count++
      const random = Math.random()
      this.randomNumbers.push(random)
    }

    this.simulateMultiQueuesWithRouting(startPoint)
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


