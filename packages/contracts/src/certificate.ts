export interface IssueCertificateDto {
  sessionId: string;
  candidateName: string;
}

export interface CertificateRecordDto {
  certificateCode: string; // e.g. TYPHON-2026-A8F9-BC31
  candidateName: string;
  certifiedWpm: number;
  certifiedAccuracy: number;
  durationSeconds: number;
  issuedAt: string;
  isGuestSession: boolean;
  isRevoked: boolean;
}

export interface VerifyCertificateResponseDto {
  valid: boolean;
  certificate?: CertificateRecordDto;
  reason?: string;
}
