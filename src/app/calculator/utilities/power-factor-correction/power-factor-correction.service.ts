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
          actualDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        },
        {
          actualDemand: 0,
          pfAdjustedDemand: 0,
          proposedApparentPower: 0,
          demandPenalty: 0,
          penaltyCost: 0,
          currentReactivePower: 0,
          proposedReactivePower: 0,
          proposedCapacitance: 0,
        },
        {
          actualDemand: 0,
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
      actualDemand: 0,
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
          actualDemand: 0,
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
            actualDemand: 0,
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
        inputData.monthyInputs.map(m => this.formBuilder.group({
          month: [m.month, Validators.required],
          actualDemand: [m.actualDemand, [Validators.required, Validators.min(0)]],
          powerFactor: [m.powerFactor, [Validators.required, Validators.min(0), Validators.max(1)]],
          pfAdjustedDemand: [m.pfAdjustedDemand, [Validators.required, Validators.min(0)]]
        }))
      ),
      startMonth: [inputData.startMonth],
      startYear: [inputData.startYear]
    }, { validators: this.powerFactorFormValidator() });

    return form;
  }


  powerFactorFormValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const billedForDemand = form.get('billedForDemand')?.value;
      const adjustedOrActual = form.get('adjustedOrActual')?.value;
      const monthyInputs = form.get('monthyInputs') as FormArray;

      for (let i = 0; i < monthyInputs.length; i++) {
        const group = monthyInputs.at(i) as FormGroup;
        const actualDemandCtrl = group.get('actualDemand');
        const powerFactorCtrl = group.get('powerFactor');
        const pfAdjustedDemandCtrl = group.get('pfAdjustedDemand');

        if (billedForDemand == BilledForDemand.REAL_POWER && adjustedOrActual == AdjustedOrActual.POWER_FACTOR && powerFactorCtrl.value > pfAdjustedDemandCtrl.value) {
          this.setCustomError(pfAdjustedDemandCtrl, 'customPowerFactorError', 'Power Factor cannot be greater than PF Adjusted Demand');
          this.setCustomError(powerFactorCtrl, 'customPowerFactorError', 'Power Factor cannot be greater than PF Adjusted Demand');
        } else if (billedForDemand == BilledForDemand.APPARENT_POWER && adjustedOrActual == AdjustedOrActual.ACTUAL_DEMAND && actualDemandCtrl.value < pfAdjustedDemandCtrl.value) {
          this.setCustomError(actualDemandCtrl, 'customDemandError', 'Actual Demand cannot be less than Apparent Power');
          this.setCustomError(pfAdjustedDemandCtrl, 'customDemandError', 'Actual Demand cannot be less than Apparent Power');
        } else {
          this.setCustomError(powerFactorCtrl, 'customPowerFactorError', null);
          this.setCustomError(pfAdjustedDemandCtrl, 'customPowerFactorError', null);
          this.setCustomError(actualDemandCtrl, 'customDemandError', null);
          this.setCustomError(pfAdjustedDemandCtrl, 'customDemandError', null);
        }
      }

      return null;
    };
  }

  // * preserve ng built in validator errors
  setCustomError = (ctrl: AbstractControl, errorKey: string, message: string | null) => {
    const errors = { ...ctrl.errors };
    if (message) {
      ctrl.setErrors({ ...errors, [errorKey]: message });
    } else {
      const { [errorKey]: _, ...rest } = errors;
      ctrl.setErrors(Object.keys(rest).length ? rest : null);
    }
  };

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
          monthOutput.actualDemand = input.actualDemand;
        } else {
          monthOutput.actualDemand = input.actualDemand * input.powerFactor / inputData.minimumPowerFactor; 
        }
        monthOutput.demandPenalty = input.actualDemand - monthOutput.actualDemand; 
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = monthOutput.actualDemand * Math.tan(Math.acos(input.powerFactor)); 
        if (isNaN(monthOutput.currentReactivePower)) {
          monthOutput.currentReactivePower = 0;
        }
        if(input.powerFactor >= inputData.minimumPowerFactor){
          monthOutput.proposedReactivePower = monthOutput.currentReactivePower;
        } else {
          monthOutput.proposedReactivePower = monthOutput.actualDemand * Math.tan(Math.acos(inputData.minimumPowerFactor));
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


export enum BilledForDemand  {
    REAL_POWER = 0,
    APPARENT_POWER = 1
}

export enum AdjustedOrActual {
    POWER_FACTOR = 0,
    ACTUAL_DEMAND = 1,
    BOTH = 2
}