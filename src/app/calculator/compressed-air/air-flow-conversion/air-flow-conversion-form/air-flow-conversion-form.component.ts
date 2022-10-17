import { Component, OnInit, Input } from '@angular/core';
import { AirFlowConversionService } from '../air-flow-conversion.service';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { AirFlowConversionInput } from '../../../../shared/models/compressed-air/compressed-air';

@Component({
  selector: 'app-air-flow-conversion-form',
  templateUrl: './air-flow-conversion-form.component.html',
  styleUrls: ['./air-flow-conversion-form.component.css']
})
export class AirFlowConversionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  
  airFlowConversionForm: UntypedFormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  constructor(private airFlowConversionService: AirFlowConversionService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.airFlowConversionService.resetData.subscribe(value => {
        this.updateForm();
    })
    this.generateExampleSub = this.airFlowConversionService.generateExample.subscribe(value => {
      this.updateForm();
    })
  }

  updateForm() {
    let airFlowConversionInput: AirFlowConversionInput = this.airFlowConversionService.airFlowConversionInput.getValue();
    this.airFlowConversionForm = this.airFlowConversionService.getAirFlowConversionFormFromObj(airFlowConversionInput, this.settings);
    this.setIsStandardConversion(airFlowConversionInput.convertToStandard);
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  showHideInputField() {
    this.airFlowConversionForm.patchValue({
      userDefinedPressure: !this.airFlowConversionForm.controls.userDefinedPressure.value
    });
    if (!this.airFlowConversionForm.controls.userDefinedPressure.value) {
      this.save();
    }
  }

  setIsStandardConversion(toStandard: boolean) {
    this.airFlowConversionForm.patchValue({
      convertToStandard: toStandard
    })
    this.save();
  }

  save() {
    if (!this.airFlowConversionForm.controls.userDefinedPressure.value) {
      let calculatedPressure: number = this.airFlowConversionService.calculatePressureFromElevation(this.airFlowConversionForm.controls.elevation.value, this.settings);
      this.airFlowConversionForm.patchValue({
        actualAtmosphericPressure: calculatedPressure
      })
    }
    let updatedInput: AirFlowConversionInput = this.airFlowConversionService.getAirFlowConversionObjFromForm(this.airFlowConversionForm);
    this.airFlowConversionService.airFlowConversionInput.next(updatedInput)
  }
}
