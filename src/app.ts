import { MultiQueueScheduler } from "./MultiQueueScheduler";
import { Queue } from "./Queue";

import { SingleQueueScheduler } from './SingleQueueScheduler'
import { DoubleQueueScheduler } from './DoubleQueueScheduler'

export const totalQueues = 2;

const Q1 = new Queue({
  minimumArrivalTime: 1,
  maximumArrivalTime: 4,
  minmumCapacity: 1,
  maximumCapacity: 1,
  minimumAttendanceTime: 1,
  maximumAttendanceTime: 1.5,
  servers: 1
});

const Q2 = new Queue({
  minimumArrivalTime: Q1.minimumAttendanceTime,
  maximumArrivalTime: Q1.maximumAttendanceTime,
  minmumCapacity: 3,
  maximumCapacity: 5,
  minimumAttendanceTime: 5,
  maximumAttendanceTime: 10,
  servers: 5
});

const Q3 = new Queue({
  minimumArrivalTime: Q2.minimumAttendanceTime,
  maximumArrivalTime: Q2.maximumAttendanceTime,
  minmumCapacity: 2,
  maximumCapacity: 8,
  minimumAttendanceTime: 10,
  maximumAttendanceTime: 20,
  servers: 8
});

const network = [
  {
    'Q-1': {
      name: 'Q0-Q1',
      from: 0,
      to: 1,
      chance: 0.8
    },
    'Q-2': {
      name: 'Q0-Q2',
      from: 0,
      to: 2,
      chance: 0.2
    }
  },
  {
    'Q-0': {
      name: 'Q1-Q0',
      from: 1,
      to: 0,
      chance: 0.3
    },
    'Q-2': {
      name: 'Q1-Q2',
      from: 1,
      to: 2,
      chance: 0.5
    },
  },
  {
    'Q-1': {
      name: 'Q2-Q1',
      from: 2,
      to: 1,
      chance: 0.7
    },
  }
]

const queues = [Q1, Q2, Q3]

if (queues.length === 1) {
  const scheduler = new SingleQueueScheduler(queues[0])
  scheduler.simulateSingleQueue(1, 100000)
} else if (queues.length === 2) {
  const scheduler = new DoubleQueueScheduler(queues)
  scheduler.simulateDoubleQueues(2.5, 100000)
} else if (queues.length > 2) {
  const scheduler = new MultiQueueScheduler(queues, network)
  scheduler.simulate(1, 100000)
}
