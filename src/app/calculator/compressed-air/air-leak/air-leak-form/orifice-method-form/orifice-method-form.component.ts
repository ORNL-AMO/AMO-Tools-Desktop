import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput, OrificeMethodData } from '../../../../../shared/models/standalone';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-orifice-method-form',
    templateUrl: './orifice-method-form.component.html',
    styleUrls: ['./orifice-method-form.component.css'],
    standalone: false
})
export class OrificeMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndexSub: Subscription;
  currentLeakIndex: number;

  orificeMethodForm: UntypedFormGroup;

  constructor(private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService) { }

  ngOnInit(): void {
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      let airLeakInput = this.airLeakService.airLeakInput.getValue();
      if (airLeakInput) {
        let tempLeak: AirLeakSurveyData = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]
        this.orificeMethodForm = this.airLeakFormService.getOrificeFormFromObj(tempLeak);
      }
    })
  }

  ngOnDestroy(): void {
    this.currentLeakIndexSub.unsubscribe();
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
