import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FullLoadAmpsService } from '../full-load-amps.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { MotorService } from '../../../../psat/motor/motor.service';
import { PSAT } from '../../../../shared/models/psat';
import { PsatCsvDataFields } from '../../../../shared/helper-services/json-to-csv.service';
import { PsatService } from '../../../../psat/psat.service';
import { Assessment } from '../../../../shared/models/assessment';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { FanMotor } from '../../../../shared/models/fans';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-full-load-amps-form',
  templateUrl: './full-load-amps-form.component.html',
  styleUrls: ['./full-load-amps-form.component.css']
})
export class FullLoadAmpsFormComponent implements OnInit {

  @Input()
  settings: Settings;

  @Input()
  motor: FanMotor;



  mockPsat: Assessment;
  newPsat: PSAT;

  efficiencyClasses: Array<{ value: number, display: string }>;
  frequencies: Array<number> = [
    50,
    60
  ];
  options: Array<any>;
  motorForm: FormGroup;
  idString: string;
  selected: boolean = true;
  constructor(private motorService: MotorService, private psatService: PsatService, private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.efficiencyClasses = motorEfficiencyConstants;
    this.idString = 'fla_calc';


    // this.motorForm = new FormGroup({
    //   lineFrequency: new FormControl(null),
    //   motorRatedPower: new FormControl(null),
    //   motorRpm: new FormControl(null),
    //   efficiencyClass: new FormControl(null),
    //   specifiedEfficiency: new FormControl(null),
    //   motorRatedVoltage: new FormControl(null),
    //   fullLoadAmps: new FormControl(null)
    // });
    // this.motorForm.setValue({
    //   lineFrequency: 60,
    //   motorRatedPower: 350.01,
    //   motorRpm: 2000,
    //   efficiencyClass: 0,
    //   specifiedEfficiency: 95,
    //   motorRatedVoltage: 460,
    //   fullLoadAmps: 389.08
    // });

    this.motor = {
      lineFrequency: 60,
      motorRatedPower: 350.01,
      motorRpm: 2000,
      efficiencyClass: 0,
      specifiedEfficiency: 95,
      motorRatedVoltage: 460,
      fullLoadAmps: 400
    };

    // this.motorForm.patchValue({
    //   lineFrequency: 60,
    //   motorRatedPower: 350.01,
    //   motorRpm: 2000,
    //   efficiencyClass: 0,
    //   specifiedEfficiency: 95,
    //   motorRatedVoltage :460,
    //   fullLoadAmps: 389.08
    // });

    this.init();


  }

  init() {
    //this.motor = this.fullLoadAmpsService.getObjFromForm(this.motorForm)
    this.motorForm = this.fullLoadAmpsService.getFormFromObj(this.motor);

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
  }


  getFullLoadAmps() {
    //this.motorForm = this.psatService.setFormFullLoadAmps(this.motorForm, this.settings);
    this.motorForm.patchValue({
      fullLoadAmps: this.calcFla()
    });
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
    console.log(estEfficiency);
    return estEfficiency;

  }


  focusField(str: string) {
  }




}

// export interface MotorObj {
//   lineFrequency: number;
//   motorRatedPower: number;
//   motorRpm: number;
//   efficiencyClass: number;
//   specifiedEfficiency?: number;
//   motorRatedVoltage: number;
//   fullLoadAmps: number;

// }