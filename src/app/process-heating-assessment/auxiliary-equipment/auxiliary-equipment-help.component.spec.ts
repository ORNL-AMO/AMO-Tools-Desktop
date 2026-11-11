import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuxiliaryEquipmentHelpComponent } from './auxiliary-equipment-help.component';

describe('AuxiliaryEquipmentHelpComponent', () => {
  let fixture: ComponentFixture<AuxiliaryEquipmentHelpComponent>;

  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [AuxiliaryEquipmentHelpComponent] });
    fixture = TestBed.createComponent(AuxiliaryEquipmentHelpComponent);
    fixture.detectChanges();
  });

  it('introduces auxiliary equipment and points to the Electricity Reduction calculator', () => {
    expect(text()).toContain('Auxiliary Equipment Help');
    expect(text()).toContain('Electricity Reduction calculator');
  });

  it('shows help for the focused field only', () => {
    fixture.componentRef.setInput('currentField', 'powerFactor');
    fixture.detectChanges();
    expect(text()).toContain('Power Factor');
    expect(text()).not.toContain('Percent Loaded');

    fixture.componentRef.setInput('currentField', 'loadFactor');
    fixture.detectChanges();
    expect(text()).toContain('Percent Loaded');
    expect(text()).not.toContain('Power Factor');
  });
});
