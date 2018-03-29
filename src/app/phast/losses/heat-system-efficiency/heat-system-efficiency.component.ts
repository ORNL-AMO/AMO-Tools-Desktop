import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PhastService } from '../../phast.service';
import { Losses, PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
@Component({
  selector: 'app-heat-system-efficiency',
  templateUrl: './heat-system-efficiency.component.html',
  styleUrls: ['./heat-system-efficiency.component.css']
})
export class HeatSystemEfficiencyComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  losses: Losses;
  @Input()
  isBaseline: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  baselineSelected: boolean;
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;

  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();

  firstChange: boolean = true;

  efficiencyForm: FormGroup;
  systemLosses: number = 0;
  grossHeat: number = 0;
  resultsUnit: string;
  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    this.efficiencyForm = this.initForm(this.phast.systemEfficiency);

    if (!this.baselineSelected) {
      this.disableForm();
    } else {
      this.enableForm();
    }
    this.calculate(true);

    if (this.inSetup && this.modExists) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  initForm(val?: number): FormGroup {
    if (val) {
      return this.formBuilder.group({
        efficiency: [val, Validators.required]
      })
    }
    return this.formBuilder.group({
      efficiency: [90, Validators.required]
    })
  }

  disableForm() {
    this.efficiencyForm.disable();
  }

  enableForm() {
    this.efficiencyForm.enable();
  }

  saveLosses() {
    this.phast.systemEfficiency = this.efficiencyForm.controls.efficiency.value;
    this.savedLoss.emit(true);
  }

  focusField(str: string) {
    this.fieldChange.emit(str);
  }

  startSavePolling() {
    this.saveLosses();
  }

  calculate(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    let additionalHeat = this.phastService.sumChargeMaterialExothermic(this.losses.chargeMaterials, this.settings);
    this.grossHeat = (this.phastService.sumHeatInput(this.losses, this.settings) / this.efficiencyForm.controls.efficiency.value) - additionalHeat;
    this.systemLosses = this.grossHeat * (1 - (this.efficiencyForm.controls.efficiency.value / 100));
  }

  compareEfficiency() {
    if (this.heatSystemEfficiencyCompareService.baseline && this.heatSystemEfficiencyCompareService.modification) {
      return this.heatSystemEfficiencyCompareService.compareEfficiency();
    } else {
      return false;
    }
  }
}
