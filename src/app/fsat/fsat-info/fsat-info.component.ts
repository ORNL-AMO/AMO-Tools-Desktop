import { Component, OnInit, Input } from '@angular/core';
import { FanRatedInfo } from '../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpPanelService } from '../help-panel/help-panel.service';

@Component({
  selector: 'app-fsat-info',
  templateUrl: './fsat-info.component.html',
  styleUrls: ['./fsat-info.component.css']
})
export class FsatInfoComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  
  fanInfoForm: FormGroup;

  options: Array<string> = [
    'Yes',
    'No'
  ]
  constructor(private formBuilder: FormBuilder, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.fanInfoForm = this.formBuilder.group({
      pt1Factor: [-.09, Validators.required],
      //showInletDamperCurves: ['No', Validators.required],
      //showInterpolatedDamperCurves: ['Yes', Validators.required],
      interpolatedCurveTimeOpen: [35.5, Validators.required],
      //showVariableSpeedCurves: ['No', Validators.required],
      impellerDiameter: [78.5, Validators.required],
      planeArea1: [34.04, Validators.required],
      planeArea2: [12.66, Validators.required],
      originalFanSpeed: [1180, Validators.required],
      originalDensity: [.0308, Validators.required],
      originalPressure: [29.36, Validators.required],
      originalIsentropicExponent: [1.4, Validators.required],
      convertedFanSpeed: [1187, Validators.required],
      convertedDensity: [.0332, Validators.required],
      convertedPressure: [29.36, Validators.required],
      convertedIsentropicExponent: [1.40, Validators.required]
    })
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }
}
