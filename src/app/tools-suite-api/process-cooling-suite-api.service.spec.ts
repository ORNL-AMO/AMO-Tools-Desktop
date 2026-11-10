import { type ProcessCooling } from 'measur-tools-suite';
import { ProcessCoolingSuiteApiService } from './process-cooling-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ChillerInventoryItem } from '../shared/models/process-cooling-assessment';

describe('Process Cooling beta output ownership', () => {
  it('copies and releases the new efficiency row and containing vector', () => {
    const helper = new SuiteApiHelperService(null);
    const vector = (values: number[]) => ({ size: () => values.length, get: (i: number) => values[i], delete: jasmine.createSpy('delete') });
    const row = vector([0.7, 0.8]);
    const efficiencies = {size: () => 1, get: () => row, delete: jasmine.createSpy('efficiencies.delete')};
    const output = {efficiency: efficiencies, hours: {get: () => vector([100, 200])},
      energy: {get: () => vector([10, 20])}, power: {get: () => vector([0.1, 0.1])}, delete: jasmine.createSpy('output.delete')};
    const curve = vector([0.6, 0.7]);
    const process = {calculateChillerEnergy: () => output, getChillerARIEnergyEfficiency: () => curve};
    spyOn(helper, 'returnDoubleVector').and.callFake(values => vector(values) as never);
    const service = new ProcessCoolingSuiteApiService(helper, null);
    service.chillerInputResultMap = {0: {id: 'first', name: 'First'}};
    const results = service['_getChillerOutput'](process as unknown as ProcessCooling, [{} as ChillerInventoryItem]);
    expect(results[0].efficiency).toEqual([0.7, 0.8]);
    expect(row.delete).toHaveBeenCalledTimes(1);
    expect(efficiencies.delete).toHaveBeenCalledTimes(1);
    expect(output.delete).toHaveBeenCalledTimes(1);
    expect(curve.delete).toHaveBeenCalledTimes(1);
  });
});
