import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, FacilityCompressorData, OrificeMethodData } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AirLeakFormService } from './air-leak-form.service';

@Component({
  selector: 'app-air-leak-form',
  templateUrl: './air-leak-form.component.html',
  styleUrls: ['./air-leak-form.component.css']
})
export class AirLeakFormComponent implements OnInit {


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @Input()
  settings: Settings;

  currentLeakIndex: number;
  leakForm: FormGroup;
  currentLeakIndexSub: Subscription;
  airLeakInputSub: Subscription;
  orificeMethodForm: FormGroup;

  measurementMethods: Array<{ display: string, value: number }> = [
    { display: 'Estimate', value: 0 },
    { display: 'Decibel Method', value: 1 },
    { display: 'Bag Method', value: 2 },
    { display: 'Orifice Method', value: 3 },
  ];

  constructor(private airLeakService: AirLeakService, private airLeakFormService: AirLeakFormService) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.currentLeakIndexSub.unsubscribe();
    this.airLeakInputSub.unsubscribe();
  }

  initSubscriptions() {
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      let airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
      if (airLeakInput) {
        let tempLeak = airLeakInput.compressedAirLeakSurveyInputVec[value]
        this.leakForm = this.airLeakFormService.getLeakFormFromObj(tempLeak);
      }
    })
    this.airLeakInputSub = this.airLeakService.airLeakInput.subscribe(airLeakInput => {
      if (airLeakInput) {
        let tempLeak = airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex]
        this.leakForm = this.airLeakFormService.getLeakFormFromObj(tempLeak);
      }
    })
  }

  addLeak() {
    let newLeakData: AirLeakSurveyData = this.airLeakFormService.getEmptyAirLeakData();
    let airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    airLeakInput.compressedAirLeakSurveyInputVec.push(newLeakData);
    this.airLeakService.airLeakInput.next(airLeakInput);
    this.airLeakService.currentLeakIndex.next(airLeakInput.compressedAirLeakSurveyInputVec.length - 1);
  }

  saveLeak() {
    let tempForm: AirLeakSurveyData = this.airLeakFormService.getAirLeakObjFromForm(this.leakForm);
    let airLeakInput: AirLeakSurveyInput = this.airLeakService.airLeakInput.getValue();
    airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex] = tempForm;
    this.airLeakService.airLeakInput.next(airLeakInput);
  }


  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
