import { BaseProvider, VerificationResponse } from './BaseProvider';
import { MOCK_PAN_DB } from '../sandbox/MockDatabases';

export class PANProvider extends BaseProvider {
  get sourceName() { return "INCOME_TAX_PAN"; }

  protected async verifyMock(identifier: string): Promise<VerificationResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const record = MOCK_PAN_DB[identifier];
    
    if (record) {
      return this.formatResponse('VERIFIED', record);
    }
    
    return this.formatResponse('NOT_FOUND', null, 0);
  }

  protected async verifyLive(identifier: string): Promise<VerificationResponse> {
    throw new Error("Live PAN Verification not authorized. Contact Admin.");
  }
}
