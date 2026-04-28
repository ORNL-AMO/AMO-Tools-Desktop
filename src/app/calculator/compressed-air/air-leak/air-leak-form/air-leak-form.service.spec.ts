import { UntypedFormBuilder } from '@angular/forms';
import { LeakMeasurementMethod } from '../../compressed-air-constants';
import { AirLeakFormService } from './air-leak-form.service';
import { AirLeakSurveyInput } from '../../../../shared/models/standalone';

describe('AirLeakFormService', () => {
  let service: AirLeakFormService;

  beforeEach(() => {
    service = new AirLeakFormService(new UntypedFormBuilder(), {} as any);
  });

  it('should mark input invalid when any leak row is invalid', () => {
    const invalidLeak = service.getEmptyAirLeakData();
    invalidLeak.name = '';
    invalidLeak.leakDescription = 'Leak description';
    invalidLeak.measurementMethod = LeakMeasurementMethod.Estimate;
    invalidLeak.estimateMethodData.leakRateEstimate = 5;

    const input: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: [invalidLeak],
      facilityCompressorData: service.getExampleFacilityCompressorData()
    };

    expect(service.checkValidInput(input)).toBeFalse();
  });
});
