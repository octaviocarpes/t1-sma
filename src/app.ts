import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

const queue = new Queue({
  minimumArrivalTime: 20,
  maximumArrivalTime: 40,
  minmumCapacity: 1,
  maximumCapacity: 5,
  minimumAttendanceTime: 10,
  maximumAttendanceTime: 12,
  servers: 1
});
const scheduler = new Scheduler(queue);

scheduler.simulate(3, 100000);
scheduler.print();
