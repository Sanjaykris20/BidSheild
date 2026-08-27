import { BaseProvider, VerificationResponse } from './BaseProvider';
import { MOCK_GST_DB } from '../sandbox/MockDatabases';

export class GSTProvider extends BaseProvider {
  get sourceName() { return "GST_NETWORK"; }

  protected async verifyMock(identifier: string): Promise<VerificationResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const record = MOCK_GST_DB[identifier];
    
    if (record) {
      return this.formatResponse('VERIFIED', record);
    }
    
    return this.formatResponse('NOT_FOUND', null, 0);
  }

  protected async verifyLive(identifier: string): Promise<VerificationResponse> {
    throw new Error("Live GST Verification not authorized. Contact Admin.");
  }
}
