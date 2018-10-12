import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { OpeningLossesService, OpeningLossWarnings } from '../../../losses/opening-losses/opening-losses.service';
import { PhastService } from '../../../phast.service';
import { LossTab } from '../../../tabs';

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
  showAllTimeOpen: boolean = false;
  showEmissivity: Array<boolean>;
  showViewFactor: Array<boolean>
  showSize: Array<boolean>;
  showAllEmissivity: boolean = false;
  showOpening: boolean = false;
  constructor(private convertUnitsService: ConvertUnitsService, private openingLossesService: OpeningLossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showAllEmissivity = false;
        this.showAllTimeOpen = false;
        this.showOpening = false;
        this.initData();
      }
    }
  }

  initData() {
    this.showViewFactor = new Array();
    this.showSize = new Array();
    this.showEmissivity = new Array<boolean>();
    this.showTimeOpen = new Array<boolean>();
    this.baselineWarnings = new Array<OpeningLossWarnings>();
    this.modificationWarnings = new Array<OpeningLossWarnings>();
    let index: number = 0;
    this.phast.losses.openingLosses.forEach(loss => {
      let check: boolean = this.initSize(loss, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
      if (!this.showOpening && check) {
        this.showOpening = check;
      }
      this.showSize.push(check);
      this.getArea(2, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], index)
      this.getArea(1, loss, index)

      check = (loss.viewFactor == this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].viewFactor);
      this.showViewFactor.push(!check);
      check = (loss.emissivity != this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity);
      if (!this.showAllEmissivity && check) {
        this.showAllEmissivity = check;
      }
      this.showEmissivity.push(check);
      check = (loss.percentTimeOpen != this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].percentTimeOpen);
      this.showTimeOpen.push(check);
      if (!this.showAllTimeOpen && check) {
        this.showAllTimeOpen = check;
      }

      let tmpWarnings: OpeningLossWarnings = this.openingLossesService.checkWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.openingLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
      this.modificationWarnings.push(tmpWarnings);
      index++;
    })
  }

  initSize(baselineLoss: OpeningLoss, modLoss: OpeningLoss) {
    if (baselineLoss.heightOfOpening != modLoss.heightOfOpening || baselineLoss.numberOfOpenings != modLoss.numberOfOpenings ||
      baselineLoss.lengthOfOpening != modLoss.lengthOfOpening || baselineLoss.thickness != modLoss.thickness) {
      return true
    } else {
      return false;
    }
  }

  toggleViewFactor(index: number, loss: OpeningLoss) {
    if (this.showViewFactor[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].viewFactor = loss.viewFactor;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  toggleSize(index: number, loss: OpeningLoss) {
    if (this.showSize[index] == false) {
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
    if (this.showOpening == false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.setToBaseline(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], loss);
        this.checkModificationWarnings(index);
        index++;
      })
    }
  }

  getArea(num: number, loss: OpeningLoss, index: number) {
    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure == 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }
    if (num == 1) {
      this.checkBaselineWarnings(index);
    } else {
      this.checkModificationWarnings(index);
    }

    if (loss.openingType == 'Round') {
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
    } else if (loss.openingType == 'Rectangular (or Square)') {
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
    if (this.showAllEmissivity == false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity = loss.emissivity;
        this.showEmissivity[index] = false;
        this.checkModificationWarnings(index);
        index++;
        this.calculate();
      })
    }
  }

  toggleEmissivity(index: number, loss: OpeningLoss) {
    if (this.showEmissivity[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].emissivity = loss.emissivity;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  checkBaselineWarnings(index: number) {
    let tmpWarnings: OpeningLossWarnings = this.openingLossesService.checkWarnings(this.phast.losses.openingLosses[index]);
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkModificationWarnings(index: number) {
    let tmpWarnings: OpeningLossWarnings = this.openingLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  toggleAllTimeOpen() {
    if (this.showAllTimeOpen == false) {
      let index = 0;
      this.phast.losses.openingLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].percentTimeOpen = loss.percentTimeOpen;
        this.showTimeOpen[index] = false;
        this.checkModificationWarnings(index);
        index++;
        this.calculate();
      })
    }
  }

  toggleTimeOpen(index: number, loss: OpeningLoss) {
    if (this.showTimeOpen[index] == false) {
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
    })
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  calculateViewFactor(loss: OpeningLoss) {
    let openingLossform: FormGroup = this.openingLossesService.getFormFromLoss(loss);
    let vfInputs = this.openingLossesService.getViewFactorInput(openingLossform);
    let viewFactor = this.phastService.viewFactorCalculation(vfInputs, this.settings);
    loss.viewFactor = Number(viewFactor.toFixed(3));
    this.calculate();
  }
}
