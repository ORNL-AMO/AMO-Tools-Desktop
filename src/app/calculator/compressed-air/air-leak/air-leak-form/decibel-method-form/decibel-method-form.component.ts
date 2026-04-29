import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../../shared/models/standalone';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-decibel-method-form',
    templateUrl: './decibel-method-form.component.html',
    styleUrls: ['./decibel-method-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DecibelMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndex: number;

  decibelsMethodForm: FormGroup;

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
          this.decibelsMethodForm = this.airLeakFormService.getDecibelFormFromObj(tempLeak);
          this.cdr.markForCheck();
        }
      });
  }

  save() {
    let airLeakSurveyInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    let decibelsMethodData = this.airLeakFormService.getDecibelObjFromForm(this.decibelsMethodForm);
    airLeakSurveyInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex].decibelsMethodData = decibelsMethodData
    this.airLeakService.airLeakInput.next(airLeakSurveyInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }


}
