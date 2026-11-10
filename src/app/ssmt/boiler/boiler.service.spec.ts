import { UntypedFormBuilder } from '@angular/forms';

import { SteamService } from '../../calculator/steam/steam.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { BoilerInput } from '../../shared/models/steam/ssmt';
import { SteamPressureOrTemp, SteamQuality } from '../../shared/models/steam/steam-inputs';
import { BoilerService } from './boiler.service';

describe('BoilerService blowdown routing', () => {
  let service: BoilerService;
  const settings = {
    steamPressureMeasurement: 'psig',
    steamTemperatureMeasurement: 'F'
  } as Settings;

  beforeEach(() => {
    const steamService = jasmine.createSpyObj<SteamService>('SteamService', ['saturatedProperties']);
    steamService.saturatedProperties.and.returnValue({
      saturatedPressure: 100,
      saturatedTemperature: 300,
      liquidEnthalpy: 0,
      gasEnthalpy: 0,
      evaporationEnthalpy: 0,
      liquidEntropy: 0,
      gasEntropy: 0,
      evaporationEntropy: 0,
      liquidVolume: 0,
      gasVolume: 0,
      evaporationVolume: 0
    });
    service = new BoilerService(new UntypedFormBuilder(), steamService, new ConvertUnitsService());
  });

  function buildBoilerInput(sendBlowdownToDeaerator?: boolean): BoilerInput {
    return {
      fuelType: 1,
      fuel: 1,
      combustionEfficiency: 85,
      blowdownRate: 5,
      blowdownFlashed: true,
      preheatMakeupWater: false,
      steamQuality: SteamQuality.SUPERHEATED,
      pressureOrTemperature: SteamPressureOrTemp.PRESSURE,
      saturatedPressure: 100,
      steamTemperature: 400,
      deaeratorVentRate: 2,
      deaeratorPressure: 5,
      approachTemperature: 10,
      sendBlowdownToDeaerator
    };
  }

  it('defaults a legacy missing value to false in the form', () => {
    const form = service.initFormFromBoilerInput(buildBoilerInput(), settings);

    expect(form.controls.sendBlowdownToDeaerator.value).toBeFalse();
  });

  it('round-trips an enabled value through the form', () => {
    const form = service.initFormFromBoilerInput(buildBoilerInput(true), settings);

    expect(service.initObjFromForm(form).sendBlowdownToDeaerator).toBeTrue();
  });

  it('defaults new boiler forms to disabled', () => {
    const form = service.initEmptyForm(settings);

    expect(form.controls.sendBlowdownToDeaerator.value).toBeFalse();
  });
});
