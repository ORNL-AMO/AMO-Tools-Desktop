import { CompressedAirDayType, ProfileSummary } from '../../../../../shared/models/compressed-air-assessment';
import { DayTypeSummary } from '../../../../../log-tool/log-tool-models';
import { OperatingProfileTableComponent } from './operating-profile-table.component';

describe('OperatingProfileTableComponent', () => {
  it('preserves fractional power factor values imported from Log Tool data', () => {
    const component = new OperatingProfileTableComponent(null, null, null);
    const profileSummary = {
      compressorId: 'compressor-1',
      dayTypeId: 'day-type-1',
      logToolFieldIdPowerFactor: 'power-factor-field',
      profileSummaryData: [{ timeInterval: 0, powerFactor: 0 }]
    } as ProfileSummary;

    component.profileSummary = [profileSummary];
    component.assessmentDayTypes = [{
      dayTypeId: 'day-type-1',
      profileDataType: 'powerFactor'
    } as CompressedAirDayType];
    component.logToolDayTypeSummaries = [{
      dayType: { dayTypeId: 'day-type-1' },
      dayAveragesByInterval: [{
        interval: 0,
        averages: [{
          value: 0.87,
          field: { fieldId: 'power-factor-field' }
        }]
      }]
    } as DayTypeSummary];
    spyOn(component, 'save');

    component.setLogToolDataPowerFactor(profileSummary);

    expect(profileSummary.profileSummaryData[0].powerFactor).toBe(0.87);
    expect(component.save).toHaveBeenCalled();
  });
});
