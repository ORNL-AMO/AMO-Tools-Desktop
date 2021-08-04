import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FullLoadAmpsService } from '../full-load-amps.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { PSAT } from '../../../../shared/models/psat';
import { PsatService } from '../../../../psat/psat.service';
import { Assessment } from '../../../../shared/models/assessment';
import { FanMotor } from '../../../../shared/models/fans';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-full-load-amps-form',
  templateUrl: './full-load-amps-form.component.html',
  styleUrls: ['./full-load-amps-form.component.css']
})
export class FullLoadAmpsFormComponent implements OnInit {

  @Input()
  settings: Settings;

  @Output('emitSave')
  emitSave = new EventEmitter<FanMotor>();

  @Input() motor: FanMotor;



  mockPsat: Assessment;
  newPsat: PSAT;

  efficiencyClasses: Array<{ value: number, display: string }>;
  frequencies: Array<number> = [
    50,
    60
  ];
  options: Array<any>;
  motorForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  idString: string;
  selected: boolean = true;
  flaOutput: number;
  frequency: number;
  constructor( private psatService: PsatService, private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.efficiencyClasses = motorEfficiencyConstants;
    this.idString = 'fla_calc';
    


    this.motor = {
      lineFrequency: 60,
      motorRatedPower: 600,
      motorRpm: 1180,
      efficiencyClass: 1,
      specifiedEfficiency: 100,
      motorRatedVoltage: 470,
      fullLoadAmps: 683.25
    };



    //this.init();
    this.initSubscription();


  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }


  init() {
    //this.motor = this.fullLoadAmpsService.getObjFromForm(this.motorForm)
    this.motorForm = this.fullLoadAmpsService.getFormFromObj(this.motor);
    //this.motor = this.fullLoadAmpsService.getObjFromForm(this.motorForm);

  }

  initSubscription(){
    this.generateExampleSub = this.fullLoadAmpsService.generateExample.subscribe(value => {
      this.updateForm();
    })
  }

  updateForm(){
    let flaInputs: FanMotor = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    this.motorForm = this.fullLoadAmpsService.getFormFromObj(flaInputs);
    this.save();
  }

  calculate() {
    let data: FanMotor = this.fullLoadAmpsService.getObjFromForm(this.motorForm);
    this.emitSave.emit(data);


  }

  save() {
    this.motor = this.fullLoadAmpsService.getObjFromForm(this.motorForm);
    this.emitSave.emit(this.motor);
  }

  changeEfficiencyClass() {
    //this.motorForm = this.motorService.updateFormEfficiencyValidators(this.motorForm);
  }

  changeLineFreq() {
    if (this.motorForm.controls.lineFrequency.value == 60) {
      if (this.motorForm.controls.motorRpm.value == 1485) {
        this.motorForm.patchValue({
          motorRpm: 1780
        })
      }
    } else if (this.motorForm.controls.lineFrequency.value == 50) {
      if (this.motorForm.controls.motorRpm.value == 1780) {
        this.motorForm.patchValue({
          motorRpm: 1485
        })
      }
    }
    this.save();
  }


  getFullLoadAmps() {
    this.motorForm.patchValue({
      fullLoadAmps: this.calcFla()
    });
    this.save();
  }

  calcFla(): number {
    let tmpEfficiency: number;
    //use efficiency class value if not specified efficiency class for efficiency
    if (this.motorForm.controls.efficiencyClass.value !== 3) {
      tmpEfficiency = this.motorForm.controls.efficiencyClass.value;
    } else {
      tmpEfficiency = this.motorForm.controls.specifiedEfficiency.value;
    }
    //estFLA method needs: 
    //lineFrequency as a string with Hz appended to value
    //efficiencyClass as the string name value
    let estEfficiency = this.psatService.estFLA(
      this.motorForm.controls.motorRatedPower.value,
      this.motorForm.controls.motorRpm.value,
      this.motorForm.controls.lineFrequency.value,
      this.motorForm.controls.efficiencyClass.value,
      tmpEfficiency,
      this.motorForm.controls.motorRatedVoltage.value,
      this.settings
    );
    this.flaOutput = estEfficiency;
    return estEfficiency;

  }


  focusField(str: string) {
  }




}
