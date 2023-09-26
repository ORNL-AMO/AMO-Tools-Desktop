import { Component, OnInit, Input } from '@angular/core';
import { FanShaftPowerFormService } from './fan-shaft-power-form.service';
import { PsatService } from '../../../../../psat/psat.service';
import { UntypedFormGroup } from '@angular/forms';
import { FanShaftPower, FanShaftPowerResults } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';
import { FanInfoFormService } from '../fan-info-form/fan-info-form.service';
import { PlaneDataFormService } from '../plane-data-form/plane-data-form.service';
import { GasDensityFormService } from '../gas-density-form/gas-density-form.service';
import { FsatService } from '../../../../../fsat/fsat.service';

@Component({
  selector: 'app-fan-shaft-power-form',
  templateUrl: './fan-shaft-power-form.component.html',
  styleUrls: ['./fan-shaft-power-form.component.css']
})
export class FanShaftPowerFormComponent implements OnInit {
  @Input()
  settings: Settings;

  shaftPowerForm: UntypedFormGroup;
  driveTypes: Array<{ name: string, efficiency: number }> = [
    { name: 'Direct Drive', efficiency: 100 },
    { name: 'V-Belt Drive', efficiency: 93 },
    { name: 'Notched V-Belt Drive', efficiency: 95 },
    { name: 'Synchronous Belt Drive', efficiency: 98 }
  ];

  frequencies: Array<number> = [
    50,
    60
  ];

  efficiencyClasses: Array<{ value: number, display: string }> = [{
    value: 0,
    display: 'Standard Efficiency'
  },
  {
    value: 1,
    display: 'Energy Efficient'
  },
  {
    value: 2,
    display: 'Premium Efficient'
  }]

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  //todo: implement logic for premium
  horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  fanShaftPower: FanShaftPower;
  resetFormSubscription: Subscription;
  flaDisabled: boolean = true;
  results: FanShaftPowerResults;
  fanShaftPowerResultSub: Subscription;
  constructor(
    private fanShaftPowerFormService: FanShaftPowerFormService, 
    private psatService: PsatService, 
    private fanAnalysisService: FanAnalysisService,
    private gasDensityFormService: GasDensityFormService,
    private planeDataFormService: PlaneDataFormService, 
    private fanInfoFormService: FanInfoFormService,
    private fsatService: FsatService
    ) { }

  ngOnInit() {
    this.shaftPowerForm = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    this.checkFlaDisabled();
    this.fanShaftPower = this.fanAnalysisService.inputData.FanShaftPower;
    this.initSubscriptions();
    this.save();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    });
  }

  resetData() {
    this.shaftPowerForm = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
  }

  calcAverageAmps() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    let total = this.fanAnalysisService.inputData.FanShaftPower.phase1.amps + this.fanAnalysisService.inputData.FanShaftPower.phase2.amps + this.fanAnalysisService.inputData.FanShaftPower.phase3.amps;
    this.fanAnalysisService.inputData.FanShaftPower.amps = total / 3;
    this.calcMotorShaftPower();
  }

  calcAverageVoltage() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    let total = this.fanAnalysisService.inputData.FanShaftPower.phase1.voltage + this.fanAnalysisService.inputData.FanShaftPower.phase2.voltage + this.fanAnalysisService.inputData.FanShaftPower.phase3.voltage;
    this.fanAnalysisService.inputData.FanShaftPower.voltage = total / 3;
    this.calcMotorShaftPower();
  }

  calcMotorShaftPower() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    let calculatedMotorShaftPower = this.fanAnalysisService.inputData.FanShaftPower.voltage * this.fanAnalysisService.inputData.FanShaftPower.amps * Math.sqrt(3) * (this.fanAnalysisService.inputData.FanShaftPower.powerFactorAtLoad / 745);
    this.shaftPowerForm.patchValue({
      motorShaftPower: calculatedMotorShaftPower
    });
    this.save();
  }


  setBeltEfficiency() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    let tmpEff: { name: string, efficiency: number } = this.driveTypes.find((type) => { return type.name === this.fanAnalysisService.inputData.FanShaftPower.driveType; });
    this.shaftPowerForm.patchValue({
      efficiencyBelt: tmpEff.efficiency
    });
    this.save();
  }

  save() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower, true, this.settings);
    this.fanShaftPower = this.fanAnalysisService.inputData.FanShaftPower;
    this.checkFlaDisabled();
    this.fanAnalysisService.getResults.next(true);
    this.calculatePowerResults();
  }

  calculatePowerResults() {
      let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
      let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
      let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
      let shaftPowerDone: boolean = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower, true, this.settings).valid;
  
      if (planeDataDone && basicsDone && gasDone && shaftPowerDone) {
        let fanResults = this.fsatService.fan203(this.fanAnalysisService.inputData, this.settings);
        this.results = 
          {
            power: fanResults.power,
            powerCorrected: fanResults.powerCorrected
          };
      }
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  estimateFla() {
    if (this.flaDisabled == false) {
      let horsePower: number = this.fanShaftPower.ratedHP;
      let motorRPM: number = this.fanShaftPower.synchronousSpeed;
      let frequency: number = this.fanShaftPower.frequency;
      let efficiencyClass: number = this.fanShaftPower.efficiencyClass;
      let efficiency: number = 100;
      let motorVoltage: number = this.fanShaftPower.npv;
      let fla: number = this.psatService.estFanFLA(horsePower, motorRPM, frequency, efficiencyClass, efficiency, motorVoltage, this.settings);
      fla = Math.round(fla);
      this.shaftPowerForm.patchValue({
        fullLoadAmps: fla
      });
      this.save();
    }
  }

  checkFlaDisabled() {
    if (
      this.shaftPowerForm.controls.ratedHP.valid &&
      this.shaftPowerForm.controls.synchronousSpeed.valid &&
      this.shaftPowerForm.controls.frequency.valid &&
      this.shaftPowerForm.controls.efficiencyClass.valid &&
      this.shaftPowerForm.controls.npv.valid 
    ) {
      this.flaDisabled = false;
    } else {
      this.flaDisabled = true;
    }
  }

  setIsVfd() {
    this.shaftPowerForm.patchValue({
      efficiencyVFD: 100
    });
    this.save();
  }
}
