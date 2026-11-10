import { Settings } from '../../shared/models/settings';
import { SsmtReportAdapter } from './ssmt-report.adapter';

describe('SsmtReportAdapter boiler input summary', () => {
  it('reports the blowdown flash steam destination', () => {
    const adapter = Object.create(SsmtReportAdapter.prototype) as SsmtReportAdapter;
    const adapterInternals = adapter as any;
    adapterInternals.flueGasMaterialDbService = {
      getAllMaterials: () => [{ id: 1, substance: 'Natural Gas' }]
    };
    adapterInternals.solidLiquidMaterialDbService = { getAllMaterials: () => [] };
    adapterInternals.convertUnitsService = {
      getUnit: (unit: string) => ({ unit: { name: { display: `(${unit})` } } })
    };

    const buildInputData = (sendBlowdownToDeaerator: boolean) => ({
      boilerInput: {
        fuelType: 1,
        fuel: 1,
        combustionEfficiency: 85,
        blowdownRate: 5,
        steamTemperature: 400,
        blowdownFlashed: true,
        sendBlowdownToDeaerator,
        preheatMakeupWater: false,
        approachTemperature: undefined,
        deaeratorVentRate: 0.1,
        deaeratorPressure: 5,
      }
    });
    const baseline = { inputData: buildInputData(false) };
    const modifications = [{
      modification: { ssmt: { name: 'Route to Deaerator' } },
      inputData: buildInputData(true)
    }];
    const settings = {
      steamTemperatureMeasurement: 'F',
      steamPressureMeasurement: 'psig'
    } as Settings;

    const section = adapterInternals.buildBoilerSection(baseline, modifications, settings);
    const routingRow = section.rows.find(row => row[0] === 'Send Blowdown Flash Steam to Deaerator?');

    expect(routingRow).toEqual(['Send Blowdown Flash Steam to Deaerator?', 'No', 'Yes']);
  });
});
