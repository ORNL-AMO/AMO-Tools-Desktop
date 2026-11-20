import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InternalDimensionModalComponent } from './internal-dimension-modal.component';
import { Settings } from '../../../../shared/models/settings';

// Stands in for ngx-bootstrap's ModalDirective so the template's `#internalDimensionModal="bs-modal"` export resolves.
@Directive({
  selector: '[bsModal]',
  exportAs: 'bs-modal',
  standalone: false,
})
class BsModalStubDirective {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

function makeSettings(unitsOfMeasure: string): Settings {
  return { unitsOfMeasure } as Settings;
}

describe('InternalDimensionModalComponent', () => {
  let component: InternalDimensionModalComponent;
  let fixture: ComponentFixture<InternalDimensionModalComponent>;

  async function createComponent(unitsOfMeasure: string) {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [InternalDimensionModalComponent, BsModalStubDirective],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalDimensionModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', makeSettings(unitsOfMeasure));
    fixture.componentRef.setInput('dimension', 'Width');
    fixture.detectChanges();
  }

  function unitAddons(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.input-group-addon.units'))
      .map((el: HTMLElement) => el.textContent.trim());
  }

  function resultSpans(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.text-center.small.bold > span'))
      .map((el: HTMLElement) => el.textContent.replace(/\s+/g, ' ').trim());
  }

  describe('initialization', () => {
    beforeEach(async () => await createComponent('Imperial'));

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('shows the modal after view init', () => {
      expect((component.boilerEfficiencyModal as unknown as BsModalStubDirective).show).toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('shows inch units for non-metric settings', async () => {
      await createComponent('Imperial');
      expect(unitAddons()).toEqual(['in', 'in']);
      expect(resultSpans()).toEqual(['— —', 'in']);
    });

    it('shows millimeter units for metric settings', async () => {
      await createComponent('Metric');
      expect(unitAddons()).toEqual(['mm', 'mm']);
      expect(resultSpans()).toEqual(['— —', 'mm']);
    });

    it('shows a placeholder when there is no internal clear dimension', async () => {
      await createComponent('Imperial');
      expect(resultSpans()).toEqual(['— —', 'in']);
    });

    it('shows the internal clear dimension once one is calculated', async () => {
      await createComponent('Imperial');
      component.inputs = { externalDimension: 10, thickness: 2 };
      component.calculate();
      fixture.detectChanges();
      expect(resultSpans()).toEqual(['6', 'in']);
    });
  });

  describe('user actions', () => {
    beforeEach(async () => await createComponent('Imperial'));

    it('calculate subtracts twice the thickness from the external dimension', () => {
      component.inputs = { externalDimension: 24, thickness: 0.5 };
      component.calculate();
      expect(component.internalClearDimension).toBe(23);
    });

    it('save emits the internal clear dimension rounded to two decimals', () => {
      const emitted: Array<number> = [];
      component.emitSave.subscribe(val => emitted.push(val));
      component.setInternalDimension(12.3456);
      fixture.nativeElement.querySelector('.btn-primary').click();
      expect(emitted).toEqual([12.35]);
    });

    it('cancel hides the modal and emits close', () => {
      const emitted: Array<boolean> = [];
      component.emitClose.subscribe(val => emitted.push(val));
      fixture.nativeElement.querySelector('.btn-secondary').click();
      expect((component.boilerEfficiencyModal as unknown as BsModalStubDirective).hide).toHaveBeenCalled();
      expect(emitted).toEqual([true]);
    });
  });
});
