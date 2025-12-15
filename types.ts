export enum SchoolStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DELAYED = 'DELAYED',
  UNKNOWN = 'UNKNOWN'
}

export interface WebSource {
  title: string;
  uri: string;
<<<<<<< HEAD
=======
  status?: SchoolStatus;
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
}

export interface StatusResponse {
  status: SchoolStatus;
  summary: string;
  sources: WebSource[];
  timestamp: string;
  checkedDate: string;
}

export interface GeminiGroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}