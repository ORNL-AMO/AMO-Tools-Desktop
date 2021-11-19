import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { PhastService } from '../../../phast.service';
import { LossTab } from '../../../tabs';
import { OpeningFormService, OpeningLossWarnings } from '../../../../calculator/furnaces/opening/opening-form.service';
import { OpeningService } from '../../../../calculator/furnaces/opening/opening.service';

@Component({
  selector: 'app-explore-opening-form',
  templateUrl: './explore-opening-form.component.html',
  styleUrls: ['./explore-opening-form.component.css']
})
export class ExploreOpeningFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();

  baselineWarnings: Array<OpeningLossWarnings>;
  modificationWarnings: Array<OpeningLossWarnings>;

  showTimeOpen: Array<boolean>;
  showEmissivity: Array<boolean>;
  showViewFactor: Array<boolean>;
  showSize: Array<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService,
    private openingLossesService: OpeningService,
    private openingFormService: OpeningFormService,
    private phastService: PhastService) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }

  initData() {
    this.initWarnings();
    this.showViewFactor = new Array();
    this.showSize = new Array();
    this.showEmissivity = new Array<boolean>();
    this.showTimeOpen = new Array<boolean>();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTimeOpen = { hasOpportunity: false, display: 'Minimize the Time Furnace Doors are Open' };
    this.phast.modifications[this.exploreModIndex].exploreOppsShowAllEmissivity = { hasOpportunity: false, display: 'Install Curtains or Radiation Shields to Reduce Opening Losses' };
    this.phast.modifications[this.exploreModIndex].exploreOppsShowOpening = { hasOpportunity: false, display: 'Minimize Opening Size or Install Tunnel-like Extensions' };

    let index: number = 0;
    this.phast.losses.openingLosses.forEach(loss => {
      let check: boolean = this.initSize(loss, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowOpening.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowOpening = { hasOpportunity: check, display: 'Minimize Opening Size or Install Tunnel-like Extensions' };
      }
      this.showSize.push(check);
      this.getArea(2, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], index);
      this.getArea(1, loss, index);

      check = (loss.viewFactor === this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].viewFactor);
      this.showViewFactor.push(!check);
      check = (loss.emissivity !== this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowAllEmissivity.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowAllEmissivity = { hasOpportunity: check, display: 'Install Curtains or Radiation Shields to Reduce Opening Losses' };
      }
      this.showEmissivity.push(check);
      check = (loss.percentTimeOpen !== this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].percentTimeOpen);
      this.showTimeOpen.push(check);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTimeOpen.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTimeOpen = { hasOpportunity: check, display: 'Minimize the Time Furnace Doors are Open' };
      }

      let tmpWarnings: OpeningLossWarnings = this.openingFormService.checkWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.openingFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
      this.modificationWarnings.push(tmpWarnings);
      index++;
    });
  }

  initSize(baselineLoss: OpeningLoss, modLoss: OpeningLoss) {
    if (baselineLoss.heightOfOpening !== modLoss.heightOfOpening || baselineLoss.numberOfOpenings !== modLoss.numberOfOpenings ||
      baselineLoss.lengthOfOpening !== modLoss.lengthOfOpening || baselineLoss.thickness !== modLoss.thickness) {
      return true;
    } else {
      return false;
    }
  }

  toggleViewFactor(index: number, loss: OpeningLoss) {
    if (this.showViewFactor[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].viewFactor = loss.viewFactor;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  toggleSize(index: number, loss: OpeningLoss) {
    if (this.showSize[index] === false) {
      this.setToBaseline(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], loss);
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  setToBaseline(mod: OpeningLoss, baseline: OpeningLoss) {
    mod.heightOfOpening = baseline.heightOfOpening;
    mod.numberOfOpenings = baseline.numberOfOpenings;
    mod.thickness = baseline.thickness;
    mod.lengthOfOpening = baseline.lengthOfOpening;
  }

  toggleOpening() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowOpening.hasOpportunity === false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.setToBaseline(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], loss);
        this.checkModificationWarnings(index);
        index++;
      });
    }
  }

  getArea(num: number, loss: OpeningLoss, index: number) {
    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure === 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }
    if (num === 1) {
      this.checkBaselineWarnings(index);
    } else {
      this.checkModificationWarnings(index);
    }

    if (loss.openingType === 'Round') {
      if (loss.lengthOfOpening) {
        loss.heightOfOpening = 0;
        let radiusInches = loss.lengthOfOpening;
        //let radiusFeet = (radiusInches * .08333333) / 2;
        let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
        loss.openingTotalArea = Math.PI * Math.pow(radiusFeet, 2) * loss.numberOfOpenings;
        this.calculate();
      } else {
        loss.openingTotalArea = 0;
      }
    } else if (loss.openingType === 'Rectangular (or Square)') {
      if (loss.lengthOfOpening && loss.heightOfOpening) {
        let lengthInches = loss.lengthOfOpening;
        let heightInches = loss.heightOfOpening;
        let lengthFeet = 0;
        let heightFeet = 0;
        if (lengthInches) {
          lengthFeet = this.convertUnitsService.value(lengthInches).from(smallUnit).to(largeUnit);
        }
        if (heightInches) {
          heightFeet = this.convertUnitsService.value(heightInches).from(smallUnit).to(largeUnit);
        }
        loss.openingTotalArea = lengthFeet * heightFeet * loss.numberOfOpenings;
        this.calculate();
      } else {
        loss.openingTotalArea = 0;
      }
    } else {
      loss.openingTotalArea = 0;
    }
  }

  toggleAllEmissivity() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowAllEmissivity.hasOpportunity === false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity = loss.emissivity;
        this.showEmissivity[index] = false;
        this.checkModificationWarnings(index);
        index++;
        this.calculate();
      });
    }
  }

  toggleEmissivity(index: number, loss: OpeningLoss) {
    if (this.showEmissivity[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity = loss.emissivity;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  checkBaselineWarnings(index: number) {
    let calculatedViewFactor = this.calculateViewFactor(this.phast.losses.openingLosses[index]);
    let tmpWarnings: OpeningLossWarnings = this.openingFormService.checkWarnings(this.phast.losses.openingLosses[index], calculatedViewFactor);
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkModificationWarnings(index: number) {
    let calculatedViewFactor = this.calculateViewFactor(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
    let tmpWarnings: OpeningLossWarnings = this.openingFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], calculatedViewFactor);
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  initWarnings() {
    this.baselineWarnings = new Array<OpeningLossWarnings>(
      {
        temperatureWarning: null,
        emissivityWarning: null,
        timeOpenWarning: null,
        numOpeningsWarning: null,
        thicknessWarning: null,
        lengthWarning: null,
        heightWarning: null,
        viewFactorWarning: null,
        calculateVFWarning: null,
      }
    );
    this.modificationWarnings = new Array<OpeningLossWarnings>(
      {
        temperatureWarning: null,
        emissivityWarning: null,
        timeOpenWarning: null,
        numOpeningsWarning: null,
        thicknessWarning: null,
        lengthWarning: null,
        heightWarning: null,
        viewFactorWarning: null,
        calculateVFWarning: null
      }
    );
  }

  toggleAllTimeOpen() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTimeOpen.hasOpportunity === false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].percentTimeOpen = loss.percentTimeOpen;
        this.showTimeOpen[index] = false;
        this.checkModificationWarnings(index);
        index++;
        this.calculate();
      });
    }
  }

  toggleTimeOpen(index: number, loss: OpeningLoss) {
    if (this.showTimeOpen[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].percentTimeOpen = loss.percentTimeOpen;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }


  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Opening',
      step: 6,
      next: 7,
      back: 5,
      componentStr: 'opening-losses',
      showAdd: true
    });
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  calculateViewFactor(loss: OpeningLoss) {
    let openingLossform: FormGroup = this.openingFormService.getFormFromLoss(loss);
    let vfInputs = this.openingLossesService.getViewFactorInput(openingLossform);
    let viewFactor = this.phastService.viewFactorCalculation(vfInputs, this.settings);
    viewFactor = Number(viewFactor.toFixed(3));
    return viewFactor;
  }

  setViewFactor(loss: OpeningLoss, index: number) {
    loss.viewFactor = this.calculateViewFactor(loss);
    this.checkBaselineWarnings(index);
    this.checkModificationWarnings(index);
  }
}
