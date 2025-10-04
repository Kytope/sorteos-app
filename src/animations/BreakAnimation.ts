export class BreakAnimation {
  static async playBreak(element: HTMLElement, onComplete?: () => void): Promise<void> {
    element.classList.add('breaking');

    return new Promise((resolve) => {
      setTimeout(() => {
        element.classList.add('broken');

        setTimeout(() => {
          element.classList.add('dust');

          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
            resolve();
          }, 500);
        }, 300);
      }, 400);
    });
  }
}
