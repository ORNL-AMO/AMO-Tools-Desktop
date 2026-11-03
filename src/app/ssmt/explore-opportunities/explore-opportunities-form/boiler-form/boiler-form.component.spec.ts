import { UntypedFormBuilder } from '@angular/forms';

import { BoilerFormComponent } from './boiler-form.component';

describe('Explore Opportunities BoilerFormComponent blowdown routing', () => {
  let component: BoilerFormComponent;
  const formBuilder = new UntypedFormBuilder();

  beforeEach(() => {
    component = Object.create(BoilerFormComponent.prototype) as BoilerFormComponent;
    component.baselineForm = formBuilder.group({ sendBlowdownToDeaerator: [false] });
    component.modificationForm = formBuilder.group({ sendBlowdownToDeaerator: [true] });
  });

  it('detects a routing-only opportunity', () => {
    component.initSendBlowdownToDeaerator();

    expect(component.showSendBlowdownToDeaerator).toBeTrue();
  });

  it('restores the baseline route when the opportunity is unchecked', () => {
    component.showSendBlowdownToDeaerator = false;
    spyOn(component, 'save');

    component.toggleSendBlowdownToDeaerator();

    expect(component.modificationForm.controls.sendBlowdownToDeaerator.value).toBeFalse();
    expect(component.save).toHaveBeenCalled();
  });

  it('restores the baseline route when all boiler opportunities are unchecked', () => {
    component.ssmt = {
      modifications: [{ exploreOppsShowBoilerData: { hasOpportunity: false } }]
    } as any;
    component.exploreModIndex = 0;
    component.showSendBlowdownToDeaerator = true;
    spyOn(component, 'toggleDeaeratorConditions');
    spyOn(component, 'toggleInitialSteamTemperature');
    spyOn(component, 'togglePreheatBlowdownWater');
    spyOn(component, 'toggleBlowdownFlashed');
    spyOn(component, 'toggleBlowdownRate');
    spyOn(component, 'toggleCombustionEfficiency');
    spyOn(component, 'toggleFuelData');
    spyOn(component, 'save');

    component.toggleBoilerData();

    expect(component.showSendBlowdownToDeaerator).toBeFalse();
    expect(component.modificationForm.controls.sendBlowdownToDeaerator.value).toBeFalse();
    expect(component.save).toHaveBeenCalled();
  });
});
