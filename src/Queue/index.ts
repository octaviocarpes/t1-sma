export class Queue {
  public minimumArrivalTime: number;
  public maximumArrivalTime: number;
  public minmumCapacity: number;
  public maximumCapacity: number;
  public minimumAttendanceTime: number;
  public maximumAttendanceTime: number;
  public servers: number;

  public stateTimes: number[]

  constructor(data: Omit< Queue, 'stateTimes'>) {
    Object.assign(this, data);
    this.stateTimes = [this.maximumCapacity];
    for (let index = 0; index < this.maximumCapacity + 1; index++) {
      this.stateTimes[index] = 0;
    }
  }
}