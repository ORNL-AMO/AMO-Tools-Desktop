import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FanSystemChecklistCopyTableComponent } from './fan-system-checklist-copy-table.component';
import { fanChecklistQuestions, FanSystemChecklistResult } from '../../../../shared/models/fans';

function makeResult(): FanSystemChecklistResult {
  return {
    name: 'Equipment #1',
    priority: 'Medium',
    totalScore: 3,
    motorPowerScore: 1,
    operatingHoursScore: 1,
    controlsScore: 0,
    productionScore: 1,
    systemScore: 0,
    hasMotorPowerPriority: false,
    notes: 'Check damper',
    checklistAnswers: {
      motorOverloads: 'False',
      spillOrBypass: 'True',
      dischargeDamper: 'False',
      inletDamper: 'False',
      variableInletVane: 'False',
      systemDamper: 'False',
      damperClosed: 'False',
      turnRight: 'False',
      turnNear: 'False',
      dirtLeg: 'False',
      noOutletDuct: 'False',
      restrictedInlet: 'False',
      excessFlowOrPressure: 'Yes',
      unstableSystem: 'No',
      unreliableSystem: 'No',
      lowFlowOrPressure: 'No',
      systemNoisy: 'No',
      fanBladeBuildup: 'No',
      weldingDuctwork: 'No',
      radialFanCleanAir: 'Severe',
    }
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanSystemChecklistCopyTableComponent', () => {
  let component: FanSystemChecklistCopyTableComponent;
  let fixture: ComponentFixture<FanSystemChecklistCopyTableComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getRowCells(): Array<Array<string>> {
    return Array.from(fixture.nativeElement.querySelectorAll('.hidden-copy-table tr'))
      .map((row: HTMLElement) => Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent)));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanSystemChecklistCopyTableComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanSystemChecklistCopyTableComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('assigns the checklist questions', () => {
      fixture.detectChanges();
      expect(component.checklistQuestions).toBe(fanChecklistQuestions);
    });
  });

  describe('template visibility', () => {
    it('hides the copy table when there is no result', () => {
      fixture.detectChanges();
      expect(query('.hidden-copy-table')).toBeNull();
    });

    it('always renders the exportable results table', () => {
      fixture.detectChanges();
      expect(query('app-exportable-results-table')).not.toBeNull();
    });

    it('renders the result summary and checklist answers when a result is given', () => {
      fixture.componentRef.setInput('result', makeResult());
      fixture.detectChanges();
      const rows = getRowCells();
      expect(rows.slice(0, 8)).toEqual([
        ['Equipment #1', 'Medium Priority'],
        ['Total', '3'],
        ['Motor Power', '1'],
        ['Operating Hours', '1'],
        ['Control', '0'],
        ['Production', '1'],
        ['System', '0'],
        ['Notes', 'Check damper'],
      ]);
      expect(rows.length).toBe(8 + Object.keys(fanChecklistQuestions).length);
      expect(rows[8]).toEqual([fanChecklistQuestions.motorOverloads, 'False']);
      expect(rows[9]).toEqual([fanChecklistQuestions.spillOrBypass, 'True']);
      expect(rows[rows.length - 1]).toEqual([fanChecklistQuestions.radialFanCleanAir, 'Severe']);
      expect(query('app-exportable-results-table')).not.toBeNull();
    });
  });

  describe('user actions', () => {
    it('copies the table text into copyTableString', () => {
      fixture.componentRef.setInput('result', makeResult());
      fixture.detectChanges();
      component.updateCopyTableString();
      expect(component.copyTableString).toContain('Equipment #1');
      expect(component.copyTableString).toContain(fanChecklistQuestions.radialFanCleanAir);
    });
  });
});
