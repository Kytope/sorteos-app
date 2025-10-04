import type { Participant } from '../models/Participant';

export class ParserService {
  static parseParticipants(fileContent: string): Participant[] {
    const lines = fileContent.trim().split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Formato: ID→Usuario
      const matchWithId = trimmedLine.match(/^\s*(\d+)→(.+)$/);
      if (matchWithId) {
        const [, idStr, username] = matchWithId;
        return {
          id: parseInt(idStr, 10),
          username: username.trim(),
          status: 'active'
        };
      }

      // Formato: Solo usuario (genera ID automático)
      if (trimmedLine.length > 0) {
        return {
          id: index + 1,
          username: trimmedLine,
          status: 'active'
        };
      }

      throw new Error(`Invalid format in line: ${line}`);
    });
  }
}
