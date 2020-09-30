import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

export const totalQueues = 2;

const queue = new Queue({
  minimumArrivalTime: 2,
  maximumArrivalTime: 3,
  minmumCapacity: 2,
  maximumCapacity: 3,
  minimumAttendanceTime: 2,
  maximumAttendanceTime: 5,
  servers: 2
});

const secondQueue = new Queue({
  minimumArrivalTime: queue.minimumAttendanceTime,
  maximumArrivalTime: queue.maximumAttendanceTime,
  minmumCapacity: 1,
  maximumCapacity: 3,
  minimumAttendanceTime: 3,
  maximumAttendanceTime: 5,
  servers: 3
});

const scheduler = new Scheduler([queue, secondQueue]);

scheduler.simulate(2.5, 100000);
scheduler.print();
