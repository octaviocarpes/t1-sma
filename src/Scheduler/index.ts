import { Queue } from "../Queue";

export class Scheduler {
  private customers: number;
  private simulations: any[];
  private finalTime: number;

  constructor(
    private queue: Queue
  ) {
    this.customers = 0;
    this.simulations = [];
  }

  public print(): void {
    // console.log(this.simulations);
  }

  public simulate(startPoint: number, times: number): void {
    console.time("Simultaion")
    let index = 0;
    this.scheduleArrival(startPoint)
    while(index < times) {
      const event = this.getFirstEvent();
      console.log(event)
      if (event.type === 'arrival') {
        this.arrival();
      } else this.departure();
      index++;
    }
    console.timeEnd("Simultaion")
  }

  private arrival() {
    if (this.customers < this.queue.minmumCapacity) {
      this.customers++;
      if (this.customers <= this.queue.minimumArrivalTime) {
        this.scheduleDeparture(this.U(this.queue.minmumCapacity, this.queue.maximumCapacity));
      }
    }
    const time = this.U(this.queue.minimumArrivalTime, this.queue.maximumArrivalTime);
    this.scheduleArrival(time);
  }
  
  private departure() {
    const time = this.U(this.queue.minmumCapacity, this.queue.maximumCapacity);
    this.customers--;
    if (this.customers >= this.queue.minimumArrivalTime) {
      this.scheduleDeparture(time)
    }
  }

  private scheduleArrival(time: number): void {
    const arrivalEvent = {
      type: 'arrival',
      time: time
    }
    this.simulations.push(arrivalEvent);
  }
  
  private scheduleDeparture(time: number): void {
    const departureEvent = {
      type: 'departure',
      time: time
    }
    this.simulations.push(departureEvent);
  }

  private getFirstEvent(): any {
    const first = this.simulations[this.simulations.length - 1];
    return first;
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}