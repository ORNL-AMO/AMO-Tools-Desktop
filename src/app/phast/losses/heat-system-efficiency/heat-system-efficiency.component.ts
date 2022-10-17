import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
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
  @Input()
  modificationIndex: number;

  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  efficiencyForm: UntypedFormGroup;
  systemLosses: number = 0;
  grossHeat: number = 0;
  resultsUnit: string;
  idString: string;
  constructor(private formBuilder: UntypedFormBuilder, private phastService: PhastService, private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification';
    }
    else {
      this.idString = '_baseline';
    }
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    this.efficiencyForm = this.initForm(this.phast.systemEfficiency);
    this.calculate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex) {
      if (!changes.modificationIndex.isFirstChange()) {
        this.efficiencyForm = this.initForm(this.phast.systemEfficiency);
      }
    }
  }

  initForm(val?: number): UntypedFormGroup {
    if (val) {
      return this.formBuilder.group({
        efficiency: [val, Validators.required]
      });
    }
    return this.formBuilder.group({
      efficiency: [90, Validators.required]
    });
  }

  saveLosses() {
    this.phast.systemEfficiency = this.efficiencyForm.controls.efficiency.value;
    this.savedLoss.emit(true);
  }

  focusField(str: string) {
    this.fieldChange.emit(str);
  }

  calculate() {
    this.saveLosses();
    let additionalHeat = this.phastService.sumChargeMaterialExothermic(this.losses.chargeMaterials, this.settings);
    this.grossHeat = ((this.phastService.sumHeatInput(this.losses, this.settings) / this.efficiencyForm.controls.efficiency.value) - additionalHeat) * 100;
    this.systemLosses = this.grossHeat * (1 - (this.efficiencyForm.controls.efficiency.value / 100));
  }

  compareEfficiency() {
    if (this.heatSystemEfficiencyCompareService.baseline && this.heatSystemEfficiencyCompareService.modification && !this.inSetup) {
      return this.heatSystemEfficiencyCompareService.compareEfficiency();
    } else {
      return false;
    }
  }
}
