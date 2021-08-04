import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CoolingLoss, CoolingLossOutput, CoolingLossResults } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService } from '../cooling-form.service';
import { CoolingService } from '../cooling.service';

@Component({
  selector: 'app-liquid-cooling-form',
  templateUrl: './liquid-cooling-form.component.html',
  styleUrls: ['./liquid-cooling-form.component.css']
})
export class LiquidCoolingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  index: number;
  @Input()
  selected: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  
  coolingForm: FormGroup;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSubscription: Subscription;
  lossResult: CoolingLossResults;

  idString: string;
  temperatureWarning: string = null;
  coolingMedium: string;

  constructor(private coolingFormService: CoolingFormService,
    private coolingService: CoolingService) { }

  ngOnInit(): void {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.index;
      let baselineData: Array<CoolingLoss> = this.coolingService.baselineData.getValue();
      this.coolingMedium = baselineData[this.index].coolingMedium;
    }
    else {
      this.idString = '_baseline_' + this.index;
    }

    this.initSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
    if (changes.index && !changes.index.firstChange) {
      let output: CoolingLossOutput = this.coolingService.output.getValue();
      this.setLossResult(output);
    }
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    this.outputSubscription.unsubscribe();
  }

  
  initSubscriptions() {
    this.resetDataSub = this.coolingService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.coolingService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.outputSubscription = this.coolingService.output.subscribe(output => {
      this.setLossResult(output);
    });
  }

  setLossResult(output: CoolingLossOutput) {
    if (this.isBaseline) {
      this.lossResult = output.baseline.losses[this.index];
    } else {
      this.lossResult = output.modification.losses[this.index];
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.coolingForm.disable();
    } else {
      this.coolingForm.enable();
    }
  }

  removeLoss() {
    this.coolingService.removeLoss(this.index);
  }


  initForm() {
    let updatedCoolingLoss: CoolingLoss;
    if (this.isBaseline) {
      let baselineData: Array<CoolingLoss> = this.coolingService.baselineData.getValue();
      updatedCoolingLoss = baselineData[this.index];
    } else {
      let modificationData: Array<CoolingLoss> = this.coolingService.modificationData.getValue();
      if (modificationData) {
        updatedCoolingLoss = modificationData[this.index];
      }
    }

    if (updatedCoolingLoss && updatedCoolingLoss.coolingMedium == 'Liquid') {
      if (updatedCoolingLoss.liquidCoolingLoss) {
        this.coolingForm = this.coolingFormService.initLiquidFormFromLoss(updatedCoolingLoss);
      } else {
        this.coolingForm = this.coolingFormService.initLiquidCoolingForm(this.settings);
      }
      
      this.calculate();
      this.setFormState();
    }
    
  }

  focusField(str: string) {
    this.coolingService.currentField.next(str);
  }

  calculate() {
    let currentCoolingLoss: CoolingLoss = this.coolingFormService.initLiquidLossFromForm(this.coolingForm);
    this.temperatureWarning = this.coolingFormService.checkInletTemp(currentCoolingLoss.liquidCoolingLoss);
    this.coolingService.updateDataArray(currentCoolingLoss, this.index, this.isBaseline);
  }

  roundVal(val: number, digits: number) {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }
}