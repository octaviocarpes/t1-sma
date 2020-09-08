import { Scheduler } from "./Scheduler";
import { Queue } from "./Queue";

const queue = new Queue({
  minimumArrivalTime: 2,
  maximumArrivalTime: 4,
  minmumCapacity: 1,
  maximumCapacity: 5,
  servers: 1
});
const scheduler = new Scheduler(queue);

scheduler.simulate(3, 100);
scheduler.print();