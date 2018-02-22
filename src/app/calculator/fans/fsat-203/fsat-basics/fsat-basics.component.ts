import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpPanelService } from '../../../../fsat/help-panel/help-panel.service';

@Component({
  selector: 'app-fsat-basics',
  templateUrl: './fsat-basics.component.html',
  styleUrls: ['./fsat-basics.component.css']
})
export class FsatBasicsComponent implements OnInit {
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Output('emitContinue')
  emitContinue = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<FanRatedInfo>();

  ratedInfoForm: FormGroup;

  driveTypes: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];

  planes: Array<number> = [
    1, 2, 3
  ]

  constructor(private formBuilder: FormBuilder, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.ratedInfoForm = this.getFormFromObject(this.fanRatedInfo);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }


  save() {
    this.fanRatedInfo = this.getObjectFromForm(this.ratedInfoForm);
    this.emitSave.emit(this.fanRatedInfo);
  }

  continue() {
    this.emitContinue.emit(true);
  }


  getFormFromObject(obj: FanRatedInfo): FormGroup {
    let form = this.formBuilder.group({
      fanSpeed: [obj.fanSpeed, Validators.required],
      motorSpeed: [obj.motorSpeed, Validators.required],
      fanSpeedCorrected: [obj.fanSpeedCorrected, Validators.required],
      densityCorrected: [obj.densityCorrected, Validators.required],
      pressureBarometricCorrected: [obj.pressureBarometricCorrected, Validators.required],
      driveType: [obj.driveType, Validators.required],
      includesEvase: [obj.includesEvase, Validators.required],
      upDownStream: [obj.upDownStream, Validators.required],
      traversePlanes: [obj.traversePlanes, Validators.required],
      planarBarometricPressure: [obj.planarBarometricPressure, Validators.required]
    })
    return form;
  }

  getObjectFromForm(form: FormGroup): FanRatedInfo {
    let obj: FanRatedInfo = {
      fanSpeed: form.controls.fanSpeed.value,
      motorSpeed: form.controls.motorSpeed.value,
      fanSpeedCorrected: form.controls.fanSpeedCorrected.value,
      densityCorrected: form.controls.densityCorrected.value,
      pressureBarometricCorrected: form.controls.pressureBarometricCorrected.value,
      //Mark additions
      driveType: form.controls.driveType.value,
      includesEvase: form.controls.includesEvase.value,
      upDownStream: form.controls.upDownStream.value,
      traversePlanes: form.controls.traversePlanes.value,
      planarBarometricPressure: form.controls.planarBarometricPressure.value
    }
    return obj;
  }
}
