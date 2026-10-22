import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { OtherLoss } from '../../../../shared/models/phast/losses/otherLoss';
import { Settings } from '../../../../shared/models/settings';
import { OtherFormComponent } from './other-form.component';
import { OtherFormService } from './other-form.service';
import { OtherItem } from './other.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: OtherFormService, overrides: Partial<OtherLoss> = {}): OtherItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getOtherForm({ ...overrides }),
  };
}

describe('OtherFormComponent', () => {
  let component: OtherFormComponent;
  let fixture: ComponentFixture<OtherFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [OtherFormComponent],
      providers: [OtherFormService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherFormComponent);
    component = fixture.componentInstance;
  });

  function render(): void {
    fixture.componentRef.setInput('item', makeItem(TestBed.inject(OtherFormService), { description: 'Misc', heatLoss: 100 }));
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  const field = (id: string): HTMLElement => fixture.nativeElement.querySelector(`[id="${id}"]`);

  describe('compare indicators', () => {
    it('highlights fields listed as differing from baseline', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['heatLoss']));
      fixture.detectChanges();

      expect(field(component.controlIds().heatLoss).closest('.input-group')!.classList).toContain('indicate-different');
    });

    it('leaves fields that match baseline unhighlighted', () => {
      render();
      fixture.componentRef.setInput('differingFields', new Set(['heatLoss']));
      fixture.detectChanges();

      expect(field(component.controlIds().description).classList).not.toContain('indicate-different');
    });

    it('highlights nothing without differing fields', () => {
      render();

      expect(fixture.nativeElement.querySelector('.indicate-different')).toBeNull();
    });
  });
});
