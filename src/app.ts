import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

export const totalQueues = 2;

const queue = new Queue({
  minimumArrivalTime: 2,
  maximumArrivalTime: 3,
  minmumCapacity: 1,
  maximumCapacity: 5,
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
  servers: 2
});

const scheduler = new Scheduler([queue, secondQueue]);

scheduler.simulate(3, 100000);
scheduler.print();
