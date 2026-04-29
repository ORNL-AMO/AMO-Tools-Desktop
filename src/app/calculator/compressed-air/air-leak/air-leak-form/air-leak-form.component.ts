import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakSurveyInput, AirLeakSurveyData } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';
import { AirLeakFormService } from './air-leak-form.service';
import { LeakMeasurementMethod, measurementMethods } from '../../compressed-air-constants';

@Component({
    selector: 'app-air-leak-form',
    templateUrl: './air-leak-form.component.html',
    styleUrls: ['./air-leak-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakFormComponent implements OnInit {

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @Input()
  settings: Settings;

  currentLeakIndex: number;
  leakForm: FormGroup;

  measurementMethods = measurementMethods;
  LeakMeasurementMethod = LeakMeasurementMethod;

  private destroyRef = inject(DestroyRef);

  constructor(private airLeakService: AirLeakService, private airLeakFormService: AirLeakFormService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.airLeakService.currentLeakIndex
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.currentLeakIndex = value;
        const airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
        if (airLeakInput) {
          this.leakForm = this.airLeakFormService.getLeakFormFromObj(airLeakInput.compressedAirLeakSurveyInputVec[value]);
          this.cdr.markForCheck();
        }
      });
    this.airLeakService.airLeakInput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(airLeakInput => {
        if (airLeakInput) {
          this.currentLeakIndex = this.airLeakService.currentLeakIndex.getValue();
          this.leakForm = this.airLeakFormService.getLeakFormFromObj(airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]);
          this.cdr.markForCheck();
        }
      });
  }

  addLeak() {
    let newLeakData: AirLeakSurveyData = this.airLeakFormService.getEmptyAirLeakData();
    let airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    airLeakInput.compressedAirLeakSurveyInputVec.push(newLeakData);
    this.airLeakService.airLeakInput.next(airLeakInput);
    this.airLeakService.currentLeakIndex.next(airLeakInput.compressedAirLeakSurveyInputVec.length - 1);
  }

  saveLeak() {
    let tempForm: AirLeakSurveyData = this.airLeakFormService.getAirLeakObjFromForm(this.leakForm);
    let airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex] = tempForm;
    this.airLeakService.airLeakInput.next(airLeakInput);
  }


  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
