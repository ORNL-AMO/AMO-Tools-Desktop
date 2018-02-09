import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PhastService } from '../../phast.service';
import { Losses, PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
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
  saveClicked: boolean;
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
  counter: any;

  systemLosses: number = 0;
  grossHeat: number = 0;
  resultsUnit: string;
  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService, private windowRefService: WindowRefService) { }

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
    this.setCompareVals();
    this.heatSystemEfficiencyCompareService.initCompareObjects();
    this.initDifferenceMonitor();

    if (this.inSetup && this.modExists) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
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

  ngOnDestroy() {
    if (this.isBaseline) {
      this.heatSystemEfficiencyCompareService.baseline = null;
    } else {
      this.heatSystemEfficiencyCompareService.modification = null;
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
    if (this.efficiencyForm.status == 'VALID') {
      this.phast.systemEfficiency = this.efficiencyForm.controls.efficiency.value;
      this.savedLoss.emit(true);
      this.setCompareVals();
    }
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

  setCompareVals() {
    if (this.isBaseline) {
      this.heatSystemEfficiencyCompareService.baseline = this.phast;
    } else {
      this.heatSystemEfficiencyCompareService.modification = this.phast;
    }
    if (this.heatSystemEfficiencyCompareService.differentObject && !this.isBaseline) {
      this.heatSystemEfficiencyCompareService.checkDifferent();
    }
  }

  initDifferenceMonitor() {
    if (this.heatSystemEfficiencyCompareService.baseline && this.heatSystemEfficiencyCompareService.modification) {
      if (this.heatSystemEfficiencyCompareService.differentObject) {
        let doc = this.windowRefService.getDoc();
        this.heatSystemEfficiencyCompareService.differentObject.efficiency.subscribe(val => {
          let efficiencyElements = doc.getElementsByName('efficiency');
          efficiencyElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

}
