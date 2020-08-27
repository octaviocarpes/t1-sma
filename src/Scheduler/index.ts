import { Queue } from "../Queue";

export class Scheduler {
  constructor(
    private queue: Queue
  ) {}

  public simulate(startPoint: number): void {
    
  }

  private U(A, B): number {
    const num: number = parseFloat(Number(Math.random()).toFixed(10));
    return (B - A) * num + A;
  }
}