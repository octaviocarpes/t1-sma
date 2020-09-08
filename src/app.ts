import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

const queue = new Queue({
  minimumArrivalTime: 1,
  maximumArrivalTime: 2,
  minmumCapacity: 1,
  maximumCapacity: 3,
  minimumAttendanceTime: 3,
  maximumAttendanceTime: 6,
  servers: 1
});
const scheduler = new Scheduler(queue);

scheduler.simulate(3, 100000);
scheduler.print();