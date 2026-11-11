import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { BoilerInput } from '../../../shared/models/steam/ssmt';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DeaeratorDiagramComponent } from './deaerator-diagram.component';

describe('DeaeratorDiagramComponent', () => {
  let component: DeaeratorDiagramComponent;
  let fixture: ComponentFixture<DeaeratorDiagramComponent>;

  const deaerator = {
    ventedSteamMassFlow: 0.1,
    feedwaterMassFlow: 10,
    inletSteamMassFlow: 1,
    inletSteamSpecificEnthalpy: 100,
    inletWaterSpecificEnthalpy: 50,
    feedwaterSpecificEnthalpy: 75,
    inletSteamEnergyFlow: 100,
    inletWaterEnergyFlow: 50,
    feedwaterEnergyFlow: 140,
    ventedSteamEnergyFlow: 10,
  } as DeaeratorOutput;

  const settings = {
    steamMassFlowMeasurement: 'klb'
  } as Settings;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeaeratorDiagramComponent],
      imports: [SharedPipesModule],
      providers: [ConvertUnitsService]
    }).compileComponents();

    fixture = TestBed.createComponent(DeaeratorDiagramComponent);
    component = fixture.componentInstance;
    component.deaerator = deaerator;
    component.settings = settings;
  });

  function setBoilerInput(blowdownFlashed: boolean, sendBlowdownToDeaerator: boolean) {
    component.boilerInput = {
      blowdownFlashed,
      sendBlowdownToDeaerator
    } as BoilerInput;
  }

  it('renders the combined one-header inlet when flashed blowdown is routed to the deaerator', () => {
    component.inletPressure = 'high-pressure';
    setBoilerInput(true, true);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.one-header-routed-inlet')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.one-header-combined-junction')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.one-header-inlet')).toBeNull();
  });

  it('uses deaerator inlet details for the complete routed one-header inlet', () => {
    component.inletPressure = 'high-pressure';
    setBoilerInput(true, true);
    spyOn(component.emitSetHover, 'emit');
    spyOn(component.emitSelectEquipment, 'emit');

    fixture.detectChanges();

    const pressureDrop = fixture.nativeElement.querySelector('.one-header-pressure-drop');
    const combinedJunction = fixture.nativeElement.querySelector('.one-header-combined-junction');

    expect(pressureDrop.querySelector('.fa-chevron-down')).not.toBeNull();
    expect(combinedJunction.querySelector('.fa-chevron-down')).not.toBeNull();
    expect(combinedJunction.querySelector('.fa-chevron-left')).toBeNull();

    pressureDrop.dispatchEvent(new Event('mouseenter'));
    pressureDrop.click();
    combinedJunction.dispatchEvent(new Event('mouseenter'));
    combinedJunction.click();

    expect(component.emitSetHover.emit).toHaveBeenCalledTimes(2);
    expect(component.emitSetHover.emit).toHaveBeenCalledWith('deaeratorInletSteamHovered');
    expect(component.emitSelectEquipment.emit).toHaveBeenCalledTimes(2);
    expect(component.emitSelectEquipment.emit).toHaveBeenCalledWith('deaeratorInletSteamHovered');
  });

  it('keeps the legacy one-header inlet when routing is disabled', () => {
    component.inletPressure = 'high-pressure';
    setBoilerInput(true, false);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.one-header-inlet')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.one-header-routed-inlet')).toBeNull();
  });

  it('does not render a route when flashing is disabled and the saved routing preference is true', () => {
    component.inletPressure = 'high-pressure';
    setBoilerInput(false, true);

    fixture.detectChanges();

    expect(component.routeBlowdownToDeaerator).toBeFalse();
    expect(fixture.nativeElement.querySelector('.one-header-routed-inlet')).toBeNull();
  });

  it('keeps the routed low-pressure inlet for multi-header systems', () => {
    component.inletPressure = 'low-pressure';
    setBoilerInput(true, true);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.to-deaerator-connector')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.combined-inlet-tube')).not.toBeNull();
  });

  it('uses deaerator inlet details for the combined multi-header pipe', () => {
    component.inletPressure = 'low-pressure';
    setBoilerInput(true, true);
    spyOn(component.emitSetHover, 'emit');
    spyOn(component.emitSelectEquipment, 'emit');

    fixture.detectChanges();

    const combinedInlet = fixture.nativeElement.querySelector('.combined-inlet-tube');
    combinedInlet.dispatchEvent(new Event('mouseenter'));
    combinedInlet.click();

    expect(component.emitSetHover.emit).toHaveBeenCalledOnceWith('deaeratorInletSteamHovered');
    expect(component.emitSelectEquipment.emit).toHaveBeenCalledOnceWith('deaeratorInletSteamHovered');
  });
});
