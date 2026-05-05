export type Affiliation = 'Red' | 'Blue' | 'Neutral' | 'Other';

export interface Voter {
  id: string;
  fullName: string;
  precinctId: string;
  precinctName: string;
  barangay: string;
  cluster: string;
  affiliationColor: Affiliation;
  address: string;
  contactNumber?: string;
  createdAt: any;
}

export interface Precinct {
  id: string;
  name: string;
  barangay: string;
  cluster: string;
  location_details: string;
  total_voters: number;
  imageUrl: string;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
