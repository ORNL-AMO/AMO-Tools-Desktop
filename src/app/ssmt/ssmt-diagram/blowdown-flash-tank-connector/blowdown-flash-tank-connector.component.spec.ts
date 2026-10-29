import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownFlashTankConnectorComponent } from './blowdown-flash-tank-connector.component';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

describe('BlowdownFlashTankConnectorComponent', () => {
  let component: BlowdownFlashTankConnectorComponent;
  let fixture: ComponentFixture<BlowdownFlashTankConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlowdownFlashTankConnectorComponent],
      imports: [SharedPipesModule],
      providers: [ConvertUnitsService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlowdownFlashTankConnectorComponent);
    component = fixture.componentInstance;
    component.flashTank = { outletGasMassFlow: 1.23 } as FlashTankOutput;
    component.settings = { steamMassFlowMeasurement: 'klb' } as Settings;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the flashed steam mass flow on the route', () => {
    expect(fixture.nativeElement.textContent).toContain('1.23');
    expect(fixture.nativeElement.textContent).toContain('klb/hr');
  });

  it('emits route hover, leave, and selection events', () => {
    spyOn(component.emitSetHover, 'emit');
    spyOn(component.emitSelectEquipment, 'emit');
    const route: HTMLElement = fixture.nativeElement.querySelector('.to-deaerator');

    route.dispatchEvent(new Event('mouseenter'));
    route.dispatchEvent(new Event('mouseleave'));
    route.click();

    expect(component.emitSetHover.emit).toHaveBeenCalledWith('boilerBlowdownFlashedHovered');
    expect(component.emitSetHover.emit).toHaveBeenCalledWith('default');
    expect(component.emitSelectEquipment.emit).toHaveBeenCalledWith('boilerBlowdownFlashedHovered');
  });
});
