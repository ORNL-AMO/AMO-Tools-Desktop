import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AirLeakService } from '../../air-leak.service';
import { AirLeakFormService } from '../air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../../shared/models/standalone';
import { Settings } from '../../../../../shared/models/settings';

@Component({
    selector: 'app-bag-method-form',
    templateUrl: './bag-method-form.component.html',
    styleUrls: ['./bag-method-form.component.css'],
    standalone: false
})
export class BagMethodFormComponent implements OnInit {

  @Input()
  settings: Settings;
  currentLeakIndexSub: Subscription;
  currentLeakIndex: number;

  bagMethodForm: UntypedFormGroup;

  constructor(private airLeakService: AirLeakService,
    private airLeakFormService: AirLeakFormService) { }

  ngOnInit(): void {
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      let airLeakInput = this.airLeakService.airLeakInput.getValue();
      if (airLeakInput) {
        let tempLeak: AirLeakSurveyData = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]
        this.bagMethodForm = this.airLeakFormService.getBagFormFromObj(tempLeak);
      }
    })
  }

  ngOnDestroy(): void {
    this.currentLeakIndexSub.unsubscribe();
  }

  save() {
    let airLeakSurveyInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    let bagMethodData = this.airLeakFormService.getBagObjFromForm(this.bagMethodForm);
    airLeakSurveyInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex].bagMethodData = bagMethodData
    this.airLeakService.airLeakInput.next(airLeakSurveyInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
