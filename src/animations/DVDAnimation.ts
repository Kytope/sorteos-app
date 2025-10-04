export class DVDAnimation {
  private logo: HTMLImageElement;
  private x: number = 0;
  private y: number = 0;
  private vx: number = 2;
  private vy: number = 2;
  private animationId: number | null = null;
  private colors: string[] = [
    'hue-rotate(0deg)',
    'hue-rotate(60deg)',
    'hue-rotate(120deg)',
    'hue-rotate(180deg)',
    'hue-rotate(240deg)',
    'hue-rotate(300deg)'
  ];
  private currentColorIndex: number = 0;

  constructor(logoId: string = 'dvd-logo') {
    this.logo = document.getElementById(logoId) as HTMLImageElement;
    if (!this.logo) {
      console.error('DVD logo element not found');
      return;
    }

    // Posición inicial aleatoria
    this.x = Math.random() * (window.innerWidth - this.logo.offsetWidth);
    this.y = Math.random() * (window.innerHeight - this.logo.offsetHeight);

    this.updatePosition();
    this.start();
  }

  private updatePosition(): void {
    this.logo.style.left = `${this.x}px`;
    this.logo.style.top = `${this.y}px`;
  }

  private changeColor(): void {
    this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
    this.logo.style.filter = this.colors[this.currentColorIndex];
  }

  private animate = (): void => {
    const logoWidth = this.logo.offsetWidth;
    const logoHeight = this.logo.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Actualizar posición
    this.x += this.vx;
    this.y += this.vy;

    // Detectar colisión con bordes y cambiar color
    if (this.x + logoWidth >= screenWidth || this.x <= 0) {
      this.vx = -this.vx;
      this.changeColor();
      this.x = this.x <= 0 ? 0 : screenWidth - logoWidth;
    }

    if (this.y + logoHeight >= screenHeight || this.y <= 0) {
      this.vy = -this.vy;
      this.changeColor();
      this.y = this.y <= 0 ? 0 : screenHeight - logoHeight;
    }

    this.updatePosition();
    this.animationId = requestAnimationFrame(this.animate);
  };

  public start(): void {
    if (!this.animationId) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public destroy(): void {
    this.stop();
  }
}
