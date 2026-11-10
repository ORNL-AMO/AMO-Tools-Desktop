import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { OperatingHoursFieldComponent } from './operating-hours-field.component';

describe('OperatingHoursFieldComponent', () => {
  let fixture: ComponentFixture<OperatingHoursFieldComponent>;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;
  let closed: Subject<OperatingHours | undefined>;
  let operatingHours: FormControl<number | null>;
  let operatingHoursCalc: FormControl<OperatingHours | undefined>;

  beforeEach(() => {
    closed = new Subject();
    modalDialogService = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogService.openModal.and.returnValue({ closed } as never);
    operatingHours = new FormControl<number | null>(8760);
    operatingHoursCalc = new FormControl<OperatingHours | undefined>({ hoursPerYear: 8760 } as OperatingHours);
    TestBed.configureTestingModule({
      declarations: [OperatingHoursFieldComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ModalDialogService, useValue: modalDialogService },
        { provide: ProcessHeatingUiService, useValue: { focusedFieldSignal: signal('default') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(OperatingHoursFieldComponent);
    fixture.componentRef.setInput('operatingHours', operatingHours);
    fixture.componentRef.setInput('operatingHoursCalc', operatingHoursCalc);
    fixture.componentRef.setInput('inputId', 'hours');
    fixture.componentRef.setInput('settings', {} as Settings);
    fixture.detectChanges();
  });

  it('opens the calculator with the saved calculation', () => {
    fixture.componentInstance.openOperatingHoursModal();

    const [, config] = modalDialogService.openModal.calls.mostRecent().args;
    expect(config.data).toEqual({ operatingHours: jasmine.objectContaining({ hoursPerYear: 8760 }), showMinutesSeconds: false });
  });

  it('writes the calculated hours and the calculation back to the controls', () => {
    fixture.componentInstance.openOperatingHoursModal();
    closed.next({ hoursPerYear: 6000 } as OperatingHours);

    expect(operatingHours.value).toBe(6000);
    expect(operatingHoursCalc.value).toEqual(jasmine.objectContaining({ hoursPerYear: 6000 }));
  });

  it('leaves the controls alone when the calculator is cancelled', () => {
    fixture.componentInstance.openOperatingHoursModal();
    closed.next(undefined);

    expect(operatingHours.value).toBe(8760);
  });

  it('ignores a calculator result that arrives after destroy', () => {
    fixture.componentInstance.openOperatingHoursModal();
    fixture.destroy();
    closed.next({ hoursPerYear: 6000 } as OperatingHours);

    expect(operatingHours.value).toBe(8760);
  });
});
