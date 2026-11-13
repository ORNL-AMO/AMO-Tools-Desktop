import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StatePointAnalysisHelpComponent } from './state-point-analysis-help.component';
import { StatePointAnalysisService } from '../state-point-analysis.service';

// currentField value -> heading text of the help section it shows.
const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'sviParameter', heading: 'SVI parameter' },
  { field: 'sviValue', heading: 'Sludge Volume Index' },
  { field: 'kValue', heading: 'K' },
  { field: 'sludgeSettlingVelocity', heading: 'Vo' },
  { field: 'numberOfClarifiers', heading: 'Number of Clarifiers' },
  { field: 'areaOfClarifier', heading: 'Clarifier Area' },
  { field: 'MLSS', heading: 'MLSS' },
  { field: 'influentFlow', heading: 'Influent Flow' },
  { field: 'rasFlow', heading: 'RAS Flow' },
];

function makeServiceMock() {
  return { currentField: new BehaviorSubject<string>('default') };
}

describe('StatePointAnalysisHelpComponent', () => {
  let component: StatePointAnalysisHelpComponent;
  let fixture: ComponentFixture<StatePointAnalysisHelpComponent>;
  let serviceMock: ReturnType<typeof makeServiceMock>;

  // Heading text of each help section, without its <small> description.
  function getHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2 > h6')).map((h6: HTMLElement) => {
      const clone = h6.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('small').forEach(small => small.remove());
      return clone.textContent.replace(/\s+/g, ' ').trim();
    });
  }

  function setField(field: string): void {
    serviceMock.currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceMock = makeServiceMock();
    await TestBed.configureTestingModule({
      declarations: [StatePointAnalysisHelpComponent],
      providers: [{ provide: StatePointAnalysisService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatePointAnalysisHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('reads the current field from the service', () => {
      expect(component.currentField).toBe('default');
    });

    it('tracks later current field changes', () => {
      setField('MLSS');
      expect(component.currentField).toBe('MLSS');
    });
  });

  describe('template visibility', () => {
    it('shows only the general help when no field is focused', () => {
      expect(getHeadings()).toEqual(['State Point Analysis Tool Help']);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`shows only the "${heading}" field help when ${field} is focused`, () => {
        setField(field);
        expect(getHeadings()).toEqual(['State Point Analysis Tool Help', heading]);
      });
    });

    it('hides a field help again when focus moves to another field', () => {
      setField('rasFlow');
      setField('influentFlow');
      expect(getHeadings()).not.toContain('RAS Flow');
      expect(getHeadings()).toContain('Influent Flow');
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after destroy', () => {
      setField('MLSS');
      fixture.destroy();
      serviceMock.currentField.next('rasFlow');
      expect(component.currentField).toBe('MLSS');
    });
  });
});
