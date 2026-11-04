import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, WritableSignal, signal } from '@angular/core';

import { FanOperationsHelpComponent } from './fan-operations-help.component';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'operatingHours', heading: 'Operating Hours' },
  { field: 'cost', heading: 'Cost' },
  { field: 'implementationCosts', heading: 'Implementation Costs' },
];

describe('FanOperationsHelpComponent', () => {
  let component: FanOperationsHelpComponent;
  let fixture: ComponentFixture<FanOperationsHelpComponent>;
  let showOperationalImpacts: WritableSignal<boolean>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    showOperationalImpacts = signal(false);
    const featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts });

    await TestBed.configureTestingModule({
      declarations: [FanOperationsHelpComponent],
      providers: [{ provide: FeatureFlagService, useValue: featureFlagServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanOperationsHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    it('renders the panel heading with no field section when currentField is not a known field', () => {
      showField('unknownField');
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Fan Operations Help');
      expect(getSections().length).toBe(0);
    });

    it('renders no field section when currentField is undefined', () => {
      fixture.detectChanges();
      expect(getSections().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`shows only the ${heading} section when currentField is ${field}`, () => {
        showField(field);
        const sections = getSections();
        expect(sections.length).toBe(1);
        expect(sections[0].querySelector('h6').textContent.trim().startsWith(heading)).toBeTrue();
      });
    });

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField('operatingHours');
      showField('cost');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Cost')).toBeTrue();
    });

    it('hides the co2 help text when the operational impacts flag is off', () => {
      showOperationalImpacts.set(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-co2-help-text')).toBeNull();
    });

    it('shows the co2 help text when the operational impacts flag is on', () => {
      showOperationalImpacts.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-co2-help-text')).not.toBeNull();
    });
  });
});
