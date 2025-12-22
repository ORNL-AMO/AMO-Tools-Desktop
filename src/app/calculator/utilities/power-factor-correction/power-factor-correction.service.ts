import { Injectable } from '@angular/core';
import { PFMonthlyOutputs, PowerFactorCorrectionInputs, PowerFactorCorrectionOutputs } from './power-factor-correction.component';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn, FormArray, FormGroup } from '@angular/forms';

@Injectable()
export class PowerFactorCorrectionService {
  inputData: PowerFactorCorrectionInputs;

  constructor(private formBuilder: UntypedFormBuilder) { 
  }

  generateExample(): PowerFactorCorrectionInputs {
    return {
      existingDemand: 286,
      currentPowerFactor: 0.88,
      proposedPowerFactor: 0.95,
      billedForDemand: 0,
      minimumPowerFactor: 0.95,
      targetPowerFactor: 0.95,
      adjustedOrActual: 0,
      marginalCostOfDemand: 8.15,
      costOfStaticCapacitance: 50,
      costOfDynamicCapacitance: 70,
      monthyInputs: [
        {
          month: 'January 2024',
          actualDemand: 462,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'February 2024',
          actualDemand: 528,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'March 2024',
          actualDemand: 492,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'April 2024',
          actualDemand: 474,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'May 2024',
          actualDemand: 499,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'June 2024',
          actualDemand: 513,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'July 2024',
          actualDemand: 530,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'August 2024',
          actualDemand: 523,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'September 2024',
          actualDemand: 547,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'October 2024',
          actualDemand: 589,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'November 2024',
          actualDemand: 621,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
        {
          month: 'December 2024',
          actualDemand: 607,
          powerFactor: 0.8,
          pfAdjustedDemand: 0
        },
      ],    
      startMonth: 1,
      startYear: 2024,
    };
  }

  generateExampleOutput(): PowerFactorCorrectionOutputs {
    return {
      annualPFPenalty: 8216,
      proposedFixedCapacitance: 164,
      proposedVariableCapacitance: 56,
      capitalCost: 12145,
      simplePayback: 1.5,
      monthlyOutputs: [
        {
          realDemand: 389,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 73,
          penaltyCost: 594.52,
          currentReactivePower: 292,
          proposedReactivePower: 128,
          proposedCapacitance: 164,
        },
        {
          realDemand: 445,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 83,
          penaltyCost: 679.45,
          currentReactivePower: 333,
          proposedReactivePower: 146,
          proposedCapacitance: 187,
        },
        {
          realDemand: 414,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 78,
          penaltyCost: 633.13,
          currentReactivePower: 311,
          proposedReactivePower: 136,
          proposedCapacitance: 175,
        },
        {
          realDemand: 399,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 75,
          penaltyCost: 609.96,
          currentReactivePower: 299,
          proposedReactivePower: 131,
          proposedCapacitance: 168,
        },
        {
          realDemand: 420,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 79,
          penaltyCost: 642.13,
          currentReactivePower: 315,
          proposedReactivePower: 138,
          proposedCapacitance: 177,
        },
        {
          realDemand: 432,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 81,
          penaltyCost: 660.15,
          currentReactivePower: 324,
          proposedReactivePower: 142,
          proposedCapacitance: 182,
        },
        {
          realDemand: 446,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 84,
          penaltyCost: 682.03,
          currentReactivePower: 335,
          proposedReactivePower: 147,
          proposedCapacitance: 188,
        },
        {
          realDemand: 440,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 83,
          penaltyCost: 673.02,
          currentReactivePower: 330,
          proposedReactivePower: 145,
          proposedCapacitance: 186,
        },
        {
          realDemand: 461,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 86,
          penaltyCost: 703.90,
          currentReactivePower: 345,
          proposedReactivePower: 151,
          proposedCapacitance: 194,
        },
        {
          realDemand: 496,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 93,
          penaltyCost: 757.95,
          currentReactivePower: 372,
          proposedReactivePower: 163,
          proposedCapacitance: 209,
        },
        {
          realDemand: 523,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 98,
          penaltyCost: 799.13,
          currentReactivePower: 392,
          proposedReactivePower: 172,
          proposedCapacitance: 220,
        },
        {
          realDemand: 511,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 96,
          penaltyCost: 781.11,
          currentReactivePower: 383,
          proposedReactivePower: 168,
          proposedCapacitance: 215,
        }
      ]
    };
  }

  getResetData(): PowerFactorCorrectionInputs {
    return {
      existingDemand: 0,
      currentPowerFactor: 0,
      proposedPowerFactor: 0,
      billedForDemand: 0,
      minimumPowerFactor: 0,
      targetPowerFactor: 0,
      adjustedOrActual: 0,
      marginalCostOfDemand: 0,
      costOfStaticCapacitance: 0,
      costOfDynamicCapacitance: 0,
      monthyInputs: [
        {
          month: 'January 2024',
          actualDemand: 0,
          powerFactor: 0,
          pfAdjustedDemand: 0
        },
        {
          month: 'February 2024',
          actualDemand: 0,
          powerFactor: 0,
          pfAdjustedDemand: 0
        },
        {
          month: 'March 2024',
          actualDemand: 0,
          powerFactor: 0,
          pfAdjustedDemand: 0
        },
      ],    
      startMonth: 1,
      startYear: 2024,
    };
  }

  getResetOutput(): PowerFactorCorrectionOutputs {
    return {
      annualPFPenalty: 0,
      proposedFixedCapacitance: 0,
      proposedVariableCapacitance: 0,
      capitalCost: 0,
      simplePayback: 0,
      monthlyOutputs: [
        {
          realDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        },
        {
          realDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        },
        {
          realDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        }
      ]
    };
  }

  existingApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.currentPowerFactor;
  }

  existingReactivePower(data: PowerFactorCorrectionInputs): number {
    return Math.sqrt((this.existingApparentPower(data) * this.existingApparentPower(data)) - (data.existingDemand * data.existingDemand));
  }

  proposedApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.proposedPowerFactor;
  }

  proposedReactivePower(data: PowerFactorCorrectionInputs): number {
    return Math.sqrt((this.proposedApparentPower(data) * this.proposedApparentPower(data)) - (data.existingDemand * data.existingDemand));
  }

  capacitancePowerRequired(data: PowerFactorCorrectionInputs): number {
    return this.existingReactivePower(data) - this.proposedReactivePower(data);
  }

  getEmptyMonthyOutput(): PFMonthlyOutputs{
    return {
      realDemand: 0,
      pfAdjustedDemand: 0,
      proposedApparentPower: 0,
      demandPenalty: 0,
      penaltyCost: 0,
      currentReactivePower: 0,
      proposedReactivePower: 0,
      proposedCapacitance: 0,
    }
  }

  getEmptyPowerFactorCorrectionOutputs(): PowerFactorCorrectionOutputs{
    return {
      annualPFPenalty: 0,
      proposedFixedCapacitance: 0,
      proposedVariableCapacitance: 0,
      capitalCost: 0,
      simplePayback: 0,
      monthlyOutputs: [
        {
          realDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        }
      ]
    }
  }

  getResults(data: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs{
    let results: PowerFactorCorrectionOutputs;
    if (data.billedForDemand == 0) {
      if (data.adjustedOrActual == 0) {
        results = this.calculateRealPowerAndPowerFactor(data);
      } else if (data.adjustedOrActual == 1) {
        results = this.calculateRealPowerAndActualDemand(data);
      } else if (data.adjustedOrActual == 2) {
        results = this.calculateRealPowerAndBoth(data);
      }
    } else if (data.billedForDemand == 1) {
      if (data.adjustedOrActual == 0) {
        results = this.calculateApparentPowerAndPowerFactor(data);
      } else if (data.adjustedOrActual == 1) {
        results = this.calculateApparentPowerAndActualDemand(data);
      }
    } else {
      results = {
        annualPFPenalty: 0,
        proposedFixedCapacitance: 0,
        proposedVariableCapacitance: 0,
        capitalCost: 0,
        simplePayback: 0,
        monthlyOutputs: [
          {
            realDemand: 0,
            pfAdjustedDemand: 0,
            proposedApparentPower: 0,
            demandPenalty: 0,
            penaltyCost: 0,
            currentReactivePower: 0,
            proposedReactivePower: 0,
            proposedCapacitance: 0,
          }
        ]
      };
    }
    return results;
  }

    monthlyGroupValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
      const actualDemandControl = (group as FormGroup).get('actualDemand');
      const powerFactorControl = (group as FormGroup).get('powerFactor');
      const parentForm = group.parent?.parent as FormGroup; 

      const isInvalid = ((actualDemandControl && actualDemandControl.value === 333) || (powerFactorControl && powerFactorControl.value === 333)) && Number(parentForm?.get('billedForDemand')?.value) === 1;

      if (isInvalid) {
        if (actualDemandControl) actualDemandControl.setErrors({ ...actualDemandControl.errors, combinedError: 'Either value is 333 (test rule)' });
        if (powerFactorControl) powerFactorControl.setErrors({ ...powerFactorControl.errors, combinedError: 'Either value is 333 (test rule)' });
        return { combinedError: true };
      }

      // * copilot generated
      // The below code definitely smells, but as a prototype it does work
      if (actualDemandControl && actualDemandControl.errors && actualDemandControl.errors['combinedError']) {
        const { combinedError, ...otherErrors } = actualDemandControl.errors;
        actualDemandControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
      if (powerFactorControl && powerFactorControl.errors && powerFactorControl.errors['combinedError']) {
        const { combinedError, ...otherErrors } = powerFactorControl.errors;
        powerFactorControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
      return null;
    };

  getApparentPowerAndPowerFactor(inputData: PowerFactorCorrectionInputs): UntypedFormGroup {


    let form: UntypedFormGroup = this.formBuilder.group({
      existingDemand: [inputData.existingDemand],
      currentPowerFactor: [inputData.currentPowerFactor],
      proposedPowerFactor: [inputData.proposedPowerFactor],
      billedForDemand: [inputData.billedForDemand],
      minimumPowerFactor: [inputData.minimumPowerFactor, [Validators.required, Validators.min(0), Validators.max(1)]],
      targetPowerFactor: [inputData.targetPowerFactor],
      adjustedOrActual: [inputData.adjustedOrActual],
      marginalCostOfDemand: [inputData.marginalCostOfDemand, [Validators.required, Validators.min(0)]],
      costOfStaticCapacitance: [inputData.costOfStaticCapacitance, [Validators.required, Validators.min(0)]],
      costOfDynamicCapacitance: [inputData.costOfDynamicCapacitance, [Validators.required, Validators.min(0)]],
      monthyInputs: this.formBuilder.array(
        inputData.monthyInputs.map(m => {
          const group = this.formBuilder.group({
            month: [m.month, Validators.required],
            actualDemand: [m.actualDemand, [Validators.required, Validators.min(0)]],
            powerFactor: [m.powerFactor, [Validators.required, Validators.min(0)]],
            pfAdjustedDemand: [m.pfAdjustedDemand, [Validators.required, Validators.min(0)]]
          }, { validators: this.monthlyGroupValidator });
          return group;
        })
      ),
      startMonth: [inputData.startMonth],
      startYear: [inputData.startYear]
    });
    return form;
  }

//  conditionalInputValidator(): ValidatorFn {
//   return (group: AbstractControl): ValidationErrors | null => {
//     const parent = group.parent;
//     const parentofParent = parent?.parent;

//     const actualDemandControl = group.get('actualDemand');
//     const powerFactorControl = group.get('powerFactor');

//     const actualDemand = actualDemandControl?.value;
//     const powerFactor = powerFactorControl?.value;

//     const billedForDemand = Number(parentofParent?.get('billedForDemand')?.value);
//     const adjustedOrActual = Number(parentofParent?.get('adjustedOrActual')?.value);

//     if(billedForDemand == 1 && adjustedOrActual == 1) {
//       if (actualDemand != null && powerFactor != null && actualDemand > powerFactor) {
//         powerFactorControl?.setErrors({ ...powerFactorControl.errors, actualDemandNotLessThanpfAdjustedDemand: true });

//         return { actualDemandNotLessThanpfAdjustedDemand: true };
//       } else {
//         if (powerFactorControl?.errors) {
//           const { actualDemandNotLessThanpfAdjustedDemand, ...otherErrors } = powerFactorControl.errors;
//           powerFactorControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
//         }
//       }
//     } else {
//       if (actualDemand != null && powerFactor != null && actualDemand < powerFactor) {
//         actualDemandControl?.setErrors({ ...actualDemandControl.errors, actualDemandNotLessThanpowerFactor: true });

//         return { actualDemandNotLessThanpowerFactor: true };
//       } else {
//         if (actualDemandControl?.errors) {
//           const { actualDemandNotLessThanpowerFactor, ...otherErrors } = actualDemandControl.errors;
//           actualDemandControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
//         }
//       }
//     }
//     actualDemandControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
//     powerFactorControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    
//     return null;
//   };
// }

  // * Another note, in the componen.ts you must use patchValue() or setValue() on ng reactive forms to update values so that change detection works correctly - there are places where that's not happening 

    // * test individual validators with arbitrary rules




  calculateRealPowerAndPowerFactor(inputData: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs {
    let outputData: PowerFactorCorrectionOutputs = this.getEmptyPowerFactorCorrectionOutputs();
    let monthlyOutputs: Array<PFMonthlyOutputs> = new Array();
    let annualPFPenalty: number = 0;
    let proposedFixedCapacitance: number = 0;
    let proposedVariableCapacitance: number = 0;
    let capitalCost: number = 0;
    let simplePayback: number = 0;
    if (inputData.monthyInputs.length >= 3){
      inputData.monthyInputs.forEach( input => {
        let monthOutput: PFMonthlyOutputs = this.getEmptyMonthyOutput();
        if(input.powerFactor >= inputData.minimumPowerFactor){
          monthOutput.realDemand = input.actualDemand;
        } else {
          monthOutput.realDemand = input.actualDemand * input.powerFactor / inputData.minimumPowerFactor; 
        }
        monthOutput.demandPenalty = input.actualDemand - monthOutput.realDemand; 
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = monthOutput.realDemand * Math.tan(Math.acos(input.powerFactor)); 
        if (isNaN(monthOutput.currentReactivePower)) {
          monthOutput.currentReactivePower = 0;
        }
        if(input.powerFactor >= inputData.minimumPowerFactor){
          monthOutput.proposedReactivePower = monthOutput.currentReactivePower;
        } else {
          monthOutput.proposedReactivePower = monthOutput.realDemand * Math.tan(Math.acos(inputData.minimumPowerFactor));
        } 
        monthOutput.proposedCapacitance = monthOutput.currentReactivePower - monthOutput.proposedReactivePower;
        monthlyOutputs.push(monthOutput);
      });      
  
      let proposedCapacitanceList: Array<number> = new Array();
      if(monthlyOutputs.length > 0){
        monthlyOutputs.forEach(output =>{
          if (output.penaltyCost !== 0){
            annualPFPenalty += output.penaltyCost;
          } 
          if (output.proposedCapacitance !== 0) {
            proposedCapacitanceList.push(output.proposedCapacitance);
          }
        });
        annualPFPenalty = (annualPFPenalty / monthlyOutputs.length) * 12;
      }
      proposedFixedCapacitance = Math.min(...proposedCapacitanceList);
      proposedVariableCapacitance = Math.max(...proposedCapacitanceList) - proposedFixedCapacitance;
      capitalCost = proposedFixedCapacitance * inputData.costOfStaticCapacitance + proposedVariableCapacitance * inputData.costOfDynamicCapacitance;
      simplePayback = capitalCost / annualPFPenalty;  
    }
    outputData.annualPFPenalty = annualPFPenalty;
    outputData.proposedFixedCapacitance = proposedFixedCapacitance;
    outputData.proposedVariableCapacitance = proposedVariableCapacitance;
    outputData.capitalCost = capitalCost;
    outputData.simplePayback = simplePayback;
    outputData.monthlyOutputs = monthlyOutputs; 
    return outputData;
  }

  calculateRealPowerAndActualDemand(inputData: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs {
    let outputData: PowerFactorCorrectionOutputs = this.getEmptyPowerFactorCorrectionOutputs();
    let monthlyOutputs: Array<PFMonthlyOutputs> = new Array();
    let annualPFPenalty: number = 0;
    let proposedFixedCapacitance: number = 0;
    let proposedVariableCapacitance: number = 0;
    let capitalCost: number = 0;
    let simplePayback: number = 0;
    if (inputData.monthyInputs.length >= 3){
      inputData.monthyInputs.forEach( input => {
        let monthOutput: PFMonthlyOutputs = this.getEmptyMonthyOutput();
        if(input.powerFactor >= inputData.minimumPowerFactor){
          monthOutput.pfAdjustedDemand = input.actualDemand;
        } else {
          monthOutput.pfAdjustedDemand = input.actualDemand * inputData.minimumPowerFactor / input.powerFactor; 
        }
        monthOutput.demandPenalty = monthOutput.pfAdjustedDemand - input.actualDemand;
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.actualDemand * Math.tan(Math.acos(input.powerFactor));
        if (isNaN(monthOutput.currentReactivePower)) {
          monthOutput.currentReactivePower = 0;
        }
        if(input.powerFactor >= inputData.minimumPowerFactor){
          monthOutput.proposedReactivePower = monthOutput.currentReactivePower
        } else {
          monthOutput.proposedReactivePower = input.actualDemand * Math.tan(Math.acos(inputData.minimumPowerFactor));
        }       
        monthOutput.proposedCapacitance = monthOutput.currentReactivePower - monthOutput.proposedReactivePower;
        monthlyOutputs.push(monthOutput);
      });      
  
      let proposedCapacitanceList: Array<number> = new Array();
  
      if(monthlyOutputs.length > 0){
        monthlyOutputs.forEach(output =>{
          if (output.penaltyCost !== 0){
            annualPFPenalty += output.penaltyCost;
          } 
          if (output.proposedCapacitance !== 0) {
            proposedCapacitanceList.push(output.proposedCapacitance);
          }
        });
        annualPFPenalty = (annualPFPenalty / monthlyOutputs.length) * 12;
      }
  
      proposedFixedCapacitance = Math.min(...proposedCapacitanceList);
      proposedVariableCapacitance = Math.max(...proposedCapacitanceList) - proposedFixedCapacitance;
      capitalCost = proposedFixedCapacitance * inputData.costOfStaticCapacitance + proposedVariableCapacitance * inputData.costOfDynamicCapacitance;
      simplePayback = capitalCost / annualPFPenalty;  
      
    }
    outputData.annualPFPenalty = annualPFPenalty;
    outputData.proposedFixedCapacitance = proposedFixedCapacitance;
    outputData.proposedVariableCapacitance = proposedVariableCapacitance;
    outputData.capitalCost = capitalCost;
    outputData.simplePayback = simplePayback;
    outputData.monthlyOutputs = monthlyOutputs; 
    return outputData;
  }

  calculateApparentPowerAndActualDemand(inputData: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs {
    let outputData: PowerFactorCorrectionOutputs = this.getEmptyPowerFactorCorrectionOutputs();
    let monthlyOutputs: Array<PFMonthlyOutputs> = new Array();
    let annualPFPenalty: number = 0;
    let proposedFixedCapacitance: number = 0;
    let proposedVariableCapacitance: number = 0;
    let capitalCost: number = 0;
    let simplePayback: number = 0;
    if (inputData.monthyInputs.length >= 3){
      inputData.monthyInputs.forEach( input => {
        let monthOutput: PFMonthlyOutputs = this.getEmptyMonthyOutput();
        monthOutput.proposedApparentPower = input.powerFactor / inputData.targetPowerFactor;    
        monthOutput.demandPenalty = Math.max(0, input.actualDemand - monthOutput.proposedApparentPower);
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.actualDemand * Math.sin(Math.acos(input.powerFactor/input.actualDemand));      
        monthOutput.proposedReactivePower = Math.min(monthOutput.currentReactivePower, input.powerFactor * Math.tan(Math.acos(inputData.targetPowerFactor)));
        monthOutput.proposedCapacitance = monthOutput.currentReactivePower - monthOutput.proposedReactivePower;
        monthlyOutputs.push(monthOutput);
      });      
  
      let proposedCapacitanceList: Array<number> = new Array();
  
      if(monthlyOutputs.length > 0){
        monthlyOutputs.forEach(output =>{
          if (output.penaltyCost !== 0){
            annualPFPenalty += output.penaltyCost;
          } 
          if (output.proposedCapacitance !== 0) {
            proposedCapacitanceList.push(output.proposedCapacitance);
          }
        });
        annualPFPenalty = (annualPFPenalty / monthlyOutputs.length) * 12;
      }
  
      proposedFixedCapacitance = Math.min(...proposedCapacitanceList);
      proposedVariableCapacitance = Math.max(...proposedCapacitanceList) - proposedFixedCapacitance;
      capitalCost = proposedFixedCapacitance * inputData.costOfStaticCapacitance + proposedVariableCapacitance * inputData.costOfDynamicCapacitance;
      simplePayback = capitalCost / annualPFPenalty;  
      
    }
    outputData.annualPFPenalty = annualPFPenalty;
    outputData.proposedFixedCapacitance = proposedFixedCapacitance;
    outputData.proposedVariableCapacitance = proposedVariableCapacitance;
    outputData.capitalCost = capitalCost;
    outputData.simplePayback = simplePayback;
    outputData.monthlyOutputs = monthlyOutputs; 
    return outputData;
  }

  calculateApparentPowerAndPowerFactor(inputData: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs {
    let outputData: PowerFactorCorrectionOutputs = this.getEmptyPowerFactorCorrectionOutputs();
    let monthlyOutputs: Array<PFMonthlyOutputs> = new Array();
    let annualPFPenalty: number = 0;
    let proposedFixedCapacitance: number = 0;
    let proposedVariableCapacitance: number = 0;
    let capitalCost: number = 0;
    let simplePayback: number = 0;
    if (inputData.monthyInputs.length >= 3){
      inputData.monthyInputs.forEach( input => {
        let monthOutput: PFMonthlyOutputs = this.getEmptyMonthyOutput();
        monthOutput.proposedApparentPower = input.actualDemand * input.powerFactor / inputData.targetPowerFactor;    
        monthOutput.demandPenalty = Math.max(0, input.actualDemand - monthOutput.proposedApparentPower);
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.actualDemand * Math.sin(Math.acos(input.powerFactor));      
        monthOutput.proposedReactivePower = Math.min(monthOutput.currentReactivePower, monthOutput.proposedApparentPower * Math.sin(Math.acos(inputData.targetPowerFactor)));        monthOutput.proposedCapacitance = monthOutput.currentReactivePower - monthOutput.proposedReactivePower;
        monthlyOutputs.push(monthOutput);
      });      
  
      let proposedCapacitanceList: Array<number> = new Array();
  
      if(monthlyOutputs.length > 0){
        monthlyOutputs.forEach(output =>{
          if (output.penaltyCost !== 0){
            annualPFPenalty += output.penaltyCost;
          } 
          if (output.proposedCapacitance !== 0) {
            proposedCapacitanceList.push(output.proposedCapacitance);
          }
        });
        annualPFPenalty = (annualPFPenalty / monthlyOutputs.length) * 12;
      }
  
      proposedFixedCapacitance = Math.min(...proposedCapacitanceList);
      proposedVariableCapacitance = Math.max(...proposedCapacitanceList) - proposedFixedCapacitance;
      capitalCost = proposedFixedCapacitance * inputData.costOfStaticCapacitance + proposedVariableCapacitance * inputData.costOfDynamicCapacitance;
      simplePayback = capitalCost / annualPFPenalty;  
      
    }
    outputData.annualPFPenalty = annualPFPenalty;
    outputData.proposedFixedCapacitance = proposedFixedCapacitance;
    outputData.proposedVariableCapacitance = proposedVariableCapacitance;
    outputData.capitalCost = capitalCost;
    outputData.simplePayback = simplePayback;
    outputData.monthlyOutputs = monthlyOutputs; 
    return outputData;
  }

  calculateRealPowerAndBoth(inputData: PowerFactorCorrectionInputs): PowerFactorCorrectionOutputs {
    let outputData: PowerFactorCorrectionOutputs = this.getEmptyPowerFactorCorrectionOutputs();
    let monthlyOutputs: Array<PFMonthlyOutputs> = new Array();
    let annualPFPenalty: number = 0;
    let proposedFixedCapacitance: number = 0;
    let proposedVariableCapacitance: number = 0;
    let capitalCost: number = 0;
    let simplePayback: number = 0;
    if (inputData.monthyInputs.length >= 3){
      inputData.monthyInputs.forEach( input => {
        let monthOutput: PFMonthlyOutputs = this.getEmptyMonthyOutput();
        // monthOutput.demandPenalty = input.actualDemand - input.pfAdjustedDemand;
        monthOutput.demandPenalty = input.pfAdjustedDemand - input.actualDemand;
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.pfAdjustedDemand * Math.tan(Math.acos(input.powerFactor));  
        if (isNaN(monthOutput.currentReactivePower)) {
          monthOutput.currentReactivePower = 0;
        }
        monthOutput.proposedReactivePower = Math.min(monthOutput.currentReactivePower, input.pfAdjustedDemand * Math.tan(Math.acos(inputData.minimumPowerFactor)));
        monthOutput.proposedCapacitance = monthOutput.currentReactivePower - monthOutput.proposedReactivePower;
        monthlyOutputs.push(monthOutput);
      });      
  
      let proposedCapacitanceList: Array<number> = new Array();
  
      if(monthlyOutputs.length > 0){
        monthlyOutputs.forEach(output =>{ 
          if (output.penaltyCost !== 0){
            annualPFPenalty += output.penaltyCost;
          }
          if (output.proposedCapacitance !== 0) {
            proposedCapacitanceList.push(output.proposedCapacitance);
          }
        });
        annualPFPenalty = (annualPFPenalty / monthlyOutputs.length) * 12;
      }
  
      proposedFixedCapacitance = Math.min(...proposedCapacitanceList);
      proposedVariableCapacitance = Math.max(...proposedCapacitanceList) - proposedFixedCapacitance;
      capitalCost = proposedFixedCapacitance * inputData.costOfStaticCapacitance + proposedVariableCapacitance * inputData.costOfDynamicCapacitance;
      simplePayback = capitalCost / annualPFPenalty;  
      
    }
    outputData.annualPFPenalty = annualPFPenalty;
    outputData.proposedFixedCapacitance = proposedFixedCapacitance;
    outputData.proposedVariableCapacitance = proposedVariableCapacitance;
    outputData.capitalCost = capitalCost;
    outputData.simplePayback = simplePayback;
    outputData.monthlyOutputs = monthlyOutputs; 
    return outputData;
  }




}
