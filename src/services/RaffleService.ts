import type { Participant } from '../models/Participant';

export class RaffleService {
  private participants: Participant[];
  private eliminated: Participant[] = [];

  constructor(participants: Participant[]) {
    this.participants = [...participants];
  }

  getActiveParticipants(): Participant[] {
    return this.participants.filter(p => p.status === 'active');
  }

  getEliminatedParticipants(): Participant[] {
    return this.eliminated;
  }

  selectRandom(): Participant | null {
    const active = this.getActiveParticipants();

    if (active.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * active.length);
    return active[randomIndex];
  }

  eliminate(participant: Participant): void {
    const index = this.participants.findIndex(p => p.id === participant.id);

    if (index !== -1) {
      this.participants[index].status = 'eliminated';
      this.eliminated.push(this.participants[index]);
    }
  }

  setWinner(participant: Participant): void {
    const index = this.participants.findIndex(p => p.id === participant.id);

    if (index !== -1) {
      this.participants[index].status = 'winner';
    }
  }

  getAllParticipants(): Participant[] {
    return this.participants;
  }
}
