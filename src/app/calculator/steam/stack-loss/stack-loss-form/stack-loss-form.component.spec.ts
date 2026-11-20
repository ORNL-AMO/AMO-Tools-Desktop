import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { StackLossFormComponent } from './stack-loss-form.component';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeForm(): UntypedFormGroup {
  return new UntypedFormBuilder().group({ flueGasTemperature: [300] });
}

describe('StackLossFormComponent', () => {
  let component: StackLossFormComponent;
  let fixture: ComponentFixture<StackLossFormComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(method: number): void {
    fixture = TestBed.createComponent(StackLossFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('method', method);
    fixture.componentRef.setInput('stackLossForm', makeForm());
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inModal', false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StackLossFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('template visibility', () => {
    it('shows only the by-volume form for gas (method 1)', () => {
      createComponent(1);
      expect(query('app-stack-loss-by-volume')).not.toBeNull();
      expect(query('app-stack-loss-by-mass')).toBeNull();
    });

    it('shows only the by-mass form for solid/liquid (method 0)', () => {
      createComponent(0);
      expect(query('app-stack-loss-by-mass')).not.toBeNull();
      expect(query('app-stack-loss-by-volume')).toBeNull();
    });

    it('shows neither form for an unknown method', () => {
      createComponent(2);
      expect(query('app-stack-loss-by-mass')).toBeNull();
      expect(query('app-stack-loss-by-volume')).toBeNull();
    });

    it('swaps forms when the method changes', () => {
      createComponent(1);
      fixture.componentRef.setInput('method', 0);
      fixture.detectChanges();
      expect(query('app-stack-loss-by-mass')).not.toBeNull();
      expect(query('app-stack-loss-by-volume')).toBeNull();
    });
  });

  describe('outputs', () => {
    beforeEach(() => createComponent(1));

    it('re-emits calculate with the form', () => {
      const emitted = [];
      component.emitCalculate.subscribe(form => emitted.push(form));
      const form = makeForm();
      component.calculate(form);
      expect(emitted).toEqual([form]);
    });

    it('re-emits the changed field', () => {
      const emitted = [];
      component.emitChangeField.subscribe(field => emitted.push(field));
      component.changeField('flueGasTemperature');
      expect(emitted).toEqual(['flueGasTemperature']);
    });
  });
});
