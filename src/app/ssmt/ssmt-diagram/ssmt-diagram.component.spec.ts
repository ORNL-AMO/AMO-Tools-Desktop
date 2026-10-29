import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { SsmtDiagramComponent } from './ssmt-diagram.component';

describe('SsmtDiagramComponent blowdown routing', () => {
  let component: SsmtDiagramComponent;

  beforeEach(() => {
    component = new SsmtDiagramComponent();
  });

  function setBoilerInput(blowdownFlashed: boolean, sendBlowdownToDeaerator?: boolean) {
    component.inputData = {
      boilerInput: { blowdownFlashed, sendBlowdownToDeaerator }
    } as SSMTInputs;
  }

  it('routes only when blowdown is flashed and routing is enabled', () => {
    setBoilerInput(true, true);
    expect(component.routeBlowdownToDeaerator).toBeTrue();

    setBoilerInput(true, false);
    expect(component.routeBlowdownToDeaerator).toBeFalse();

    setBoilerInput(false, true);
    expect(component.routeBlowdownToDeaerator).toBeFalse();
  });

  it('treats a missing legacy routing value as disabled', () => {
    setBoilerInput(true);

    expect(component.routeBlowdownToDeaerator).toBeFalse();
  });
});
