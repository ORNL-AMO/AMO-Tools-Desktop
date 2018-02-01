import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PreAssessment } from './pre-assessment';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { ConvertPhastService } from '../../../phast/convert-phast.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-pre-assessment',
  templateUrl: './pre-assessment.component.html',
  styleUrls: ['./pre-assessment.component.css'],
})
export class PreAssessmentComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  height: number;

  @ViewChild('container') container: ElementRef;

  preAssessments: Array<PreAssessment>;
  tabSelect: string = 'results';
  currentField: string;
  results: Array<any>;
  currentEnergySourceType: string = 'Fuel';
  currentAssessmentType: string = 'Metered';
  nameIndex: number = 1;
  assessmentGraphColors: Array<string>;
  showAdd: boolean = true;
  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService, private convertPhastService: ConvertPhastService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results) {
            this.settings = results[0];
            this.initAssessments();
          }
        })
    } else {
      this.initAssessments();
    }
  }

  ngAfterViewInit() {
    if (!this.height) {
      this.getHeight();
    }
  }

  getHeight() {
    setTimeout(() => {
      this.height = this.container.nativeElement.clientHeight;
    }, 100);
  }
  
  initAssessments() {
    this.assessmentGraphColors = graphColors.reverse();
    this.results = new Array<any>();
    this.preAssessments = new Array<PreAssessment>();
    this.addPreAssessment();
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setEnergySourceType(str: string) {
    if (str != this.currentEnergySourceType) {
      this.currentEnergySourceType = str;
      this.currentField = '';
    }
  }

  setAssessmentType(str: string) {
    if (str != this.currentAssessmentType) {
      this.currentAssessmentType = str;
      this.currentField = ''
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setUnitsOfMeasure(str: string) {
    if (this.settings.unitsOfMeasure != str) {
      this.convertData();
      this.settings.unitsOfMeasure = str;
    }
  }

  calculate() {
    this.results = new Array<any>();
    let i = this.preAssessments.length - 1;
    this.preAssessments.forEach(assessment => {
      if (assessment.type == 'Metered') {
        this.calculateMetered(assessment);
      } else if (assessment.type == 'Designed') {
        this.calculateDesigned(assessment);
      }
    })
    let sum = this.getSum(this.results);
    this.results.forEach(result => {
      result.percent = this.getResultPercent(result.value, sum);
    })
  }

  calculateMetered(assessment: PreAssessment) {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.meteredEnergyService.calcElectricityUsed(assessment.meteredEnergy.meteredEnergyElectricity);
      tmpResults = this.convertElectrotechResults(tmpResults);
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
  }

  calculateDesigned(assessment: PreAssessment) {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      tmpResults = tmpResults;
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergySteam(assessment.designedEnergy.designedEnergySteam);
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyElectricity(assessment.designedEnergy.designedEnergyElectricity);
      tmpResults = this.convertElectrotechResults(tmpResults);
      this.addResult(tmpResults, assessment.name, assessment.borderColor);
    }
  }

  convertElectrotechResults(val: number) {
    if (this.settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kWh').to('kJ');
    } else {
      val = this.convertUnitsService.value(val).from('kWh').to('Btu');
    }
    return val;
  }

  addResult(num: number, name: string, color: string) {
    if (isNaN(num) != true) {
      this.results.push({
        name: name,
        value: num,
        color: color
      })
    }
  }

  getSum(data: Array<any>): number {
    let sum = _.sumBy(data, 'value');
    return sum;
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    return percent;
  }

  addPreAssessment() {
    let tmpSettings: Settings = {
      unitsOfMeasure: this.settings.unitsOfMeasure,
      energySourceType: 'Fuel'
    }

    this.preAssessments.unshift({
      type: 'Metered',
      name: 'Furnace ' + this.nameIndex,
      settings: tmpSettings,
      collapsed: false,
      collapsedState: 'open',
      borderColor: this.assessmentGraphColors.pop()
    })
    this.nameIndex++;
    if (this.preAssessments.length >= 20) {
      this.showAdd = false;
    }
  }


  deletePreAssessment(assessment: PreAssessment, index: number) {
    this.assessmentGraphColors.push(assessment.borderColor);
    this.preAssessments.splice(index, 1);
    this.calculate();
  }


  collapsePreAssessment(assessment: PreAssessment) {
    assessment.collapsed = !assessment.collapsed;
    if (assessment.collapsed) {
      assessment.collapsedState = 'closed';
    } else {
      assessment.collapsedState = 'open';
    }
  }

  convertData() {
    this.preAssessments.forEach(assessment => {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let oldSettings: Settings = {
          unitsOfMeasure: 'Imperial'
        };
        if (assessment.type == 'Metered') {
          assessment.meteredEnergy = this.convertPhastService.convertMeteredEnergy(assessment.meteredEnergy, oldSettings, this.settings);
        } else if (assessment.type == 'Designed') {
          assessment.designedEnergy = this.convertPhastService.convertDesignedEnergy(assessment.designedEnergy, oldSettings, this.settings);
        }
      } else if (this.settings.unitsOfMeasure == 'Imperial') {
        let oldSettings: Settings = {
          unitsOfMeasure: 'Metric'
        };
        if (assessment.type == 'Metered') {
          assessment.meteredEnergy = this.convertPhastService.convertMeteredEnergy(assessment.meteredEnergy, oldSettings, this.settings);
        } else if (assessment.type == 'Designed') {
          assessment.designedEnergy = this.convertPhastService.convertDesignedEnergy(assessment.designedEnergy, oldSettings, this.settings);
        }
      }
    });
  }
}
