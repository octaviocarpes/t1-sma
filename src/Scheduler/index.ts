import { Queue } from '../Queue';
import TinyQueue from 'tinyqueue';
import { Event } from '../Event';

export class Scheduler {
  private events: TinyQueue<Event> = new TinyQueue([], (a, b) => { return a.time - b.time });
  private finalTime: number;
  private loss: number;
  private lasTime: number;
  private lastEvent: Event[];

  constructor(
    private queues: Queue[]
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

  private getFirstEvent(): Event {
    const first = this.events.pop();
    return first;
  }

  private simulateSingleQueue(startPoint: number, iterations: number) {
    console.log('simulating single queue...')
    let index = 0
    this.events.push(new Event('arrival', 'q-0', 'q-0', startPoint))
    const queue = this.queues[0]
    while (index < iterations) {
      const event = this.getFirstEvent()
      // console.log(event)
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
  }

  private simulateDoubleQueues(startPoint: number, iterations: number) {
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
  }

  private simulateMultiQueuesWithRouting(startPoint: number, iterations: number) {
    let index = 0
    this.events.push(new Event('ch1', 'queue-0', 'queue-0', startPoint))

    while (index < iterations) {
      index++
      const event = this.getFirstEvent()
      this.finalTime = event.time

      switch(event.type) {
        case 'ch1':
          this.multiQueueCH1(event) // ok

        case 'p12':
          this.multiQueueP12(event) // ok

        case 'p13':
          this.multiQueueP13(event) // ok

        case 'sa2':
          this.multiQueueSA2(event) // ok

        case 'p21':
          this.multiQueueP21(event) // ok

        case 'p23':
          this.multiQueueP23(event) // ok

        case 'sa3':
          this.multiQueueSA3(event) // ok

        case 'p32':
          this.multiQueueP32(event) // ok

      }
    }
  }

  private multiQueueCH1(event: Event) {
    this.contabTime(event)
    const queue = this.queues[0]

    if (queue.customers < queue.maximumCapacity) {
      queue.customers++

      if (queue.customers <= queue.servers) {
        const rng = Math.random()
        const time = event.time + this.U(queue.minimumAttendanceTime, queue.maximumAttendanceTime)

        if (rng < queue.routing[0].chance) {
          this.events.push(new Event(queue.routing[0].to, 'queue-0', 'queue-1', time))
        } else {
          this.events.push(new Event(queue.routing[1].to, 'queue-0', 'queue-2', time))
        }
      }
    }
    const time = event.time + this.U(queue.minimumArrivalTime, queue.maximumArrivalTime)
    this.events.push(new Event('ch1', 'queue-0', 'queue-0', time))
  }

  private multiQueueP12(event: Event) {
    this.contabTime(event)
    const firstQueue = this.queues[0]
    const secondQueue = this.queues[1]

    firstQueue.customers--
    if (firstQueue.customers >= firstQueue.servers) {
      const rng = Math.random()
      const time = event.time + this.U(firstQueue.maximumAttendanceTime, firstQueue.maximumAttendanceTime)

      if (rng < firstQueue.routing[0].chance) {
        this.events.push(new Event(firstQueue.routing[0].to, 'queue-0', 'queue-1', time))
      } else {
        this.events.push(new Event(firstQueue.routing[1].to, 'queue-0', 'queue-2', time))
      }
    }

    secondQueue.customers++
    if (secondQueue.customers <= secondQueue.minmumCapacity) {
      const time = event.time + this.U(secondQueue.maximumAttendanceTime, secondQueue.maximumAttendanceTime)
      this.events.push(new Event('sa2', 'queue-1', 'out', time))
    }
  }

  private multiQueueP13(event: Event) {
    this.contabTime(event)
    const firstQueue = this.queues[0]
    const thirdQueue = this.queues[2]

    firstQueue.customers--
    if (firstQueue.customers >= firstQueue.servers) {
      const rng = Math.random()
      const time = event.time + this.U(firstQueue.maximumAttendanceTime, firstQueue.maximumAttendanceTime)

      if (rng < firstQueue.routing[0].chance) {
        this.events.push(new Event(firstQueue.routing[0].to, 'queue-0', 'queue-1', time))
      } else {
        this.events.push(new Event(firstQueue.routing[1].to, 'queue-0', 'queue-2', time))
      }
    }

    thirdQueue.customers++
    if (thirdQueue.customers <= thirdQueue.minmumCapacity) {
      const time = event.time + this.U(thirdQueue.maximumAttendanceTime, thirdQueue.maximumAttendanceTime)
      this.events.push(new Event('sa3', 'queue-2', 'out', time))
    }
  }

  private multiQueueSA2(event: Event) {
    this.contabTime(event)
    const queue = this.queues[1]

    queue.customers--
    if (queue.customers >= queue.minmumCapacity) {
      const time = event.time + this.U(queue.maximumAttendanceTime, queue.maximumAttendanceTime)
      this.events.push(new Event('sa2', 'queue-2', 'out', time))
    }
  }

  private multiQueueP21(event: Event) {
    this.contabTime(event)
    const firstQueue = this.queues[0]
    const secondQueue = this.queues[1]

    secondQueue.customers--
    if (secondQueue.customers >= secondQueue.servers) {
      const rng = Math.random()
      const time = event.time + this.U(secondQueue.maximumAttendanceTime, secondQueue.maximumAttendanceTime)

      if (rng < secondQueue.routing[0].chance) {
        this.events.push(new Event(secondQueue.routing[0].to, 'queue-1', 'out', time))
      } else if (rng < secondQueue.routing[1].chance) {
        this.events.push(new Event(secondQueue.routing[1].to, 'queue-1', 'queue-0', time))
      } else {
        this.events.push(new Event(secondQueue.routing[2].to, 'queue-1', 'queue-2', time))
      }
    }

    firstQueue.customers++
    if (firstQueue.customers <= firstQueue.minmumCapacity) {
      const rng = Math.random()
      const time = event.time + this.U(firstQueue.maximumAttendanceTime, firstQueue.maximumAttendanceTime)

      if (rng < firstQueue.routing[0].chance) {
        this.events.push(new Event(firstQueue.routing[0].to, 'queue-0', 'queue-1', time))
      } else {
        this.events.push(new Event(firstQueue.routing[1].to, 'queue-0', 'queue-2', time))
      }
    }
  }

  private multiQueueP23(event: Event) {
    this.contabTime(event)
    const secondQueue = this.queues[1]
    const thirdQueue = this.queues[2]

    secondQueue.customers--
    if (secondQueue.customers >= secondQueue.servers) {
      const rng = Math.random()
      const time = event.time + this.U(secondQueue.maximumAttendanceTime, secondQueue.maximumAttendanceTime)

      if (rng < secondQueue.routing[0].chance) {
        this.events.push(new Event(secondQueue.routing[0].to, 'queue-1', 'out', time))
      } else if (rng < secondQueue.routing[1].chance) {
        this.events.push(new Event(secondQueue.routing[1].to, 'queue-1', 'queue-0', time))
      } else {
        this.events.push(new Event(secondQueue.routing[2].to, 'queue-1', 'queue-2', time))
      }
    }

    thirdQueue.customers++
    if (thirdQueue.customers <= thirdQueue.minmumCapacity) {
      const time = event.time + this.U(thirdQueue.maximumAttendanceTime, thirdQueue.maximumAttendanceTime)
      this.events.push(new Event('sa3', 'queue-2', 'out', time))
    }
  }

  private multiQueueP32(event: Event) {
    this.contabTime(event)
    const thirdQueue = this.queues[2]
    const secondQueue = this.queues[1]

    thirdQueue.customers--
    if (thirdQueue.customers >= thirdQueue.servers) {
      const rng = Math.random()
      const time = event.time + this.U(thirdQueue.maximumAttendanceTime, thirdQueue.maximumAttendanceTime)

      if (rng < thirdQueue.routing[0].chance) {
        this.events.push(new Event(thirdQueue.routing[0].to, 'queue-2', 'queue-1', time))
      } else {
        this.events.push(new Event(thirdQueue.routing[1].to, 'queue-2', 'out', time))
      }
    }

    secondQueue.customers++
    if (secondQueue.customers <= secondQueue.minmumCapacity) {
      const rng = Math.random()
      const time = event.time + this.U(secondQueue.maximumAttendanceTime, secondQueue.maximumAttendanceTime)

      if (rng < secondQueue.routing[0].chance) {
        this.events.push(new Event(secondQueue.routing[0].to, 'queue-1', 'out', time))
      } else if (rng < secondQueue.routing[1].chance) {
        this.events.push(new Event(secondQueue.routing[1].to, 'queue-1', 'queue-0', time))
      } else {
        this.events.push(new Event(secondQueue.routing[2].to, 'queue-1', 'queue-2', time))
      }
    }
  }

  private multiQueueSA3(event: Event) {
    this.contabTime(event)
    const queue = this.queues[2]

    queue.customers--
    if (queue.customers >= queue.minmumCapacity) {
      const time = event.time + this.U(queue.maximumAttendanceTime, queue.maximumAttendanceTime)
      this.events.push(new Event('sa3', 'queue-2', 'out', time))
    }
  }



  private scheduleEvent (event: Event) {
    this.events.push(event)
  }

  public simulate(startPoint: number, iterations: number): void {
    let index = 0;

    if (this.queues.length > 2) {
      // multi queue algorithm
      this.simulateMultiQueuesWithRouting(startPoint, iterations)
    } else if (this.queues.length === 2) {
      // simulate two queue algorithm
      this.simulateDoubleQueues(startPoint, iterations)
    } else if (this.queues.length === 1) {
      // simulate single queue algorithm
      // this.singleQueueSimulator.simulateSingleQueue(startPoint, iterations)
      this.simulateSingleQueue(startPoint, iterations)
    }
  }

  private contabTime(event: Event) {
    const diffTime = event.time - this.lasTime
    this.lasTime = event.time

    for (let i = 0; i < this.queues.length; i++) {
      const queue = this.queues[i]
      queue.updateQueueState(diffTime, queue.customers)
    }
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

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}


