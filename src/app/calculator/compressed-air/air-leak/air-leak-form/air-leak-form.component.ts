import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, FacilityCompressorData } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakService } from '../air-leak.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-air-leak-form',
  templateUrl: './air-leak-form.component.html',
  styleUrls: ['./air-leak-form.component.css']
})
export class AirLeakFormComponent implements OnInit {


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @Input()
  settings: Settings;
  
  airLeakInput: AirLeakSurveyInput;
  inEditMode: boolean = false;
  currentLeakIndex: number;
  leakForm: FormGroup;

  resetData: boolean;
  currentFieldSub: Subscription;
  airLeakInputSub: Subscription;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  currentLeakIndexSub: Subscription;
 
  measurementMethods: Array<{display: string, value: number}> = [
    {display: 'Estimate', value: 0},
    {display: 'Decibel Method', value: 1},
    {display: 'Bag Method', value: 2},
    {display: 'Orifice Method', value: 3},
  ];

  constructor(private airLeakService: AirLeakService) { }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initForm();
  }
  ngOnChange(changes: SimpleChanges) {
    console.log(changes);
  }

  ngOnDestroy() {
    this.airLeakInputSub.unsubscribe();
    this.resetDataSub.unsubscribe();
  }
  
  initSubscriptions() {
    this.airLeakInputSub =  this.airLeakService.airLeakInput.subscribe(value => {
      this.airLeakInput = value;
    })
    this.currentLeakIndexSub = this.airLeakService.currentLeakIndex.subscribe(value => {
      this.currentLeakIndex = value;
      if (this.airLeakInput.compressedAirLeakSurveyInputVec.length > 0) {
        let tempLeak = this.airLeakInput.compressedAirLeakSurveyInputVec[value]
        this.leakForm = this.airLeakService.getLeakFormFromObj(tempLeak);
        this.inEditMode = true;
      }
    })
    this.resetDataSub = this.airLeakService.resetData.subscribe(value => {
      this.leakForm = this.airLeakService.getLeakFormReset(this.settings);
      this.airLeakInput.compressedAirLeakSurveyInputVec = Array<AirLeakSurveyData>();
      this.airLeakService.initDefaultEmptyOutputs();
      this.emitChange();
      this.inEditMode = false;
    })
  }

  initForm() {
    this.leakForm = this.airLeakService.getLeakFormReset(this.settings);
  }

  addLeak() {
    let tempForm = this.airLeakService.getObjFromForm(this.leakForm);
    this.airLeakInput.compressedAirLeakSurveyInputVec.push(tempForm);
    this.emitChange();
    this.initForm();
  }

  saveLeak() {
    let tempForm: AirLeakSurveyData = this.airLeakService.getObjFromForm(this.leakForm);
    this.airLeakInput.compressedAirLeakSurveyInputVec[this.currentLeakIndex] = tempForm;
    this.emitChange();
    this.initForm();
    this.inEditMode = false;
  }
  
  emitChange() {
    this.airLeakService.airLeakInput.next(this.airLeakInput);
  }

  changeField(str: string) {
    this.airLeakService.currentField.next(str);
  }

}
