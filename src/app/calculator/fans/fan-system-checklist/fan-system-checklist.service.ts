import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanSystemChecklistInput, FanSystemChecklistOutput, FanSystemChecklistResult } from '../../../shared/models/fans';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';

@Injectable()
export class FanSystemChecklistService {

  fanSystemChecklistInputs: BehaviorSubject<Array<FanSystemChecklistInput>>;
  fanSystemChecklistOutput: BehaviorSubject<FanSystemChecklistOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
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
      name: 'Equipment #' + index,
      motorPower: 0,
      fanType: 0,
      control: {
        motorOverloads: 0,
        spillOrBypass: 0,
        dischargeDamper: 0,
        inletDamper: 0,
        variableInletVane: 0,
        systemDamper: 0,
        damperClosed: 0,
      },
      system: {
        turnRight: 0,
        turnNear: 0,
        dirtLeg: 0,
        noOutletDuct: 0,
        restrictedInlet: 0,
      },
      production: {
        excessFlowOrPressure: 0,
        unstableSystem: 0,
        unreliableSystem: 0,
        lowFlowOrPressure: 0,
        systemNoisy: 0,
        fanBladeBuildup: 0,
        weldingDuctwork: 0,
        radialFanCleanAir: 0,
      }
    };
    return emptyInput;
  }
  
  initDefaultEmptyInputs(index: number) {
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
    let inputsArray: Array<FanSystemChecklistInput> = this.fanSystemChecklistInputs.getValue();

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
          priority: 'Low',
          notes: equipmentInput.notes,
          checklistAnswers: this.getDefaultChecklistAnswers()
        };
        results.operatingHoursScore = equipmentInput.operatingHours < 4000? -1 : 0;
        results.operatingHoursScore = equipmentInput.operatingHours > 6000? 1 : 0;

        results = this.setControlScore(equipmentInput, results);
        results = this.setProductionScore(equipmentInput, results);
        results = this.setSystemScore(equipmentInput, results);
        if (equipmentInput.motorPower > 100) {
          results.motorPowerScore = Math.floor(equipmentInput.motorPower / 100);
          results.motorPowerScore += equipmentInput.fanType === 1? -1 : 0;
          if (equipmentInput.motorPower > 400) {
            results.hasMotorPowerPriority = true;
          }
        }
        
        results.totalScore += results.controlsScore + results.productionScore + results.systemScore + results.operatingHoursScore + results.motorPowerScore;
        if (results.totalScore >= 2 && results.totalScore <= 4) {
          results.priority = 'Medium';
        } else if (results.totalScore > 4) {
          results.priority = 'High';
        }
        output.equipmentResults.push(results);
        this.fanSystemChecklistOutput.next(output); 
      });
    }
  }

    setControlScore(equipmentInput: FanSystemChecklistInput, result: FanSystemChecklistResult): FanSystemChecklistResult {
      let total: number = 0;
      total += this.getPointsFromInputValue(equipmentInput.control.motorOverloads);
      total += this.getPointsFromInputValue(equipmentInput.control.spillOrBypass);
      total += this.getPointsFromInputValue(equipmentInput.control.dischargeDamper);
      total += equipmentInput.control.inletDamper;
      total += equipmentInput.control.variableInletVane;
      total += equipmentInput.control.systemDamper;
      total += equipmentInput.control.damperClosed;

      result.controlsScore = total;
      for (let question in equipmentInput.control) {
        if (equipmentInput.control.hasOwnProperty(question)) {
          result.checklistAnswers[question] = this.getFormattedString(equipmentInput.control[question]);
        }
      }
      return result;
  
    }

    getFormattedString(boolInputField: boolean): string {
      let convertedBoolean = String(Boolean(boolInputField));
      return convertedBoolean.charAt(0).toUpperCase() + convertedBoolean.slice(1)
    }
  
    setProductionScore(equipmentInput: FanSystemChecklistInput, result: FanSystemChecklistResult): FanSystemChecklistResult {
      let total: number = 0;
      total += this.getIncreasedPointsFromInputValue(equipmentInput.production.excessFlowOrPressure);
      total += this.getIncreasedPointsFromInputValue(equipmentInput.production.unstableSystem);
      total += this.getIncreasedPointsFromInputValue(equipmentInput.production.unreliableSystem);
      total += this.getPointsFromInputValue(equipmentInput.production.lowFlowOrPressure);
      total += this.getPointsFromInputValue(equipmentInput.production.systemNoisy);
      total += this.getPointsFromInputValue(equipmentInput.production.fanBladeBuildup);
      total += this.getPointsFromInputValue(equipmentInput.production.weldingDuctwork);
      total += this.getPointsFromInputValue(equipmentInput.production.radialFanCleanAir);
  
      result.productionScore = total;
      for (let question in equipmentInput.production) {
        if (equipmentInput.production.hasOwnProperty(question)) {
          result.checklistAnswers[question] = this.getRadioAnswer(equipmentInput.production[question]);
        }
      }
      return result;
    }
  
    setSystemScore(equipmentInput: FanSystemChecklistInput, result: FanSystemChecklistResult) {
      let total: number = 0;
      total += equipmentInput.system.turnRight;
      total += equipmentInput.system.turnNear;
      total += equipmentInput.system.dirtLeg;
      total += equipmentInput.system.noOutletDuct;
      total += equipmentInput.system.restrictedInlet;

      result.systemScore = total;
      for (var question in equipmentInput.system) {
        if (equipmentInput.system.hasOwnProperty(question)) {
          result.checklistAnswers[question] = this.getFormattedString(equipmentInput.system[question]);
        }
      }
      return result;
    }


  getIncreasedPointsFromInputValue(radioSelection: number): number {
    if (radioSelection === 0) {
      return 0;
    } else if (radioSelection == 1) {
      return 2;
    } else {
      return 3;
    }
  }

  getPointsFromInputValue(inputValue: number): number {
    if (inputValue === 0) {
      return 0;
    } else if (inputValue == 1) {
      return 1;
    } else {
      return 2;
    }
  }

  getRadioAnswer(radioSelection: number): string {
    if (radioSelection === 0) {
      return 'No';
    } else if (radioSelection == 1) {
      return 'Yes';
    } else {
      return 'Severe';
    }
  }

  getDefaultChecklistAnswers(): {[key: string]: string} {
    return {
      motorOverloads: 'False',
      spillOrBypass: 'False',
      dischargeDamper: 'False',
      inletDamper: 'False',
      variableInletVane: 'False',
      systemDamper: 'False',
      damperClosed: 'False',
      turnRight: 'False',
      turnNear: 'False',
      dirtLeg: 'False',
      noOutletDuct: 'False',
      restrictedInlet: 'False',
      excessFlowOrPressure: 'No',
      unstableSystem: 'No',
      unreliableSystem: 'No',
      lowFlowOrPressure: 'No',
      systemNoisy: 'No',
      fanBladeBuildup: 'No',
      weldingDuctwork: 'No',
      radialFanCleanAir: 'No',
    };
  }

  generateExampleData(settings: Settings) {
    let exampleInput: FanSystemChecklistInput = {
      operatingHours: 8760,
      motorPower: 1,
      fanType: 1,
      control: {
        motorOverloads: 0,
        spillOrBypass: 0,
        dischargeDamper: 0,
        inletDamper: 0,
        variableInletVane: 0,
        systemDamper: 0,
        damperClosed: 0,
      },
      system: {
        turnRight: 0,
        turnNear: 0,
        dirtLeg: 0,
        noOutletDuct: 0,
        restrictedInlet: 0,
      },
      production: {
        excessFlowOrPressure: 0,
        unstableSystem: 0,
        unreliableSystem: 0,
        lowFlowOrPressure: 0,
        systemNoisy: 0,
        fanBladeBuildup: 0,
        weldingDuctwork: 0,
        radialFanCleanAir: 0,
      },
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
