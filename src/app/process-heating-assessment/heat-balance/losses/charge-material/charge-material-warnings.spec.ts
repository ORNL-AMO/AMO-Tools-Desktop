import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { getChargeMaterialInitialTemperatureWarning } from './charge-material-warnings';

describe('getChargeMaterialInitialTemperatureWarning', () => {
  it('warns when a solid material inlet temperature is above its outlet temperature', () => {
    const material: ChargeMaterial = { chargeMaterialType: 'Solid', solidChargeMaterial: { initialTemperature: 900, dischargeTemperature: 800 } };

    expect(getChargeMaterialInitialTemperatureWarning(material))
      .toBe('Charge Inlet Temperature (900) cannot be greater than Charge Outlet Temperature (800)');
  });

  it('reads the temperatures of the material type in use', () => {
    const material: ChargeMaterial = {
      chargeMaterialType: 'Liquid',
      solidChargeMaterial: { initialTemperature: 900, dischargeTemperature: 800 },
      liquidChargeMaterial: { initialTemperature: 70, dischargeTemperature: 300 },
    };

    expect(getChargeMaterialInitialTemperatureWarning(material)).toBeNull();
  });

  it('does not warn when inlet and outlet temperature are equal', () => {
    const material: ChargeMaterial = { chargeMaterialType: 'Gas', gasChargeMaterial: { initialTemperature: 300, dischargeTemperature: 300 } };

    expect(getChargeMaterialInitialTemperatureWarning(material)).toBeNull();
  });
});
