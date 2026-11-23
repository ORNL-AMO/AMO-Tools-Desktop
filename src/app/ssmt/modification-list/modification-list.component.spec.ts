import { CompareService } from '../compare.service';
import { SsmtService } from '../ssmt.service';
import { Modification, SSMT } from '../../shared/models/steam/ssmt';
import { ModificationListComponent } from './modification-list.component';

describe('ModificationListComponent new scenarios', () => {
  let component: ModificationListComponent;
  let saved: Modification[];

  function getHeaderInput(useBaselineProcessSteamUsage: boolean, processSteamUsage: number) {
    return {
      numberOfHeaders: 3,
      highPressureHeader: { processSteamUsage: 50 },
      mediumPressureHeader: { processSteamUsage: processSteamUsage, condensationRecoveryRate: 39.9944, useBaselineProcessSteamUsage: useBaselineProcessSteamUsage },
      lowPressureHeader: {
        processSteamUsage: processSteamUsage,
        condensationRecoveryRate: 39.9944,
        useBaselineProcessSteamUsage: useBaselineProcessSteamUsage,
        processSteamUsageData: { rows: [] }
      }
    };
  }

  beforeEach(() => {
    const scenario = {
      name: 'Scenario 1',
      headerInput: getHeaderInput(false, 100.014),
      co2SavingsData: {}
    } as unknown as SSMT;
    const baseline = {
      name: 'Baseline',
      headerInput: getHeaderInput(false, 80),
      co2SavingsData: {},
      modifications: [{ ssmt: scenario }]
    } as unknown as SSMT;
    component = new ModificationListComponent({ setCompareVals: () => { } } as unknown as CompareService, {} as SsmtService);
    component.ssmt = baseline;
    component.initDropdown();
    saved = [];
    component.saveNewMod.subscribe(modification => saved.push(modification));
  });

  it('keeps the custom process steam usage when copying a scenario', () => {
    component.addNewModification(component.ssmt.modifications[0].ssmt);

    const copy = saved[0].ssmt.headerInput;
    expect(copy.lowPressureHeader.useBaselineProcessSteamUsage).toBeFalse();
    expect(copy.mediumPressureHeader.useBaselineProcessSteamUsage).toBeFalse();
    expect(copy.lowPressureHeader.processSteamUsage).toBe(100.014);
    expect(copy.lowPressureHeader.condensationRecoveryRate).toBe(39.9944);
    expect(copy.lowPressureHeader.processSteamUsageData).toEqual({ rows: [] });
    expect(component.ssmt.modifications[0].ssmt.headerInput.lowPressureHeader).not.toBe(copy.lowPressureHeader);
  });

  it('still starts a new scenario from the baseline process steam usage', () => {
    component.newModificationName = 'Scenario 2';
    component.addNewModification();

    const scenario = saved[0].ssmt.headerInput;
    expect(scenario.lowPressureHeader.useBaselineProcessSteamUsage).toBeTrue();
    expect(scenario.mediumPressureHeader.useBaselineProcessSteamUsage).toBeTrue();
  });
});
