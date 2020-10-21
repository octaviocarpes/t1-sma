export interface Routing {
  to: string
  chance: number
}
export class Queue {
  public minimumArrivalTime: number;
  public maximumArrivalTime: number;
  public minmumCapacity: number;
  public maximumCapacity: number;
  public minimumAttendanceTime: number;
  public maximumAttendanceTime: number;
  public servers: number;

  public stateTimes: number[]
  public customers: number;
  public routing: Routing[]

  constructor(data) {
    Object.assign(this, data);
    this.stateTimes = [this.maximumCapacity];
    for (let index = 0; index < this.maximumCapacity + 1; index++) {
      this.stateTimes[index] = 0;
    }
    this.customers = 0;
  }

  public updateQueueState(time: number, index: number): void {
    if (index > this.maximumCapacity) {
      return
    }
    this.stateTimes[index] += time;
  }
}
