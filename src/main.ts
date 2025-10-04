import './style.css';
import { ParserService } from './services/ParserService';
import { RaffleService } from './services/RaffleService';
import { BreakAnimation } from './animations/BreakAnimation';
import { ParticleSystem } from './animations/ParticleSystem';
import { RouletteAnimation } from './animations/RouletteAnimation';
import { DVDAnimation } from './animations/DVDAnimation';
import type { Participant } from './models/Participant';

class SorteosApp {
  private raffleService: RaffleService | null = null;
  private particleSystem: ParticleSystem;
  private rouletteAnimation: RouletteAnimation;
  private dvdAnimation: DVDAnimation;
  private isAnimating = false;
  private currentSelected: Participant | null = null;

  private participantInput: HTMLTextAreaElement;
  private loadBtn: HTMLButtonElement;
  private participantCount: HTMLElement;
  private spinBtn: HTMLButtonElement;
  private postSpinControls: HTMLElement;
  private eliminateBtn: HTMLButtonElement;
  private selectWinnerBtn: HTMLButtonElement;
  private currentSelection: HTMLElement;
  private particleCanvas: HTMLCanvasElement;
  private activeList: HTMLElement;
  private eliminatedList: HTMLElement;
  private winnerSection: HTMLElement;
  private winnerDisplay: HTMLElement;
  private activeCount: HTMLElement;
  private eliminatedCount: HTMLElement;

  constructor() {
    this.participantInput = document.querySelector('#participantInput')!;
    this.loadBtn = document.querySelector('#loadBtn')!;
    this.participantCount = document.querySelector('#participantCount')!;
    this.spinBtn = document.querySelector('#spinBtn')!;
    this.postSpinControls = document.querySelector('#postSpinControls')!;
    this.eliminateBtn = document.querySelector('#eliminateBtn')!;
    this.selectWinnerBtn = document.querySelector('#selectWinnerBtn')!;
    this.currentSelection = document.querySelector('#currentSelection')!;
    this.particleCanvas = document.querySelector('#particleCanvas')!;
    this.activeList = document.querySelector('#activeList')!;
    this.eliminatedList = document.querySelector('#eliminatedList')!;
    this.winnerSection = document.querySelector('#winnerSection')!;
    this.winnerDisplay = document.querySelector('#winnerDisplay')!;
    this.activeCount = document.querySelector('#activeCount')!;
    this.eliminatedCount = document.querySelector('#eliminatedCount')!;

    this.particleCanvas.width = this.particleCanvas.offsetWidth;
    this.particleCanvas.height = this.particleCanvas.offsetHeight;
    this.particleSystem = new ParticleSystem(this.particleCanvas);
    this.rouletteAnimation = new RouletteAnimation(this.currentSelection);
    this.dvdAnimation = new DVDAnimation();

    this.setupEventListeners();
    this.updateDisplay();
  }

  private setupEventListeners(): void {
    this.loadBtn.addEventListener('click', () => this.handleLoad());
    this.spinBtn.addEventListener('click', () => this.handleSpin());
    this.eliminateBtn.addEventListener('click', () => this.handleEliminate());
    this.selectWinnerBtn.addEventListener('click', () => this.handleSelectWinner());
  }

  private handleLoad(): void {
    const content = this.participantInput.value.trim();

    if (!content) {
      alert('Por favor, pega la lista de participantes');
      return;
    }

    try {
      const participants = ParserService.parseParticipants(content);

      this.raffleService = new RaffleService(participants);
      this.participantCount.textContent = `${participants.length} participantes cargados`;

      this.spinBtn.disabled = false;

      this.updateDisplay();
    } catch (error) {
      alert('Error al cargar participantes: ' + (error as Error).message);
    }
  }

  private async handleSpin(): Promise<void> {
    if (!this.raffleService || this.isAnimating) return;

    const active = this.raffleService.getActiveParticipants();
    if (active.length === 0) return;

    const selected = this.raffleService.selectRandom();
    if (!selected) return;

    this.isAnimating = true;
    this.spinBtn.disabled = true;
    this.postSpinControls.style.display = 'none';

    this.currentSelection.classList.remove('empty', 'breaking', 'broken', 'dust');

    // Roulette animation (10-15 seconds)
    const duration = 10000 + Math.random() * 5000;
    await this.rouletteAnimation.spin(active, selected, duration);

    this.currentSelected = selected;

    // Show post-spin options
    this.postSpinControls.style.display = 'flex';

    this.isAnimating = false;
  }

  private async handleEliminate(): Promise<void> {
    if (!this.currentSelected || !this.raffleService || this.isAnimating) return;

    this.isAnimating = true;
    this.postSpinControls.style.display = 'none';

    await new Promise(resolve => setTimeout(resolve, 500));

    const rect = this.currentSelection.getBoundingClientRect();
    const canvasRect = this.particleCanvas.getBoundingClientRect();
    const centerX = rect.left - canvasRect.left + rect.width / 2;
    const centerY = rect.top - canvasRect.top + rect.height / 2;

    await BreakAnimation.playBreak(this.currentSelection);

    this.particleSystem.createDustEffect(centerX, centerY, 40);

    this.raffleService.eliminate(this.currentSelected);
    this.currentSelected = null;

    await new Promise(resolve => setTimeout(resolve, 1500));

    this.clearSelection();
    this.updateDisplay();

    this.isAnimating = false;
    this.spinBtn.disabled = false;
  }

  private async handleSelectWinner(): Promise<void> {
    if (!this.currentSelected || !this.raffleService || this.isAnimating) return;

    this.isAnimating = true;
    this.postSpinControls.style.display = 'none';

    await new Promise(resolve => setTimeout(resolve, 500));

    this.raffleService.setWinner(this.currentSelected);
    this.currentSelected = null;
    this.updateDisplay();

    this.isAnimating = false;
  }

  private showSelection(participant: Participant): void {
    this.currentSelection.textContent = participant.username;
    this.currentSelection.classList.remove('empty', 'breaking', 'broken', 'dust');
  }

  private clearSelection(): void {
    this.currentSelection.textContent = '';
    this.currentSelection.classList.remove('breaking', 'broken', 'dust');
    this.currentSelection.classList.add('empty');
  }

  private updateDisplay(): void {
    if (!this.raffleService) {
      this.activeList.innerHTML = '<div style="text-align: center; color: #888;">Carga un archivo para comenzar</div>';
      this.activeCount.textContent = '0';
      this.eliminatedCount.textContent = '0';
      this.currentSelection.textContent = 'Carga participantes';
      this.currentSelection.classList.add('empty');
      return;
    }

    const active = this.raffleService.getActiveParticipants();
    const eliminated = this.raffleService.getEliminatedParticipants();
    const winner = this.raffleService.getAllParticipants().find(p => p.status === 'winner');

    this.activeCount.textContent = active.length.toString();
    this.eliminatedCount.textContent = eliminated.length.toString();

    this.activeList.innerHTML = active.length > 0
      ? active.map(p => `
          <div class="participant-item">
            <span>${p.username}</span>
            <span class="participant-id">#${p.id}</span>
          </div>
        `).join('')
      : '<div style="text-align: center; color: #888;">No hay participantes activos</div>';

    this.eliminatedList.innerHTML = eliminated.length > 0
      ? eliminated.map(p => `
          <div class="participant-item">
            <span>${p.username}</span>
            <span class="participant-id">#${p.id}</span>
          </div>
        `).join('')
      : '<div style="text-align: center; color: #888;">Ningún eliminado</div>';

    if (winner) {
      this.winnerSection.style.display = 'block';
      this.winnerDisplay.textContent = winner.username;
      this.eliminateBtn.disabled = true;
      this.selectWinnerBtn.disabled = true;
    }
  }
}

new SorteosApp();
