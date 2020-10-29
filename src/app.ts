import { MultiQueueScheduler } from "./MultiQueueScheduler";
import definition from "./definition.json"
import { Queue } from "./Queue";

import { SingleQueueScheduler } from './SingleQueueScheduler'
import { DoubleQueueScheduler } from './DoubleQueueScheduler'

// const Q1 = new Queue({
//   minimumArrivalTime: 1,
//   maximumArrivalTime: 4,
//   minmumCapacity: 1,
//   maximumCapacity: 1,
//   minimumAttendanceTime: 1,
//   maximumAttendanceTime: 1.5,
//   servers: 1
// });

// const Q2 = new Queue({
//   minimumArrivalTime: Q1.minimumAttendanceTime,
//   maximumArrivalTime: Q1.maximumAttendanceTime,
//   minmumCapacity: 3,
//   maximumCapacity: 5,
//   minimumAttendanceTime: 5,
//   maximumAttendanceTime: 10,
//   servers: 5
// });

// const Q3 = new Queue({
//   minimumArrivalTime: Q2.minimumAttendanceTime,
//   maximumArrivalTime: Q2.maximumAttendanceTime,
//   minmumCapacity: 2,
//   maximumCapacity: 8,
//   minimumAttendanceTime: 10,
//   maximumAttendanceTime: 20,
//   servers: 8
// });

// const queues = [Q1, Q2, Q3]

const scheduler = new MultiQueueScheduler(definition)
scheduler.simulate(1, 100000)
