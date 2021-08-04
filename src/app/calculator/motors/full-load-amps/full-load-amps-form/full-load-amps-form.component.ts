import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FullLoadAmpsService } from '../full-load-amps.service';
import { PsatService } from '../../../../psat/psat.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';
import { FanMotor } from '../../../../shared/models/fans';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
  selector: 'app-full-load-amps-form',
  templateUrl: './full-load-amps-form.component.html',
  styleUrls: ['./full-load-amps-form.component.css']
})
export class FullLoadAmpsFormComponent implements OnInit {
  @Input()
  settings: Settings;
  form: FormGroup;
  formWidth: number;
  idString: string;
  fullLoadAmps: number;

  motor: FanMotor;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  fullLoadAmpsResultSub: Subscription;

  frequencies: Array<number> = [
    50,
    60
  ];
  efficiencyClasses: Array<{ display: string, value: number }>;
  
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.efficiencyClasses = motorEfficiencyConstants;
    this.idString = 'fla_calc';
  
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.fullLoadAmpsService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.fullLoadAmpsService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.fullLoadAmpsResultSub = this.fullLoadAmpsService.fullLoadAmpsResult.subscribe(result => {
      this.fullLoadAmps = result;
    });
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let fullLoadAmpsInput: FanMotor = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    this.form = this.fullLoadAmpsService.getFormFromObj(fullLoadAmpsInput);
    this.calculate();
  }


  focusField(str: string) {
    this.fullLoadAmpsService.currentField.next(str);
  }

  calculate() {
    let updatedInput: FanMotor = this.fullLoadAmpsService.getObjFromForm(this.form);
    this.fullLoadAmpsService.fullLoadAmpsInputs.next(updatedInput);
  }

}
