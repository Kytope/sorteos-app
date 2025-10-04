export type ParticipantStatus = 'active' | 'eliminated' | 'winner';

export interface Participant {
  id: number;
  username: string;
  status: ParticipantStatus;
}
