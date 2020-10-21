export class Event {
  public type: string;
  public from: string;
  public to: string;
  public time: number;

  constructor(type: string, from: string, to: string, time: number) {
    this.type = type
    this.from = from
    this.to = to
    this.time = time
  }
}