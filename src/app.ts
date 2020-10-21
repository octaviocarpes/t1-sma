import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

export const totalQueues = 2;

const queue = new Queue({
  minimumArrivalTime: 1,
  maximumArrivalTime: 4,
  minmumCapacity: 1,
  maximumCapacity: 1,
  minimumAttendanceTime: 1,
  maximumAttendanceTime: 1.5,
  servers: 1,
  routing: [
    { to: 'p12', chance: 0.8 },
    { to: 'p13', chance: 0.2 },
  ]
});

const secondQueue = new Queue({
  minimumArrivalTime: queue.minimumAttendanceTime,
  maximumArrivalTime: queue.maximumAttendanceTime,
  minmumCapacity: 3,
  maximumCapacity: 5,
  minimumAttendanceTime: 5,
  maximumAttendanceTime: 10,
  servers: 5,
  routing: [
    { to: 'sa2', chance: 0.2 },
    { to: 'p21', chance: 0.3 },
    { to: 'p23', chance: 0.5 },
  ]
});

const thirdQueue = new Queue({
  minimumArrivalTime: secondQueue.minimumAttendanceTime,
  maximumArrivalTime: secondQueue.maximumAttendanceTime,
  minmumCapacity: 2,
  maximumCapacity: 8,
  minimumAttendanceTime: 10,
  maximumAttendanceTime: 20,
  servers: 8,
  routing: [
    { to: 'p32', chance: 0.7 },
    { to: 'sa3', chance: 0.3 }
  ]
});

const scheduler = new Scheduler([queue, secondQueue, thirdQueue]);

scheduler.simulate(1, 100000);
scheduler.print();
