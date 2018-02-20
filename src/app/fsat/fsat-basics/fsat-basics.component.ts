import { Component, OnInit } from '@angular/core';
import { FanRatedInfo } from '../../shared/models/fans';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpPanelService } from '../help-panel/help-panel.service';

@Component({
  selector: 'app-fsat-basics',
  templateUrl: './fsat-basics.component.html',
  styleUrls: ['./fsat-basics.component.css']
})
export class FsatBasicsComponent implements OnInit {

  fanRatedInfo: FanRatedInfo;

  ratedInfoForm: FormGroup;

  driveTypes: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];

  planes: Array<number> =[
    1,2,3
  ]

  constructor(private formBuilder: FormBuilder, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.ratedInfoForm = this.formBuilder.group({
      fanSpeed: [1191.0, Validators.required],
      motorSpeed: [1191.0, Validators.required],
      fanSpeedCorrected: [1170.0, Validators.required],
      densityCorrected: [.0500, Validators.required],
      pressureBarometricCorrected: [26.28, Validators.required],
      driveType: ['Direct Drive'],
      includesEvase: ['Yes'],
      upDownStream: ['Upstream'],
      traversePlanes: [1]
    })
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }


  save() {

  }


}
