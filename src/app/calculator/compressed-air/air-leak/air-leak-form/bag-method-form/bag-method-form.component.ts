import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../../shared/models/standalone';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-bag-method-form',
    templateUrl: './bag-method-form.component.html',
    styleUrls: ['./bag-method-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BagMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndex: number;

  bagMethodForm: FormGroup;

  private destroyRef = inject(DestroyRef);

  constructor(private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.airLeakService.currentLeakIndex
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.currentLeakIndex = value;
        const airLeakInput = this.airLeakService.airLeakInput.getValue();
        if (airLeakInput) {
          const tempLeak: AirLeakSurveyData = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex];
          this.bagMethodForm = this.airLeakFormService.getBagFormFromObj(tempLeak, airLeakInput.facilityCompressorData.hoursPerYear);
          this.cdr.markForCheck();
        }
      });
  }

  save() {
    let airLeakSurveyInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    let facilityCompressorData = this.airLeakService.airLeakInput.getValue().facilityCompressorData;
    let bagMethodData = this.airLeakFormService.getBagObjFromForm(this.bagMethodForm, facilityCompressorData.hoursPerYear);
    airLeakSurveyInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex].bagMethodData = bagMethodData
    this.airLeakService.airLeakInput.next(airLeakSurveyInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
