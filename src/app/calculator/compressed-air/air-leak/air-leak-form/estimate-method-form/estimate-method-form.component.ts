import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AirLeakSurveyInput, AirLeakSurveyData } from '../../../../../shared/models/standalone';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-estimate-method-form',
    templateUrl: './estimate-method-form.component.html',
    styleUrls: ['./estimate-method-form.component.css'],
    standalone: false
})
export class EstimateMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndexSub: Subscription;
  currentLeakIndex: number;

  estimateMethodForm: UntypedFormGroup;

  constructor(private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService) { }

  ngOnInit(): void {
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      let airLeakInput = this.airLeakService.airLeakInput.getValue();
      if (airLeakInput) {
        let tempLeak: AirLeakSurveyData = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]
        this.estimateMethodForm = this.airLeakFormService.getEstimateFormFromObj(tempLeak);
      }
    })
  }

  ngOnDestroy(): void {
    this.currentLeakIndexSub.unsubscribe();
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
