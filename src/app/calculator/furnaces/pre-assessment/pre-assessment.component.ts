import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PreAssessment } from './pre-assessment';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-pre-assessment',
  templateUrl: './pre-assessment.component.html',
  styleUrls: ['./pre-assessment.component.css'],
})
export class PreAssessmentComponent implements OnInit {

  preAssessments: Array<PreAssessment>;
  tabSelect: string = 'results';
  currentField: string;
  unitsOfMeasure: string = 'Imperial';
  results: Array<any>;
  settings: Settings;

  constructor(private meteredEnergyService: MeteredEnergyService, private designedEnergyService: DesignedEnergyService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.results = new Array<any>();
    this.preAssessments = new Array<PreAssessment>();
    this.addPreAssessment();
    this.settings = {
      unitsOfMeasure: 'Metric'
    }
  }
  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.results = new Array<any>();
    let i = this.preAssessments.length - 1;
    for (i; i >= 0; i--) {
      let assessment = this.preAssessments[i];
      if (assessment.type == 'Metered') {
        this.calculateMetered(assessment);
      } else if (assessment.type == 'Designed') {
        this.calculateDesigned(assessment);
      }
    }
    let sum = this.getSum(this.results);
    this.results.forEach(result => {
      result.percent = this.getResultPercent(result.value, sum);
    })
  }

  calculateMetered(assessment: PreAssessment) {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.meteredEnergyService.calcFuelUsed(assessment.meteredEnergy.meteredEnergyFuel);
      this.addResult(tmpResults, assessment.name);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.meteredEnergyService.calcSteamEnergyUsed(assessment.meteredEnergy.meteredEnergySteam);
      this.addResult(tmpResults, assessment.name);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.meteredEnergyService.calcElectricityUsed(assessment.meteredEnergy.meteredEnergyElectricity);
      this.addResult(tmpResults, assessment.name);
    }
  }

  calculateDesigned(assessment: PreAssessment) {
    if (assessment.settings.energySourceType == 'Fuel') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyFuel(assessment.designedEnergy.designedEnergyFuel);
      this.addResult(tmpResults, assessment.name);
    } else if (assessment.settings.energySourceType == 'Steam') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergySteam(assessment.designedEnergy.designedEnergySteam);
      this.addResult(tmpResults, assessment.name);
    }
    else if (assessment.settings.energySourceType == 'Electricity') {
      let tmpResults = this.designedEnergyService.sumDesignedEnergyElectricity(assessment.designedEnergy.designedEnergyElectricity);
      tmpResults = this.convertElectrotech(tmpResults);
      this.addResult(tmpResults, assessment.name);
    }
  }

  convertElectrotech(val: number){
    if(this.settings.unitsOfMeasure == 'Metric'){
      val = this.convertUnitsService.value(val).from('kWh').to('kJ');
    }else{
      val = this.convertUnitsService.value(val).from('kWh').to('Btu');
    }
    return val;
  }

  addResult(num: number, name: string) {
    if (isNaN(num) != true) {
      this.results.push({
        name: name,
        value: num
      })
    }
  }

  getSum(data: Array<any>): number{
    let sum = _.sumBy(data, 'value');
    return sum;
  }

  getResultPercent(value: number, sum: number): number{
    let percent = (value/sum)*100;
    return percent;
  }

  addPreAssessment() {
    let tmpSettings: Settings = {
      unitsOfMeasure: this.unitsOfMeasure,
      energySourceType: 'Fuel'
    }

    let nameIndex = this.preAssessments.length + 1;

    this.preAssessments.unshift({
      type: 'Metered',
      name: 'Furnace ' + nameIndex,
      settings: tmpSettings,
      collapsed: false,
      collapsedState: 'open'
    })
  }

  deletePreAssessment(index: number) {
    this.preAssessments.splice(index, 1);
    this.calculate();
  }


  collapsePreAssessment(index: number) {
    this.preAssessments[index].collapsed = !this.preAssessments[index].collapsed;
    if (this.preAssessments[index].collapsed) {
      this.preAssessments[index].collapsedState = 'closed';
    } else {
      this.preAssessments[index].collapsedState = 'open';
    }
  }
}
