import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { AirLeakSurveyInput, AirLeakSurveyData } from '../../../../../shared/models/standalone';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-estimate-method-form',
    templateUrl: './estimate-method-form.component.html',
    styleUrls: ['./estimate-method-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EstimateMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndex: number;

  estimateMethodForm: FormGroup;

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
          this.estimateMethodForm = this.airLeakFormService.getEstimateFormFromObj(tempLeak);
          this.cdr.markForCheck();
        }
      });
  }

  save() {
    let airLeakSurveyInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    airLeakSurveyInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex].estimateMethodData.leakRateEstimate = this.estimateMethodForm.controls.leakRateEstimate.value;
    this.airLeakService.airLeakInput.next(airLeakSurveyInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
