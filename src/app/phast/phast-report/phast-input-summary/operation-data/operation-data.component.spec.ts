import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { OperationDataComponent } from './operation-data.component';

const SETTINGS = { energySourceType: 'Electricity', furnaceType: 'Electrical Infrared', unitsOfMeasure: 'Imperial' } as Settings;

function buildPhast(modifications: object[]): PHAST {
  return { operatingHours: { hoursPerYear: 8760 }, operatingCosts: {}, modifications } as unknown as PHAST;
}

describe('OperationDataComponent', () => {
  let fixture: ComponentFixture<OperationDataComponent>;
  let component: OperationDataComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperationDataComponent],
      providers: [{ provide: FeatureFlagService, useValue: { showOperationalImpacts: signal(false) } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(OperationDataComponent);
    component = fixture.componentInstance;
    component.settings = SETTINGS;
    component.collapse = false;
  });

  describe('template', () => {
    it('shows a modification\'s own furnace type and the assessment\'s for one that follows it', () => {
      component.phast = buildPhast([
        { id: 'm1', phast: { name: 'Induction', operatingHours: {}, operatingCosts: {}, valid: { operationsValid: true } }, energySource: { energySourceType: 'Electricity', furnaceType: 'Induction Heating and Melting' } },
        { id: 'm2', phast: { name: 'Same', operatingHours: {}, operatingCosts: {}, valid: { operationsValid: true } } },
      ]);

      fixture.detectChanges();

      const furnaceRow: HTMLElement = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tr')).find(row => row.textContent.includes('Furnace Type'));
      const cells = Array.from<HTMLElement>(furnaceRow.querySelectorAll('td')).map(cell => cell.textContent.trim());
      expect(cells).toEqual(['Furnace Type', 'Electrical Infrared', 'Induction Heating and Melting', 'Electrical Infrared']);
    });

    it('shows the Furnace Name row when only a modification has a custom name', () => {
      component.phast = buildPhast([
        { id: 'm1', phast: { name: 'Custom', operatingHours: {}, operatingCosts: {}, valid: { operationsValid: true } }, energySource: { energySourceType: 'Electricity', furnaceType: 'Custom Electrotechnology', customFurnaceName: 'Plasma' } },
      ]);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Plasma');
    });
  });
});
