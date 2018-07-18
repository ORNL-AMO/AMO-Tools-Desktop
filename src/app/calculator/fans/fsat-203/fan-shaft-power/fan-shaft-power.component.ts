import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FanShaftPower } from '../../../../shared/models/fans';
import { Fsat203Service } from '../fsat-203.service';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fan-shaft-power',
  templateUrl: './fan-shaft-power.component.html',
  styleUrls: ['./fan-shaft-power.component.css']
})
export class FanShaftPowerComponent implements OnInit {
  @Input()
  fanShaftPower: FanShaftPower;
  @Input()
  shaftPowerDone: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<FanShaftPower>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();


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

  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings.fanPowerMeasurement) {
      this.settings.fanPowerMeasurement = 'hp';
    }
    this.shaftPowerForm = this.fsat203Service.getShaftPowerFormFromObj(this.fanShaftPower);
  }

  calcAverageAmps() {
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    let total = this.fanShaftPower.phase1.amps + this.fanShaftPower.phase2.amps + this.fanShaftPower.phase3.amps;
    this.fanShaftPower.amps = total / 3;
    this.calcMotorShaftPower();
  }

  calcAverageVoltage() {
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    let total = this.fanShaftPower.phase1.voltage + this.fanShaftPower.phase2.voltage + this.fanShaftPower.phase3.voltage;
    this.fanShaftPower.voltage = total / 3;
    this.calcMotorShaftPower();
  }

  calcMotorShaftPower() {
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    let tmpVal = this.fanShaftPower.voltage * this.fanShaftPower.amps * Math.sqrt(3) * this.fanShaftPower.powerFactorAtLoad;
    tmpVal = this.convertUnitsService.value(tmpVal).from('kW').to('hp');
    this.shaftPowerForm.patchValue({
      motorShaftPower: tmpVal
    })
    this.save();
  }


  setBeltEfficiency() {
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    let tmpEff: { name: string, efficiency: number } = this.driveTypes.find((type) => { return type.name == this.fanShaftPower.driveType });
    this.shaftPowerForm.patchValue({
      efficiencyBelt: tmpEff.efficiency
    })
    this.save();
  }

  save() {
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    this.emitSave.emit(this.fanShaftPower);
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  estimateFla() {
    let tmpObj: FanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    let tmpEfficiency: number = this.psatService.getEfficiencyFromForm(this.shaftPowerForm);
    let estFla = this.psatService.estFLA(tmpObj.ratedHP, tmpObj.synchronousSpeed, tmpObj.frequency, tmpObj.efficiencyClass, tmpEfficiency, tmpObj.npv, this.settings);
    this.shaftPowerForm.patchValue({
      fla: estFla
    })
    this.save();
  }
}