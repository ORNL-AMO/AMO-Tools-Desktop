import { Component, OnInit, Input } from '@angular/core';
import { FanShaftPowerFormService } from './fan-shaft-power-form.service';
import { PsatService } from '../../../../../psat/psat.service';
import { FormGroup } from '@angular/forms';
import { FanShaftPower } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FanAnalysisService } from '../../fan-analysis.service';

@Component({
  selector: 'app-fan-shaft-power-form',
  templateUrl: './fan-shaft-power-form.component.html',
  styleUrls: ['./fan-shaft-power-form.component.css']
})
export class FanShaftPowerFormComponent implements OnInit {
  @Input()
  settings: Settings;

  shaftPowerForm: FormGroup;
  driveTypes: Array<{ name: string, efficiency: number }> = [
    { name: 'Direct Drive', efficiency: 100 },
    { name: 'V-Belt Drive', efficiency: 93 },
    { name: 'Notched V-Belt Drive', efficiency: 95 },
    { name: 'Synchronous Belt Drive', efficiency: 98 }
  ];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    'Premium'
  ];

  horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  //todo: implement logic for premium
  horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  fanShaftPower: FanShaftPower;
  constructor(private fanShaftPowerFormService: FanShaftPowerFormService, private psatService: PsatService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.shaftPowerForm = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower);
    this.fanShaftPower = this.fanAnalysisService.inputData.FanShaftPower;
  }

  calcAverageAmps() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower);
    let total = this.fanAnalysisService.inputData.FanShaftPower.phase1.amps + this.fanAnalysisService.inputData.FanShaftPower.phase2.amps + this.fanAnalysisService.inputData.FanShaftPower.phase3.amps;
    this.fanAnalysisService.inputData.FanShaftPower.amps = total / 3;
    this.calcMotorShaftPower();
  }

  calcAverageVoltage() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower);
    let total = this.fanAnalysisService.inputData.FanShaftPower.phase1.voltage + this.fanAnalysisService.inputData.FanShaftPower.phase2.voltage + this.fanAnalysisService.inputData.FanShaftPower.phase3.voltage;
    this.fanAnalysisService.inputData.FanShaftPower.voltage = total / 3;
    this.calcMotorShaftPower();
  }

  calcMotorShaftPower() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower);
    let tmpVal = this.fanAnalysisService.inputData.FanShaftPower.voltage * this.fanAnalysisService.inputData.FanShaftPower.amps * Math.sqrt(3) * (this.fanAnalysisService.inputData.FanShaftPower.powerFactorAtLoad / 745);
    this.shaftPowerForm.patchValue({
      motorShaftPower: tmpVal
    });
    this.save();
  }


  setBeltEfficiency() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower);
    let tmpEff: { name: string, efficiency: number } = this.driveTypes.find((type) => { return type.name === this.fanAnalysisService.inputData.FanShaftPower.driveType; });
    this.shaftPowerForm.patchValue({
      efficiencyBelt: tmpEff.efficiency
    });
    this.save();
  }

  save() {
    this.fanAnalysisService.inputData.FanShaftPower = this.fanShaftPowerFormService.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanAnalysisService.inputData.FanShaftPower);
    this.fanShaftPower = this.fanAnalysisService.inputData.FanShaftPower;
    console.log(this.fanShaftPower);
    this.fanAnalysisService.getResults.next(true);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  estimateFla() {
    this.shaftPowerForm = this.psatService.setFormFullLoadAmps(this.shaftPowerForm, this.settings);
    this.save();
  }

  setIsVfd() {
    this.shaftPowerForm.patchValue({
      efficiencyVFD: 100
    });
    this.save();
  }
}
