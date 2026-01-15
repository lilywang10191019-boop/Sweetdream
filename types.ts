
export interface Participant {
  name: string;
  hasDrawn: boolean;
  assignedSeat?: number;
  fortune?: string;
}

export interface Seat {
  number: number;
  isTaken: boolean;
  takenBy?: string;
}

export interface LotteryState {
  participants: Participant[];
  availableSeats: number[];
  history: Array<{ name: string; seat: number; timestamp: number }>;
}
