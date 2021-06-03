import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FanSystemChecklistInput, FanSystemChecklistOutput, FanSystemChecklistResult } from '../../../shared/models/fans';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';

declare var fanAddon;

@Injectable()
export class FanSystemChecklistService {

  fanSystemChecklistInputs: BehaviorSubject<Array<FanSystemChecklistInput>>;
  fanSystemChecklistOutput: BehaviorSubject<FanSystemChecklistOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;s
  currentField: BehaviorSubject<string>;

  constructor(private fanSystemChecklistFormService: FanSystemChecklistFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.fanSystemChecklistInputs = new BehaviorSubject<Array<FanSystemChecklistInput>>(undefined);
    this.fanSystemChecklistOutput = new BehaviorSubject<FanSystemChecklistOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  initEmptyObject(index: number, operatingHours?: OperatingHours) {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let emptyInput: FanSystemChecklistInput = {
      operatingHours: hoursPerYear,
      notes: '',
      motorPower: 0,
      fanType: 0,
      motorOverloads: 0,
      spillOrBypass: 0,
      dischargeDamper: 0,
      inletDamper: 0,
      variableInletVane: 0,
      systemDamper: 0,
      damperClosed: 0,
      turnRight: 0,
      turnNear: 0,
      dirtLeg: 0,
      noOutletDuct: 0,
      restrictedInlet: 0,

      excessFlowOrPressure: 0,
      unstableSystem: 0,
      unreliableSystem: 0,
      lowFlowOrPressure: 0,
      systemNoisy: 0,
      fanBladeBuildup: 0,
      weldingDuctwork: 0,
      radialFanCleanAir: 0,
      name: 'Equipment #' + index
    };
    return emptyInput;
  }
  
  initDefaultEmptyInputs(index: number, settings: Settings) {
    let emptyFanSystemChecklistInput: FanSystemChecklistInput = this.initEmptyObject(index);
    let fanSystemChecklistInput: Array<FanSystemChecklistInput> = [emptyFanSystemChecklistInput];
    this.fanSystemChecklistInputs.next(fanSystemChecklistInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: FanSystemChecklistOutput = {
      equipmentResults: []
    };
    this.fanSystemChecklistOutput.next(emptyOutput);
  }

  updateInputsArray(updatedInput: FanSystemChecklistInput, index: number) {
    let inputsArray: Array<FanSystemChecklistInput>;
      inputsArray = this.fanSystemChecklistInputs.getValue();

    if (inputsArray && inputsArray[index]) {
      inputsArray[index].name = updatedInput.name;
      Object.assign(inputsArray[index], updatedInput);
    }
    this.fanSystemChecklistInputs.next(inputsArray);
  }

  addEquipment(settings: Settings, operatingHours: OperatingHours) {
    let fanSystemChecklistInputs: Array<FanSystemChecklistInput> = this.fanSystemChecklistInputs.getValue();
    let index = fanSystemChecklistInputs.length + 1;
    let newInput: FanSystemChecklistInput = this.initEmptyObject(index, operatingHours);
    fanSystemChecklistInputs.push(newInput)
    this.fanSystemChecklistInputs.next(fanSystemChecklistInputs);
  }

  removeEquipment(i: number) {
    let fanSystemChecklistInputs: Array<FanSystemChecklistInput> = this.fanSystemChecklistInputs.getValue();
    fanSystemChecklistInputs.splice(i, 1);
    this.fanSystemChecklistInputs.next(fanSystemChecklistInputs);
  }

  checkValidInputData(inputs: Array<FanSystemChecklistInput>):boolean {
    if (inputs.length > 0) {
      inputs.forEach(data => {
        let form = this.fanSystemChecklistFormService.getFanSystemChecklistForm(data);
        if (!form.valid) {
          return false;
        }

      })
      return true;
    } else {
      return false;
    }
  }

  calculate(): void {
    let fanSystemChecklistInput: Array<FanSystemChecklistInput> = this.fanSystemChecklistInputs.getValue();
    let inputsCopy: Array<FanSystemChecklistInput> = JSON.parse(JSON.stringify(fanSystemChecklistInput));
    let validInputs: boolean = this.checkValidInputData(inputsCopy);

    this.initDefaultEmptyOutputs();
    let output: FanSystemChecklistOutput = this.fanSystemChecklistOutput.getValue();
    
    if(!validInputs) {
      this.initDefaultEmptyOutputs();
    } else {
      console.log('inputs', inputsCopy);
      inputsCopy.forEach((equipmentInput: FanSystemChecklistInput) => {
        let results: FanSystemChecklistResult = {
          totalScore: 0,
          motorPowerScore: 0,
          operatingHoursScore: 0,
          controlsScore: 0,
          productionScore: 0,
          systemScore: 0,
          name: equipmentInput.name,
          hasMotorPowerPriority: false,
          priority: 'Low'
        };
        results.operatingHoursScore = equipmentInput.operatingHours < 4000? -1 : 0;
        results.operatingHoursScore = equipmentInput.operatingHours > 6000? 1 : 0;

        results.totalScore += equipmentInput.fanType === 1? -1 : 0;
        results.controlsScore += this.getControlScore(equipmentInput);
        results.productionScore += this.getProductionScore(equipmentInput);
        results.systemScore += this.getSystemScore(equipmentInput);
        if (equipmentInput.motorPower > 100) {
          results.motorPowerScore = Math.floor(equipmentInput.motorPower / 100);
          if (equipmentInput.motorPower > 400) {
            results.hasMotorPowerPriority = true;
          }
        }
        
        results.totalScore += results.controlsScore + results.productionScore + results.systemScore + results.operatingHoursScore + results.motorPowerScore;
        if (results.totalScore >= 2 || results.totalScore <= 4) {
          results.priority = 'Medium';
        } else if (results.totalScore > 4) {
          results.priority = 'High';
        }
        output.equipmentResults.push(results);
        this.fanSystemChecklistOutput.next(output);
      });
    }
  }

  getControlScore(equipmentInput: FanSystemChecklistInput) {
    let total = 0;
    total += this.getPointsFromInputValue2(equipmentInput.motorOverloads);
    total += this.getPointsFromInputValue(equipmentInput.spillOrBypass);
    total += this.getPointsFromInputValue(equipmentInput.dischargeDamper);
    total += equipmentInput.inletDamper;
    total += equipmentInput.variableInletVane;
    total += equipmentInput.systemDamper;
    total += equipmentInput.damperClosed;
    return total;
  }

  getProductionScore(equipmentInput: FanSystemChecklistInput) {
    let total = 0;
    total += this.getIncreasedPointsFromInputValue(equipmentInput.excessFlowOrPressure);
    total += this.getIncreasedPointsFromInputValue(equipmentInput.unstableSystem);
    total += this.getIncreasedPointsFromInputValue(equipmentInput.unreliableSystem);
    total += this.getPointsFromInputValue(equipmentInput.lowFlowOrPressure);
    total += this.getPointsFromInputValue(equipmentInput.systemNoisy);
    total += this.getPointsFromInputValue(equipmentInput.fanBladeBuildup);
    total += this.getPointsFromInputValue(equipmentInput.weldingDuctwork);
    total += this.getPointsFromInputValue(equipmentInput.radialFanCleanAir);

    return total;
  }

  getSystemScore(equipmentInput: FanSystemChecklistInput) {
    let total = 0;
    total += equipmentInput.turnRight;
    total += equipmentInput.turnNear;
    total += equipmentInput.dirtLeg;
    total += equipmentInput.noOutletDuct;
    total += equipmentInput.restrictedInlet;
    return total;
  }


  getIncreasedPointsFromInputValue(radioSelection: number) {
    if (radioSelection === 0) {
      return 0;
    } else if (radioSelection == 1) {
      return 2;
    } else {
      return 3;
    }
  }

  getPointsFromInputValue(inputValue: number) {
    if (inputValue === 0) {
      return 0;
    } else if (inputValue == 1) {
      return 1;
    } else {
      return 2;
    }
  }

  getPointsFromInputValue2(inputValue: boolean | number) {
    inputValue = Number(inputValue);
    if (inputValue === 0) {
      return 0;
    } else if (inputValue == 1) {
      return 1;
    } else {
      return 2;
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: FanSystemChecklistInput = {
      operatingHours: 8760,
      motorPower: 1,
      fanType: 1,
      motorOverloads: 0,
      spillOrBypass: 0,
      dischargeDamper: 0,
      inletDamper: 0,
      variableInletVane: 0,
      systemDamper: 0,
      damperClosed: 0,
      turnRight: 0,
      turnNear: 0,
      dirtLeg: 0,
      noOutletDuct: 0,
      restrictedInlet: 0,
      excessFlowOrPressure: 0,
      unstableSystem: 0,
      unreliableSystem: 0,
      lowFlowOrPressure: 0,
      systemNoisy: 0,
      fanBladeBuildup: 0,
      weldingDuctwork: 0,
      radialFanCleanAir: 0,
      notes: '',
      name: 'Equipment #1'
    };

    this.fanSystemChecklistInputs.next([exampleInput]);
  }
  
  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
