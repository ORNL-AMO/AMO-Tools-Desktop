import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FixtureFormService } from '../../../../calculator/furnaces/fixture/fixture-form.service';

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
  showMaterial: Array<boolean>;
  materials: Array<SolidLoadChargeMaterial>;

  baselineWarnings: Array<{ specificHeatWarning: string, feedRateWarning: string }>;
  modificationWarnings: Array<{ specificHeatWarning: string, feedRateWarning: string }>;
  showInitialTemp: Array<boolean>;
  constructor(private suiteDbService: SuiteDbService, private convertUnitsService: ConvertUnitsService, private fixtureFormService: FixtureFormService) { }

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
    this.modificationWarnings = new Array<{ specificHeatWarning: string, feedRateWarning: string }>();
    this.baselineWarnings = new Array<{ specificHeatWarning: string, feedRateWarning: string }>();
    this.showMaterial = new Array<boolean>();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures = { hasOpportunity: false, display: 'Improve Materials Handling' };
    this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTemp = { hasOpportunity: false, display: 'Avoid Fixture Cooling' };

    let index: number = 0;
    this.phast.losses.fixtureLosses.forEach(loss => {
      let check: boolean = this.initFeedRate(loss.feedRate, this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures = { hasOpportunity: check, display: 'Improve Materials Handling' };
      }
      this.showFeedRate.push(check);
      let tmpWarnings: { specificHeatWarning: string, feedRateWarning: string } = this.fixtureFormService.checkWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.fixtureFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index]);
      this.modificationWarnings.push(tmpWarnings);
      check = (loss.materialName !== this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures = { hasOpportunity: check, display: 'Improve Materials Handling' };
      }
      this.showMaterial.push(check);
      index++;
    });
  }

  initFeedRate(rate1: number, rate2: number) {
    if (rate1 !== rate2) {
      return true;
    } else {
      return false;
    }
  }

  initTempData() {
    this.showInitialTemp = new Array<boolean>();
    let index: number = 0;
    this.phast.losses.fixtureLosses.forEach(loss => {
      let check = (loss.initialTemperature !== this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTemp.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTemp = { hasOpportunity: check, display: 'Avoid Fixture Cooling' };
      }
      this.showInitialTemp.push(check);
      index++;
    });
  }


  toggleFixtures() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowFixtures.hasOpportunity === false) {
      let index: number = 0;
      this.phast.losses.fixtureLosses.forEach(loss => {
        let baselineFeedRate: number = loss.feedRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName = loss.materialName;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].specificHeat = loss.specificHeat;
        this.checkModificationWarnings(index);
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleFeedRate(index: number, baselineFeedRate: number) {
    if (this.showFeedRate[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  toggleMaterial(index: number, materialName: number) {
    if (this.showMaterial[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].materialName = materialName;
      this.calculate();
    }
  }

  toggleAllTemp() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowAllTemp.hasOpportunity === false) {
      let index: number = 0;
      this.phast.losses.fixtureLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature = loss.initialTemperature;
        this.checkModificationWarnings(index);
        index++;
      });
      this.calculate();
    }
  }

  toggleInletTemp(index: number, baselineTemp: number) {
    if (this.showInitialTemp[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].initialTemperature = baselineTemp;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  checkModificationWarnings(index: number) {
    let tmpWarnings: { specificHeatWarning: string, feedRateWarning: string } = this.fixtureFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index]);
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkBaselineWarnings(index: number) {
    let tmpWarnings: { specificHeatWarning: string, feedRateWarning: string } = this.fixtureFormService.checkWarnings(this.phast.losses.fixtureLosses[index]);
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
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
    });
  }


  setSpecificHeat(loss: FixtureLoss) {
    let material: SolidLoadChargeMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(loss.materialName);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
      }
      loss.specificHeat = Number(material.specificHeatSolid.toFixed(3));
    }
    this.calculate();
  }


  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }
}
