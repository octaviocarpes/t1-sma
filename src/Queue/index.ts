export class Queue {
  public minimumArrivalTime: number;
  public maximumArrivalTime: number;
  public minmumCapacity: number;
  public maximumCapacity: number;
  public servers: number;

  constructor(data: Omit<Queue, 'queue'>) {
    Object.assign(this, data);
  }
}