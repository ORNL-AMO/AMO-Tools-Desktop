import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../../shared/models/standalone';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-decibel-method-form',
  templateUrl: './decibel-method-form.component.html',
  styleUrls: ['./decibel-method-form.component.css']
})
export class DecibelMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndexSub: Subscription;
  currentLeakIndex: number;

  decibelsMethodForm: UntypedFormGroup;

  constructor(private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService) { }

  ngOnInit(): void {
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      let airLeakInput = this.airLeakService.airLeakInput.getValue();
      if (airLeakInput) {
        let tempLeak: AirLeakSurveyData = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]
        this.decibelsMethodForm = this.airLeakFormService.getDecibelFormFromObj(tempLeak);
      }
    })
  }

  ngOnDestroy(): void {
    this.currentLeakIndexSub.unsubscribe();
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
