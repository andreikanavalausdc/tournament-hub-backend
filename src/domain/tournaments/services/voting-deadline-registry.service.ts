import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class VotingDeadlineRegistryService implements OnModuleDestroy {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  schedule(roundId: string, deadline: Date, callback: () => void | Promise<void>): void {
    this.cancel(roundId);

    const delay = Math.max(0, deadline.getTime() - Date.now());
    const timer = setTimeout(() => {
      this.timers.delete(roundId);
      void callback();
    }, delay);

    this.timers.set(roundId, timer);
  }

  cancel(roundId: string): void {
    const timer = this.timers.get(roundId);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(roundId);
    }
  }

  onModuleDestroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
  }
}
