import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanSystemChecklistResultsComponent } from './fan-system-checklist-results.component';
import { FanSystemChecklistService } from '../fan-system-checklist.service';
import { FanSystemChecklistOutput, FanSystemChecklistResult } from '../../../../shared/models/fans';

function makeResult(overrides: Partial<FanSystemChecklistResult> = {}): FanSystemChecklistResult {
  return {
    name: 'Equipment #1',
    priority: 'Low',
    totalScore: 1,
    motorPowerScore: 0,
    operatingHoursScore: 1,
    controlsScore: 0,
    productionScore: 0,
    systemScore: 0,
    hasMotorPowerPriority: false,
    notes: '',
    ...overrides
  };
}

function makeOutput(results: Array<FanSystemChecklistResult>): FanSystemChecklistOutput {
  return { equipmentResults: results };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanSystemChecklistResultsComponent', () => {
  let component: FanSystemChecklistResultsComponent;
  let fixture: ComponentFixture<FanSystemChecklistResultsComponent>;
  let serviceMock: Partial<FanSystemChecklistService>;

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function getResultRowCells(): Array<Array<string>> {
    return queryAll('table tr').map(row => Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent)));
  }

  function emitOutput(output: FanSystemChecklistOutput): void {
    serviceMock.fanSystemChecklistOutput.next(output);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceMock = {
      fanSystemChecklistOutput: new BehaviorSubject<FanSystemChecklistOutput>(makeOutput([makeResult()]))
    };

    await TestBed.configureTestingModule({
      declarations: [FanSystemChecklistResultsComponent],
      providers: [{ provide: FanSystemChecklistService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanSystemChecklistResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns the output from the service', () => {
      expect(component.fanSystemChecklistOutput).toBe(serviceMock.fanSystemChecklistOutput.getValue());
    });
  });

  describe('observe output', () => {
    it('re-renders the scorecard when the service emits a new output', () => {
      emitOutput(makeOutput([makeResult({ name: 'Fan A', totalScore: 5, priority: 'High' })]));
      expect(getResultRowCells()).toEqual([['Fan A', '5', 'High']]);
    });
  });

  describe('template rendering', () => {
    it('renders no scorecard tables for an empty output', () => {
      emitOutput(makeOutput([]));
      expect(queryAll('table').length).toBe(0);
      expect(queryAll('app-fan-system-checklist-copy-table').length).toBe(0);
    });

    it('renders one scorecard table and copy table per result, in order', () => {
      emitOutput(makeOutput([
        makeResult({ name: 'Fan A', totalScore: 1, priority: 'Low' }),
        makeResult({ name: 'Fan B', totalScore: 3, priority: 'Medium' }),
      ]));
      expect(queryAll('table').length).toBe(2);
      expect(queryAll('app-fan-system-checklist-copy-table').length).toBe(2);
      expect(getResultRowCells()).toEqual([['Fan A', '1', 'Low'], ['Fan B', '3', 'Medium']]);
    });

    it('shows the score cell when totalScore is 0', () => {
      emitOutput(makeOutput([makeResult({ totalScore: 0 })]));
      expect(getResultRowCells()).toEqual([['Equipment #1', '0', 'Low']]);
    });

    it('shows the dash placeholder instead of the score when totalScore is undefined', () => {
      emitOutput(makeOutput([makeResult({ totalScore: undefined })]));
      expect(getResultRowCells()).toEqual([['Equipment #1', '— —', 'Low']]);
    });

    it('shows neither score nor placeholder when totalScore is negative', () => {
      emitOutput(makeOutput([makeResult({ totalScore: -1 })]));
      expect(getResultRowCells()).toEqual([['Equipment #1', 'Low']]);
    });

    it('hides the motor power warning when hasMotorPowerPriority is false', () => {
      expect(queryAll('.alert-warning').filter(el => el.tagName === 'DIV').length).toBe(0);
    });

    it('shows the motor power warning only for results with motor power priority', () => {
      emitOutput(makeOutput([
        makeResult({ name: 'Fan A', hasMotorPowerPriority: true }),
        makeResult({ name: 'Fan B', hasMotorPowerPriority: false }),
      ]));
      const warnings = queryAll('div.alert-warning');
      expect(warnings.length).toBe(1);
      expect(normalize(warnings[0].textContent)).toContain('Priority rating solely due to size of motor.');
      expect(warnings[0].previousElementSibling.querySelector('td').textContent.trim()).toBe('Fan A');
    });
  });

  describe('destroy', () => {
    it('stops updating the output after the component is destroyed', () => {
      const before = component.fanSystemChecklistOutput;
      fixture.destroy();
      serviceMock.fanSystemChecklistOutput.next(makeOutput([]));
      expect(component.fanSystemChecklistOutput).toBe(before);
    });
  });
});
