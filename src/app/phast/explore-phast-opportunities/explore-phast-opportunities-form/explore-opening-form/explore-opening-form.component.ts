import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { OpeningLossesService } from '../../../losses/opening-losses/opening-losses.service';
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

  totalArea1: Array<number>;
  heightError1: Array<string>;
  lengthError1: Array<string>;
  thicknessError1: Array<string>;
  numOpeningsError1: Array<string>;

  totalArea2: Array<number>;
  heightError2: Array<string>;
  lengthError2: Array<string>;
  thicknessError2: Array<string>;
  numOpeningsError2: Array<string>;
  viewFactorError1: Array<string>;
  viewFactorError2: Array<string>;

  showViewFactor: Array<boolean>
  showSize: Array<boolean>;
  showOpening: boolean = false;
  constructor(private convertUnitsService: ConvertUnitsService, private openingLossesService: OpeningLossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.showViewFactor = new Array();
    this.showSize = new Array();
    this.totalArea1 = new Array<number>();
    this.heightError1 = new Array<string>();
    this.lengthError1 = new Array<string>();
    this.thicknessError1 = new Array<string>();
    this.numOpeningsError1 = new Array<string>();
    this.viewFactorError1 = new Array<string>();
    this.totalArea2 = new Array<number>();
    this.heightError2 = new Array<string>();
    this.lengthError2 = new Array<string>();
    this.thicknessError2 = new Array<string>();
    this.numOpeningsError2 = new Array<string>();
    this.viewFactorError2 = new Array<string>();
    let index: number = 0;
    this.phast.losses.openingLosses.forEach(loss => {
      let check: boolean = this.initSize(loss, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index]);
      if (!this.showOpening && check) {
        this.showOpening = check;
      }
      this.showSize.push(check);
      this.heightError1.push(null);
      this.lengthError1.push(null);
      this.thicknessError1.push(null);
      this.numOpeningsError1.push(null);
      this.totalArea1.push(0);
      this.heightError2.push(null);
      this.lengthError2.push(null);
      this.thicknessError2.push(null);
      this.numOpeningsError2.push(null);
      this.totalArea2.push(0);
      this.getArea(2, this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], index)
      this.getArea(1, loss, index)

      check = (loss.viewFactor == this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index].viewFactor);
      this.viewFactorError1.push(null);
      this.viewFactorError2.push(null);
      this.showViewFactor.push(!check);
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
      this.calculate();
    }
  }

  toggleSize(index: number, loss: OpeningLoss) {
    if (this.showSize[index] == false) {
      this.setToBaseline(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], loss);
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
        this.setToBaseline(this.phast.modifications[this.exploreModIndex].phast.losses.openingLosses[index], loss)
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
    this.checkHeight(num, loss, index);
    this.checkLength(num, loss, index);
    this.checkThickness(num, loss, index);
    this.checkNumOpenings(num, loss, index);
    let test = this.checkNoErrors(num, index);
    if (!test) {
      if (num == 1) {
        this.totalArea1[index] = 0;
      } else if (num == 2) {
        this.totalArea2[index] = 0;
      }
      return;
    }

    if (loss.openingType == 'Round') {
      if (loss.lengthOfOpening) {
        loss.heightOfOpening = 0;
        let radiusInches = loss.lengthOfOpening;
        //let radiusFeet = (radiusInches * .08333333) / 2;

        let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
        if (num == 1) {
          this.totalArea1[index] = Math.PI * Math.pow(radiusFeet, 2) * loss.numberOfOpenings;
        } else if (num == 2) {
          this.totalArea2[index] = Math.PI * Math.pow(radiusFeet, 2) * loss.numberOfOpenings;
        }
        this.calculate();
      } else {
        if (num == 1) {
          this.totalArea1[index] = 0;
        } else if (num == 2) {
          this.totalArea2[index] = 0;
        }
      }
    } else if (loss.openingType == 'Rectangular (Square)') {
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
        if (num == 1) {
          this.totalArea1[index] = lengthFeet * heightFeet * loss.numberOfOpenings;
        } else if (num == 2) {
          this.totalArea2[index] = lengthFeet * heightFeet * loss.numberOfOpenings;
        }
        this.calculate();
      } else {
        if (num == 1) {
          this.totalArea1[index] = 0;
        } else if (num == 2) {
          this.totalArea2[index] = 0;
        }
      }
    } else {
      if (num == 1) {
        this.totalArea1[index] = 0;
      } else if (num == 2) {
        this.totalArea2[index] = 0;
      }
    }
  }

  checkNoErrors(num: number, index: number): boolean {
    if (num == 1) {
      if (this.heightError1[index] == null || this.lengthError1[index] == null || this.thicknessError1[index] == null || this.numOpeningsError1[index] == null) {
        return true;
      } else {
        return false;
      }
    } else if (num == 2) {
      if (this.heightError2[index] == null || this.lengthError2[index] == null || this.thicknessError2[index] == null || this.numOpeningsError2[index] == null) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkHeight(num: number, loss: OpeningLoss, index: number) {
    if (loss.openingType == 'Rectangular (Square)') {
      if (num = 1) {
        this.heightError1[index] = (loss.heightOfOpening <= 0) ? "Opening Height must be greater than 0" : null;
      } else if (num = 2) {
        this.heightError2[index] = (loss.heightOfOpening <= 0) ? "Opening Height must be greater than 0" : null;
      }
    } else {
      if (num = 1) {
        this.heightError1[index] = null;
      } else if (num = 2) {
        this.heightError2[index] = null;
      }
    }
  }

  checkLength(num: number, loss: OpeningLoss, index: number) {
    if (loss.openingType == 'Round') {
      if (num = 1) {
        this.lengthError1[index] = (loss.lengthOfOpening < 0) ? "Opening Diameter must be greater than 0" : null;
      } else if (num = 2) {
        this.lengthError2[index] = (loss.lengthOfOpening < 0) ? "Opening Diameter must be greater than 0" : null;
      }
    } else if (loss.openingType == 'Rectangular (Square)') {
      if (num = 1) {
        this.lengthError1[index] = (loss.lengthOfOpening < 0) ? "Opening Length must be greater than 0" : null;
      } else if (num = 2) {
        this.lengthError2[index] = (loss.lengthOfOpening < 0) ? "Opening Length must be greater than 0" : null;
      }
    }
  }

  checkThickness(num: number, loss: OpeningLoss, index: number) {
    if (num = 1) {
      this.thicknessError1[index] = (loss.thickness < 0) ? "Furnace Wall Thickness must be greater than or equal to 0" : null;
    } else if (num = 2) {
      this.thicknessError2[index] = (loss.thickness < 0) ? "Furnace Wall Thickness must be greater than or equal to 0" : null;
    }
  }

  checkNumOpenings(num: number, loss: OpeningLoss, index: number) {
    if (num = 1) {
      this.numOpeningsError1[index] = (loss.numberOfOpenings < 0) ? "Number of Openings must be greater than 0" : null;
    } else if (num = 2) {
      this.numOpeningsError2[index] = (loss.numberOfOpenings < 0) ? "Number of Openings must be greater than 0" : null;
    }
  }

  checkViewFactor(num: number, loss: OpeningLoss, index: number) {
    let test = (loss.viewFactor < 0) ? "View Factor must be greater than 0" : null;
    if (num == 1) {
      this.viewFactorError2[index] = test;
    } else if (num == 2) {
      this.viewFactorError2[index] = test;
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

  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  calculateViewFactor(loss: OpeningLoss) {
    let openingLossform: FormGroup = this.openingLossesService.getFormFromLoss(loss);
    let vfInputs = this.openingLossesService.getViewFactorInput(openingLossform);
    let viewFactor = this.phastService.viewFactorCalculation(vfInputs, this.settings);
    loss.viewFactor = Number(viewFactor.toFixed(3));
  }
}
