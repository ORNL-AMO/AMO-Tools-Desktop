import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WasteWaterService } from '../waste-water/waste-water.service';
import { AllWasteWaterResultsData, EffluentEnergyData, EffluentEnergyResults, NutrientRemovalResults, ReportItem, WasteWaterCompare, WasteWaterResultsData } from './report-rollup-models';
import * as _ from 'lodash';
import { WasteWaterData, WasteWaterResults } from '../shared/models/waste-water';
@Injectable()
export class WasteWaterReportRollupService {

  wasteWaterAssessments: BehaviorSubject<Array<ReportItem>>;
  selectedWasteWater: BehaviorSubject<Array<WasteWaterCompare>>;
  selectedWasteWaterResults: Array<WasteWaterResultsData>;
  allWasteWaterResults: Array<AllWasteWaterResultsData>;
  nutrientRemovalResults: Array<NutrientRemovalResults>;
  effluentEnergyResults: Array<EffluentEnergyResults>;

  constructor(
    private wasteWaterService: WasteWaterService) { }

  initSummary() {
    this.wasteWaterAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.selectedWasteWater = new BehaviorSubject<Array<WasteWaterCompare>>(new Array<WasteWaterCompare>());
    this.selectedWasteWaterResults = new Array<WasteWaterResultsData>();
    this.allWasteWaterResults = new Array<AllWasteWaterResultsData>();
  }

  //WASTE WATER
  initWasteWaterCompare() {
    let tmpResults: Array<WasteWaterCompare> = new Array<WasteWaterCompare>();
    this.allWasteWaterResults.forEach(result => {
      let minCost = _.minBy(result.modificationResults, (result) => { return result.AeCost; });
      let modIndex;
      if (minCost != undefined) {
        modIndex = _.findIndex(result.modificationResults, (result) => { return result.AeCost == minCost.AeCost });
      }
      let wasteWaterAssessments: Array<ReportItem> = this.wasteWaterAssessments.value;
      let assessmentIndex = _.findIndex(wasteWaterAssessments, (val) => { return val.assessment.id === result.assessmentId; });
      let item = wasteWaterAssessments[assessmentIndex];
      if (result.isBaseline || modIndex == undefined || modIndex == -1) {
        tmpResults.push({ baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.baselineData, assessmentId: result.assessmentId, selectedIndex: -1, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      } else {
        tmpResults.push({ baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.modifications[modIndex], assessmentId: result.assessmentId, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
      }
    });
    this.selectedWasteWater.next(tmpResults);
  }

  updateSelectedWasteWater(item: ReportItem, modIndex: number) {
    let tmpSelected = this.selectedWasteWater.value;
    if (modIndex !== -1) {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.modifications[modIndex], assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    } else {
      let selectedIndex = _.findIndex(tmpSelected, { assessmentId: item.assessment.id });
      tmpSelected.splice(selectedIndex, 1, { baseline: item.assessment.wasteWater.baselineData, modification: item.assessment.wasteWater.baselineData, assessmentId: item.assessment.id, selectedIndex: modIndex, name: item.assessment.name, assessment: item.assessment, settings: item.settings });
    }
    this.selectedWasteWater.next(tmpSelected);
  }

  setAllWasteWaterResults(wasteWaterArr: Array<ReportItem>) {
    this.allWasteWaterResults = new Array<AllWasteWaterResultsData>();
    wasteWaterArr.forEach(val => {
      if (val.assessment.wasteWater.setupDone) {
        //get results
        val.assessment.wasteWater.baselineData.outputs = this.wasteWaterService.calculateResults(val.assessment.wasteWater.baselineData.activatedSludgeData, val.assessment.wasteWater.baselineData.aeratorPerformanceData, val.assessment.wasteWater.systemBasics, val.settings);
        let baselineResults: WasteWaterResults = val.assessment.wasteWater.baselineData.outputs;
        if (val.assessment.wasteWater.modifications) {
          if (val.assessment.wasteWater.modifications.length !== 0) {
            let modResultsArr = new Array<WasteWaterResults>();
            val.assessment.wasteWater.modifications.forEach(mod => {
              mod.outputs = this.wasteWaterService.calculateResults(mod.activatedSludgeData, mod.aeratorPerformanceData, val.assessment.wasteWater.systemBasics, val.settings, baselineResults);
              let tmpResults: WasteWaterResults = mod.outputs;
              modResultsArr.push(tmpResults);
            });
            this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id });
          } else {
            let modResultsArr = new Array<WasteWaterResults>();
            modResultsArr.push(baselineResults);
            this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
          }
        } else {
          let modResultsArr = new Array<WasteWaterResults>();
          modResultsArr.push(baselineResults);
          this.allWasteWaterResults.push({ baselineResults: baselineResults, modificationResults: modResultsArr, assessmentId: val.assessment.id, isBaseline: true });
        }
      }
    });
  }

  setWasteWaterResultsFromSelected(selectedWasteWater: Array<WasteWaterCompare>) {
    this.selectedWasteWaterResults = new Array<WasteWaterResultsData>();
    this.nutrientRemovalResults = new Array<NutrientRemovalResults>();
    this.effluentEnergyResults = new Array<EffluentEnergyResults>();

    selectedWasteWater.forEach((wwc: WasteWaterCompare) => {
      let baselineResults: WasteWaterResults = wwc.baseline.outputs;
      let modificationResults: WasteWaterResults = wwc.modification.outputs;
      this.selectedWasteWaterResults.push({ 
        baselineResults: baselineResults, 
        modificationResults: modificationResults, 
        assessmentId: wwc.assessmentId, 
        name: wwc.name, 
        modName: wwc.modification.name, 
        baseline: wwc.baseline, 
        modification: wwc.modification, 
        settings: wwc.settings 
      });

      this.nutrientRemovalResults.push(this.getNutrientRemovalResults(wwc)); 

      let effluentEnergyResults: EffluentEnergyResults = {
        baseline: this.getEffluentEnergyResults(wwc.name, wwc.assessment.wasteWater.systemBasics.operatingMonths, wwc.baseline),
        modification: this.getEffluentEnergyResults(wwc.name, wwc.assessment.wasteWater.systemBasics.operatingMonths, wwc.modification),
        // energyUnit: 
      };
      this.effluentEnergyResults.push(effluentEnergyResults); 
    });
  }

  getNutrientRemovalResults(wwc: WasteWaterCompare): NutrientRemovalResults {
    let results: NutrientRemovalResults = {
      assessmentName: wwc.name,
      baselineName: wwc.baseline.name,
      modificationName: wwc.modification.name,
      baselineTSSRemoval: 0,
      baselineNRemoval: 0,
      baselineBODRemoval: 0,
      modificationTSSRemoval: 0,
      modificationNRemoval: 0,
      modificationBODRemoval: 0
    };

    results.baselineTSSRemoval = (1 - (wwc.baseline.activatedSludgeData.EffluentTSS / wwc.baseline.activatedSludgeData.InfluentTSS)) * 100; 
    results.modificationTSSRemoval = (1 - (wwc.modification.activatedSludgeData.EffluentTSS / wwc.modification.activatedSludgeData.InfluentTSS)) * 100; 
    results.baselineBODRemoval = (1 - (wwc.baseline.outputs.EffluentCBOD5 / wwc.baseline.activatedSludgeData.So)) * 100; 
    results.modificationBODRemoval = (1 - (wwc.modification.outputs.EffluentCBOD5 / wwc.modification.activatedSludgeData.So)) * 100;
    
    return results;
  } 

  getEffluentEnergyResults(assessmentName: string, operatingMonths: number, wwd: WasteWaterData): EffluentEnergyData {
    let data: EffluentEnergyData = {
      assessmentName: assessmentName,
      equipmentName: wwd.name,
      kWhMonth: 0,
      millionGallons: 0,
      personEquivalents: 0,
      BODRemoved: 0,
      TSSRemoved: 0,
      TNRemoved: 0
    }
    
    data.kWhMonth = wwd.outputs.AeEnergy;
    data.millionGallons = data.kWhMonth * (1/30) * wwd.activatedSludgeData.FlowRate;
    // .2 lb BOD / person / day
    data.personEquivalents = data.kWhMonth * operatingMonths / (wwd.outputs.InfluentBOD5MassLoading / (.2 * 30));
    // 8.345 density of water
    data.BODRemoved = data.kWhMonth * (1/30) / ((wwd.activatedSludgeData.So - wwd.outputs.EffluentCBOD5) * wwd.activatedSludgeData.FlowRate * 8.345);
    data.TSSRemoved = data.kWhMonth * (1/30) / ((wwd.activatedSludgeData.InfluentTSS - wwd.outputs.EffluentTSS) * wwd.activatedSludgeData.FlowRate * 8.345);

    return data;
  }

}