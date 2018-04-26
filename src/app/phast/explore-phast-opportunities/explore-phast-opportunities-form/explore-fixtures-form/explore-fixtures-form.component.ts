import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-explore-fixtures-form',
  templateUrl: './explore-fixtures-form.component.html',
  styleUrls: ['./explore-fixtures-form.component.css']
})
export class ExploreFixturesFormComponent implements OnInit {
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
  showFeedRate: Array<boolean>;
  showFixtures: boolean = false;
  feedRateError1: Array<string>;
  feedRateError2: Array<string>;

  showMaterial: Array<boolean>;
  materials: Array<SolidLoadChargeMaterial>;

  tempError1: Array<string>;
  tempError2: Array<string>;
  showAllTemp: boolean = false;
  showInitialTemp: Array<boolean>;
  constructor(private suiteDbService: SuiteDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
    this.initData();
    this.initTempData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
        this.initTempData();
      }
    }
  }

  initData() {
    this.showFeedRate = new Array();
    this.feedRateError1 = new Array<string>();
    this.feedRateError2 = new Array<string>();
    this.showMaterial = new Array<boolean>();
    let index: number = 0;
    this.phast.losses.fixtureLosses.forEach(loss => {
      let check: boolean = this.initFeedRate(loss.feedRate, this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate);
      if (!this.showFixtures && check) {
        this.showFixtures = check;
      }
      this.showFeedRate.push(check);
      this.feedRateError1.push(null);
      this.feedRateError2.push(null);

      check = (loss.materialName != this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName)
      if (!this.showFixtures && check) {
        this.showFixtures = check;
      }
      this.showMaterial.push(check);
      index++;
    })
  }

  initFeedRate(rate1: number, rate2: number) {
    if (rate1 != rate2) {
      return true;
    } else {
      return false;
    }
  }

  initTempData() {
    this.showInitialTemp = new Array<boolean>();
    this.tempError1 = new Array<string>();
    this.tempError2 = new Array<string>();

    let index: number = 0;
    this.phast.losses.fixtureLosses.forEach(loss => {
      let check = (loss.initialTemperature != this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature)
      if (!this.showAllTemp && check) {
        this.showAllTemp = check;
      }
      this.showInitialTemp.push(check);
      index++;
    })
  }


  toggleFixtures() {
    if (this.showFixtures == false) {
      let index: number = 0;
      this.phast.losses.fixtureLosses.forEach(loss => {
        let baselineFeedRate: number = loss.feedRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName = loss.materialName;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].specificHeat = loss.specificHeat;
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleFeedRate(index: number, baselineFeedRate: number) {
    if (this.showFeedRate[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
      this.calculate();
    }
  }

  toggleMaterial(index: number, materialName: number) {
    if (this.showMaterial[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName = materialName;
      this.calculate();
    }
  }

  toggleAllTemp() {
    if (this.showAllTemp == false) {
      let index: number = 0;
      this.phast.losses.fixtureLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature = loss.initialTemperature;
        index++;
      })
      this.calculate();
    }
  }

  toggleInletTemp(index: number, baselineTemp: number){
    if(this.showInitialTemp[index]== false){
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature = baselineTemp;
      this.calculate();
    }
  }



  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Fixtures, Trays, etc.',
      step: 2,
      next: 3,
      back: 1,
      componentStr: 'fixture-losses',
      showAdd: true
    })
  }

  checkFeedRate(num: number, feedRate: number, index: number) {
    if (feedRate < 0) {
      if (num == 1) {
        this.feedRateError1[index] = 'Fixture Weight feed rate must be greater than 0';
      } else if (num == 2) {
        this.feedRateError2[index] = 'Fixture Weight feed rate must be greater than 0';
      }
    } else {
      if (num == 1) {
        this.feedRateError1[index] = null;
      } else if (num == 2) {
        this.feedRateError2[index] = null;
      }
    }
  }

  setSpecificHeat(loss: FixtureLoss) {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(loss.materialName)
    if (this.settings.unitsOfMeasure == 'Metric') {
      material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
    }
    loss.specificHeat = Number(material.specificHeatSolid.toFixed(3));
    this.calculate();
  }


  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
