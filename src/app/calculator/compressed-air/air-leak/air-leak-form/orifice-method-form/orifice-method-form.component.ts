import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput, OrificeMethodData } from '../../../../../shared/models/standalone';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-orifice-method-form',
    templateUrl: './orifice-method-form.component.html',
    styleUrls: ['./orifice-method-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OrificeMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndex: number;

  orificeMethodForm: FormGroup;

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
          this.orificeMethodForm = this.airLeakFormService.getOrificeFormFromObj(tempLeak);
          this.cdr.markForCheck();
        }
      });
  }

  save() {
    let airLeakSurveyInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    let orificeMethodData: OrificeMethodData = this.airLeakFormService.getOrificeObjFromForm(this.orificeMethodForm);
    airLeakSurveyInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex].orificeMethodData = orificeMethodData
    this.airLeakService.airLeakInput.next(airLeakSurveyInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
