import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FanSetupHelpComponent } from './fan-setup-help.component';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'fanType', heading: 'Fan Type' },
  { field: 'fanEfficiency', heading: 'Fan Efficiency' },
  { field: 'fanSpeed', heading: 'Fan Speed' },
  { field: 'drive', heading: 'Drive' },
];

describe('FanSetupHelpComponent', () => {
  let component: FanSetupHelpComponent;
  let fixture: ComponentFixture<FanSetupHelpComponent>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanSetupHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanSetupHelpComponent);
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
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Fan and Fluid Help');
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
        expect(sections[0].querySelector('h6').textContent.trim()).toContain(heading);
      });
    });

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField('fanType');
      showField('drive');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Drive')).toBeTrue();
    });
  });
});
