export interface VerificationResponse {
  source: string;
  mode: 'MOCK' | 'SANDBOX' | 'LIVE';
  status: 'VERIFIED' | 'FAILED' | 'NOT_FOUND' | 'PENDING' | 'UNAVAILABLE';
  confidence: number;
  data: any;
  verified_at: string;
}

export abstract class BaseProvider {
  protected mode: 'MOCK' | 'SANDBOX' | 'LIVE' = 'MOCK';
  abstract get sourceName(): string;

  public setMode(mode: 'MOCK' | 'SANDBOX' | 'LIVE') {
    this.mode = mode;
  }

  public async verify(identifier: string): Promise<VerificationResponse> {
    if (this.mode === 'MOCK' || this.mode === 'SANDBOX') {
      return this.verifyMock(identifier);
    }
    return this.verifyLive(identifier);
  }

  protected abstract verifyMock(identifier: string): Promise<VerificationResponse>;
  protected abstract verifyLive(identifier: string): Promise<VerificationResponse>;

  protected formatResponse(
    status: VerificationResponse['status'], 
    data: any, 
    confidence: number = 1.0
  ): VerificationResponse {
    return {
      source: this.sourceName,
      mode: this.mode,
      status,
      confidence,
      data,
      verified_at: new Date().toISOString()
    };
  }
}
