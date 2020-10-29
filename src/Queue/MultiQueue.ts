export class MultiQueue {
  public name: string;
  public minimumArrivalTime: number;
  public maximumArrivalTime: number;
  public minmumCapacity: number;
  public maximumCapacity: number;
  public minimumAttendanceTime: number;
  public maximumAttendanceTime: number;
  public servers: number;

  public stateTimes: number[]
  public routing: {}
  public customers: number;

  constructor(data) {
    Object.assign(this, data);
    this.stateTimes = [this.maximumCapacity];
    for (let index = 0; index < this.maximumCapacity + 1; index++) {
      this.stateTimes[index] = 0;
    }

    if (data.maximumCapacity === undefined) {
      this.maximumCapacity = Infinity
      this.stateTimes = []
      this.stateTimes.push(0)
    }

    this.customers = 0;
  }

  public updateQueueState(time: number, index: number): void {
    if (this.maximumCapacity === Infinity) {
      
      if (this.stateTimes[index] === undefined) {
        while (this.stateTimes[index] === undefined) {
          this.stateTimes.push(0)
        }
      }
    }
    this.stateTimes[index] += time
    return
  }

  public drawDestination(rng: number): string {
    const routingKeys = Object.keys(this.routing)
    const routingValues = []
    let result: string

    for (let i = 0; i < routingKeys.length; i++) {
      routingValues.push(this.routing[routingKeys[i]])
    }

    routingValues.sort()

    let count = 0

    for (let i = 0; i < routingValues.length; i++) {
      count += routingValues[i]
      if (rng < count) {
        result = routingKeys[i]
        break
      }
    }

    return result
  }
}