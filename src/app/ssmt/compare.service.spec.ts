import { SSMT } from '../shared/models/steam/ssmt';
import { CompareService } from './compare.service';

describe('CompareService blowdown routing', () => {
  let service: CompareService;

  beforeEach(() => {
    service = new CompareService();
  });

  function buildSsmt(sendBlowdownToDeaerator?: boolean): SSMT {
    return {
      boilerInput: { sendBlowdownToDeaerator }
    } as SSMT;
  }

  it('reports a routing change between baseline and modification', () => {
    expect(service.isSendBlowdownToDeaeratorDifferent(buildSsmt(false), buildSsmt(true))).toBeTrue();
  });

  it('does not report a change when both values match', () => {
    expect(service.isSendBlowdownToDeaeratorDifferent(buildSsmt(false), buildSsmt(false))).toBeFalse();
  });

  it('includes a routing-only modification in aggregate boiler differences', () => {
    expect(service.checkBoilerDifferent(buildSsmt(false), buildSsmt(true))).toBeTrue();
  });

  it('treats a missing legacy value as false', () => {
    expect(service.isSendBlowdownToDeaeratorDifferent(buildSsmt(), buildSsmt(false))).toBeFalse();
    expect(service.checkBoilerDifferent(buildSsmt(), buildSsmt(false))).toBeFalse();
  });
});
