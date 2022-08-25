import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CoolingTowerData, CoolingTowerOutput, CoolingTowerResult, CoolingTowerInput } from '../../../shared/models/chillers';
import { ChillerService } from '../chiller.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

declare var chillersAddon: any;

@Injectable()
export class CoolingTowerService {
  operatingHours: OperatingHours;
  baselineData: BehaviorSubject<Array<CoolingTowerData>>;
  modificationData: BehaviorSubject<Array<CoolingTowerData>>;
  coolingTowerOutput: BehaviorSubject<CoolingTowerOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  constructor(private formBuilder: FormBuilder, 
              private convertUnitsService: ConvertUnitsService,
              private chillerService: ChillerService) { 
    this.baselineData = new BehaviorSubject<Array<CoolingTowerData>>(undefined);
    this.modificationData = new BehaviorSubject<Array<CoolingTowerData>>(undefined);
    this.coolingTowerOutput = new BehaviorSubject<CoolingTowerOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  getFormFromObj(inputObj: CoolingTowerData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      operationalHours: [inputObj.operationalHours],
      flowRate: [inputObj.flowRate],
      waterCost: [inputObj.waterCost],
      userDefinedCoolingLoad:  [inputObj.userDefinedCoolingLoad],
      temperatureDifference:  [inputObj.temperatureDifference],
      coolingLoad: [inputObj.coolingLoad],
      lossCorrectionFactor: [inputObj.lossCorrectionFactor],
      hasDriftEliminator: [inputObj.hasDriftEliminator],
      driftLossFactor: [inputObj.driftLossFactor],
      cyclesOfConcentration: [inputObj.cyclesOfConcentration],
    });
    
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: FormGroup): FormGroup {
    form.controls.operationalHours.setValidators([Validators.required, Validators.min(0), Validators.max(8760)]);
    form.controls.flowRate.setValidators([GreaterThanValidator.greaterThan(0), Validators.required]);
    form.controls.waterCost.setValidators([Validators.required, Validators.min(0)]);
    form.controls.coolingLoad.setValidators([Validators.required, Validators.min(0)]);
    form.controls.temperatureDifference.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    form.controls.lossCorrectionFactor.setValidators([Validators.required, Validators.min(0), Validators.max(150)]);
    form.controls.driftLossFactor.setValidators([Validators.required, Validators.min(0),  Validators.max(1)]);
    form.controls.cyclesOfConcentration.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    return form;
  }

  getObjFromForm(form: FormGroup): CoolingTowerData {
    let coolingTowerData: CoolingTowerData = {
      name: form.controls.name.value,
      operationalHours: form.controls.operationalHours.value,
      flowRate: form.controls.flowRate.value,
      waterCost: form.controls.waterCost.value,
      userDefinedCoolingLoad: form.controls.userDefinedCoolingLoad.value,
      temperatureDifference: form.controls.temperatureDifference.value,
      coolingLoad: form.controls.coolingLoad.value,
      lossCorrectionFactor: form.controls.lossCorrectionFactor.value,
      hasDriftEliminator: form.controls.hasDriftEliminator.value,
      driftLossFactor: form.controls.driftLossFactor.value,
      cyclesOfConcentration: form.controls.cyclesOfConcentration.value,
    };
    return coolingTowerData;
  }

  initObject(index: number, settings: Settings, operatingHours: OperatingHours): CoolingTowerData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let obj: CoolingTowerData = {
      name: 'Case #' + (index + 1),
      operationalHours: hoursPerYear,
      flowRate: 1,
      userDefinedCoolingLoad: true,
      waterCost: 0,
      temperatureDifference: 0,
      coolingLoad: 0,
      lossCorrectionFactor: 85,
      hasDriftEliminator: 0,
      driftLossFactor: .2,
      cyclesOfConcentration: 1
    };
    return obj;
  }

  initDefaultEmptyInputs(index: number, settings: Settings, operatingHours: OperatingHours) {
    let emptyBaselineData: CoolingTowerData = this.initObject(index, settings, operatingHours);
    let baselineData: Array<CoolingTowerData> = [emptyBaselineData];
    this.baselineData.next(baselineData);
  }

  initDefaultEmptyOutputs() {
    let emptyCase: CoolingTowerResult = {
      wcBaseline: 0,
      wcModification: 0,
      waterSavings: 0,
    }
    let casesOutput: Array<CoolingTowerResult> = [];
    casesOutput.push(emptyCase);
    let emptyOutput: CoolingTowerOutput = {
      wcBaseline: 0,
      wcModification: 0,
      waterSavings: 0,
      savingsPercentage: 0,
      annualCostSavings: 0,
      baselineCost: 0,
      modificationCost: 0,
      coolingTowerCaseResults: casesOutput
    };
    this.coolingTowerOutput.next(emptyOutput);
  }

  updateDataArray(data: CoolingTowerData, index: number, isBaseline: boolean) {
    let dataArray: Array<CoolingTowerData>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    dataArray[index].name = data.name;
    dataArray[index].operationalHours = data.operationalHours;
    dataArray[index].flowRate = data.flowRate;
    dataArray[index].coolingLoad = data.coolingLoad;
    dataArray[index].lossCorrectionFactor = data.lossCorrectionFactor;
    dataArray[index].driftLossFactor = data.driftLossFactor;
    dataArray[index].cyclesOfConcentration = data.cyclesOfConcentration;
    
    let currentModificationData = this.modificationData.getValue();
     if (isBaseline && currentModificationData) {
      currentModificationData[index].operationalHours = data.operationalHours;
      currentModificationData[index].coolingLoad = data.coolingLoad;
      currentModificationData[index].flowRate = data.flowRate;
      currentModificationData[index].temperatureDifference = data.temperatureDifference;
      currentModificationData[index].userDefinedCoolingLoad = data.userDefinedCoolingLoad;
      this.modificationData.next(currentModificationData);
    } else if (isBaseline && !currentModificationData) {
      this.baselineData.next(dataArray);
    }else {
      this.modificationData.next(dataArray);
    }
  }

  addCase(settings: Settings, operatingHours: OperatingHours, modificationExists: boolean) {
      let currentBaselineData: Array<CoolingTowerData> = this.baselineData.getValue();
      let index = currentBaselineData.length;
      let baselineObj: CoolingTowerData = this.initObject(index, settings, operatingHours);
      currentBaselineData.push(baselineObj)
      this.baselineData.next(currentBaselineData);
      
      if (modificationExists) {
        let currentModificationData: Array<CoolingTowerData> = this.modificationData.getValue();
        let modificationObj: CoolingTowerData = this.initObject(index, settings, operatingHours);
        
        // Set case operational constants
        modificationObj.flowRate = currentBaselineData[index].flowRate;
        modificationObj.coolingLoad = currentBaselineData[index].coolingLoad;
        modificationObj.operationalHours = currentBaselineData[index].operationalHours;
       
        currentModificationData.push(modificationObj);
        this.modificationData.next(currentModificationData);
      }
  }

  createModification() {
    let currentBaselineData: Array<CoolingTowerData> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  removeCase(i: number) {
      let currentBaselineData: Array<CoolingTowerData> = this.baselineData.getValue();
      currentBaselineData.splice(i, 1);
      this.baselineData.next(currentBaselineData);
      let currentModificationData: Array<CoolingTowerData> = this.modificationData.getValue();
      if (currentModificationData) {
        currentModificationData.splice(i, 1);
        this.modificationData.next(currentModificationData);
      }
  }
  
  checkValidInputData(cases: Array<CoolingTowerData>):boolean {
    cases.forEach(data => {
      let form = this.getFormFromObj(data);
      if (!form.valid) {
        return false;
      }
    })
    return true;
  }

  calculate(settings: Settings) {
    
    if (this.baselineData.getValue()) {
      let baselineDataCopy: Array<CoolingTowerData> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
      let validBaseline: boolean = this.checkValidInputData(baselineDataCopy);

      let modificationDataCopy: Array<CoolingTowerData>;
      let validModification = true;
      if (this.modificationData.value != undefined) {
        modificationDataCopy = JSON.parse(JSON.stringify(this.modificationData.getValue()));
        validModification = this.checkValidInputData(modificationDataCopy);
      }

      if (!validBaseline || !validModification) {
        this.initDefaultEmptyOutputs();
      } else {
        let coolingTowerInputs: Array<CoolingTowerInput> = this.buildInputObjects(baselineDataCopy, settings, modificationDataCopy)
        let waterCost: number = baselineDataCopy[0].waterCost;
        let coolingTowerOutput: CoolingTowerOutput = {
          wcBaseline: 0,
          wcModification: 0,
          waterSavings: 0,
          savingsPercentage: 0,
          annualCostSavings: 0,
          baselineCost: 0,
          modificationCost: 0,
          coolingTowerCaseResults: []
        }
        let coolingTowerCaseResults: Array<CoolingTowerResult> = [];
        coolingTowerInputs.forEach(input => {
          let caseResultData: CoolingTowerResult = this.chillerService.coolingTowerMakeupWater(input);
          caseResultData = this.convertResultData(caseResultData, settings);
          coolingTowerOutput.wcBaseline += caseResultData.wcBaseline;
          coolingTowerOutput.wcModification += caseResultData.wcModification;
          coolingTowerCaseResults.push(caseResultData)
        });
        coolingTowerOutput.waterSavings = coolingTowerOutput.wcBaseline - coolingTowerOutput.wcModification;
        let baselineGalConsumption: number = coolingTowerOutput.wcBaseline;
        let modificationGalConsumption: number = coolingTowerOutput.wcModification;
        let waterSavingsGals: number = coolingTowerOutput.waterSavings;
        if (settings.unitsOfMeasure === 'Imperial') {
          baselineGalConsumption = this.convertUnitsService.value(baselineGalConsumption).from('kgal').to('gal');
          modificationGalConsumption = this.convertUnitsService.value(modificationGalConsumption).from('kgal').to('gal');
          waterSavingsGals = this.convertUnitsService.value(waterSavingsGals).from('kgal').to('gal');
        }
        coolingTowerOutput.baselineCost = baselineGalConsumption * waterCost;
        coolingTowerOutput.modificationCost = modificationGalConsumption * waterCost;
        coolingTowerOutput.savingsPercentage = (coolingTowerOutput.waterSavings / coolingTowerOutput.wcBaseline) * 100;
        coolingTowerOutput.annualCostSavings = waterSavingsGals * waterCost;
        coolingTowerOutput.coolingTowerCaseResults = coolingTowerCaseResults;
        this.coolingTowerOutput.next(coolingTowerOutput);
      }
    }
  }

  convertResultData(caseResultData: CoolingTowerResult, settings: Settings): CoolingTowerResult {
    if (settings.unitsOfMeasure != "Imperial") {
      caseResultData.wcBaseline = this.convertUnitsService.value(caseResultData.wcBaseline).from('gal').to('m3');
      caseResultData.wcModification = this.convertUnitsService.value(caseResultData.wcModification).from('gal').to('m3');
      caseResultData.waterSavings = this.convertUnitsService.value(caseResultData.waterSavings).from('gal').to('m3');
    } else {
      caseResultData.wcBaseline = this.convertUnitsService.value(caseResultData.wcBaseline).from('gal').to('kgal');
      caseResultData.wcModification = this.convertUnitsService.value(caseResultData.wcModification).from('gal').to('kgal');
      caseResultData.waterSavings = this.convertUnitsService.value(caseResultData.waterSavings).from('gal').to('kgal');
    }
    return caseResultData;
  }

  buildInputObjects(baselineDataCopy: Array<CoolingTowerData>, settings: Settings, modificationDataCopy: Array<CoolingTowerData>) {  
    let coolingTowerInputs: Array<CoolingTowerInput> = baselineDataCopy.map((inputData: CoolingTowerData, index) => {
      inputData.driftLossFactor = inputData.driftLossFactor / 100;
      inputData.lossCorrectionFactor = inputData.lossCorrectionFactor / 100;
      
      let modCyclesOfConcentration = 0;
      let modDriftLossFactor = 0
      if (modificationDataCopy != undefined && modificationDataCopy[index]) {
        modCyclesOfConcentration = modificationDataCopy[index].cyclesOfConcentration;
        modDriftLossFactor = modificationDataCopy[index].driftLossFactor / 100;
      }

      if (settings.unitsOfMeasure != "Imperial") {
        inputData.flowRate = this.convertUnitsService.value(inputData.flowRate).from('m3/s').to('gpm');
        inputData.coolingLoad = this.convertUnitsService.value(inputData.coolingLoad).from('GJ').to('MMBtu');
      }

      let input = <CoolingTowerInput>{
        coolingTowerMakeupWaterCalculator: {
          operatingConditionsData: {
            flowRate: inputData.flowRate,
            coolingLoad: inputData.coolingLoad,
            operationalHours: inputData.operationalHours,
            lossCorrectionFactor: inputData.lossCorrectionFactor
          },
          waterConservationBaselineData: {
            cyclesOfConcentration: inputData.cyclesOfConcentration,
            driftLossFactor: inputData.driftLossFactor
          },
          waterConservationModificationData: {
            cyclesOfConcentration: modCyclesOfConcentration,
            driftLossFactor: modDriftLossFactor
          }
        }
      }

      return input;
    });
    return coolingTowerInputs;
  }

  calculateCoolingLoad(form: FormGroup, settings: Settings) {
    let {temperatureDifference, flowRate} = this.getObjFromForm(form);
    if (settings.unitsOfMeasure != "Imperial") {
      flowRate = this.convertUnitsService.value(flowRate).from('m3/s').to('gpm');
      temperatureDifference = this.convertUnitsService.value(temperatureDifference).from('K').to('R');
    }
    let coolingLoad = flowRate * (8.345 * 60 * 1 / 1000000) * temperatureDifference;

    if (settings.unitsOfMeasure != "Imperial") {
      coolingLoad = this.convertUnitsService.value(coolingLoad).from('MMBtu').to('GJ');
    }
    return coolingLoad;
  }

  generateExampleData(settings: Settings) {
    let modificationExample: CoolingTowerData = {
      name: 'Case #1',
      operationalHours: 1000,
      flowRate: 2500,
      waterCost: .0025,
      userDefinedCoolingLoad: true,
      temperatureDifference: 0,
      coolingLoad: 10,
      lossCorrectionFactor: 100,
      hasDriftEliminator: 1,
      driftLossFactor: .01,
      cyclesOfConcentration: 3
    };
    let baselineExample: CoolingTowerData = {
      name: 'Case #1',
      operationalHours: 1000,
      waterCost: .0025,
      flowRate: 2500,
      userDefinedCoolingLoad: true,
      temperatureDifference: 0,
      coolingLoad: 10,
      lossCorrectionFactor: 100,
      hasDriftEliminator: 0,
      driftLossFactor: .2,
      cyclesOfConcentration: 3
    };

    if (settings.unitsOfMeasure != 'Imperial') {
      baselineExample = this.convertExampleData(baselineExample);
      modificationExample = this.convertExampleData(modificationExample);
    }

    let baselineDataExample: Array<CoolingTowerData> = [];
    baselineDataExample.push(baselineExample);
    this.baselineData.next(baselineDataExample);

    let modificationDataExample: Array<CoolingTowerData> = [];
    modificationDataExample.push(modificationExample);
    this.modificationData.next(modificationDataExample);
  }

  convertExampleData(coolingTowerData: CoolingTowerData) {
    coolingTowerData.flowRate = this.convertUnitsService.value(coolingTowerData.flowRate).from('gpm').to('m3/s');
    coolingTowerData.coolingLoad = this.convertUnitsService.value(coolingTowerData.coolingLoad).from('MMBtu').to('GJ');

    coolingTowerData.flowRate = this.roundVal(coolingTowerData.flowRate, 2);
    coolingTowerData.coolingLoad = this.roundVal(coolingTowerData.coolingLoad, 2);
    return coolingTowerData;
  }

  roundVal(num: number, digits?: number): number {
    if (!digits) {
      digits = 3;
    }
    return Number(num.toFixed(digits));
  }

}
