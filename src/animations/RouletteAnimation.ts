import type { Participant } from '../models/Participant';

export class RouletteAnimation {
  private element: HTMLElement;
  private participants: Participant[];
  private isRunning = false;

  constructor(element: HTMLElement) {
    this.element = element;
    this.participants = [];
  }

  async spin(participants: Participant[], finalWinner: Participant, duration: number = 12000): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    // Shuffle participants to avoid appearing rigged
    this.participants = this.shuffleArray([...participants]);

    const startTime = Date.now();
    let currentIndex = 0;
    let intervalTime = 50; // Start fast

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // Animation complete - show final winner
          this.element.textContent = finalWinner.username;
          this.element.classList.add('winner-pulse');
          this.isRunning = false;

          setTimeout(() => {
            this.element.classList.remove('winner-pulse');
            resolve();
          }, 500);
          return;
        }

        // Slow down over time using easing
        const easedProgress = this.easeOutCubic(progress);
        intervalTime = 50 + (easedProgress * 450); // 50ms to 500ms

        // Show next participant
        currentIndex = (currentIndex + 1) % this.participants.length;
        this.element.textContent = this.participants[currentIndex].username;
        this.element.classList.add('spinning');

        setTimeout(animate, intervalTime);
      };

      animate();
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  stop(): void {
    this.isRunning = false;
  }
}
