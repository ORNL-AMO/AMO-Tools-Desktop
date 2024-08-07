import { Injectable } from '@angular/core';
import { MonthyInputs, PFMonthlyOutputs, PowerFactorCorrectionInputs, PowerFactorCorrectionOutputs } from './power-factor-correction.component';

@Injectable()
export class PowerFactorCorrectionService {
  inputData: PowerFactorCorrectionInputs;
  constructor() { }

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
          input1: 462,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'February 2024',
          input1: 528,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'March 2024',
          input1: 492,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'April 2024',
          input1: 474,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'May 2024',
          input1: 499,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'June 2024',
          input1: 513,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'July 2024',
          input1: 530,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'August 2024',
          input1: 523,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'September 2024',
          input1: 547,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'October 2024',
          input1: 589,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'November 2024',
          input1: 621,
          input2: 0.8,
          input3: 0
        },
        {
          month: 'December 2024',
          input1: 607,
          input2: 0.8,
          input3: 0
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
          input1: 0,
          input2: 0,
          input3: 0
        },
        {
          month: 'February 2024',
          input1: 0,
          input2: 0,
          input3: 0
        },
        {
          month: 'March 2024',
          input1: 0,
          input2: 0,
          input3: 0
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
        monthOutput.realDemand = input.input1 * input.input2 / inputData.minimumPowerFactor;    
        monthOutput.demandPenalty = input.input1 - monthOutput.realDemand; 
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = monthOutput.realDemand * Math.tan(Math.acos(input.input2));  
        monthOutput.proposedReactivePower = monthOutput.realDemand * Math.tan(Math.acos(inputData.minimumPowerFactor));
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
        monthOutput.pfAdjustedDemand = input.input1 * inputData.minimumPowerFactor / input.input2;    
        monthOutput.demandPenalty = monthOutput.pfAdjustedDemand - input.input1;
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.input1 * Math.tan(Math.acos(input.input2));      
        monthOutput.proposedReactivePower = input.input1 * Math.tan(Math.acos(inputData.minimumPowerFactor));
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
        monthOutput.proposedApparentPower = input.input2 / inputData.targetPowerFactor;    
        monthOutput.demandPenalty =  input.input1 - monthOutput.proposedApparentPower;
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.input1 * Math.sin(Math.acos(input.input2/input.input1));      
        monthOutput.proposedReactivePower = input.input2 * Math.tan(Math.acos(inputData.targetPowerFactor));
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
        monthOutput.proposedApparentPower = input.input1 * input.input2 / inputData.targetPowerFactor;    
        monthOutput.demandPenalty =  input.input1 - monthOutput.proposedApparentPower;
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.input1 * Math.sin(Math.acos(input.input2));      
        monthOutput.proposedReactivePower = monthOutput.proposedApparentPower * Math.sin(Math.acos(inputData.targetPowerFactor));
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
        monthOutput.demandPenalty = input.input1 - input.input3; 
        monthOutput.penaltyCost = monthOutput.demandPenalty * inputData.marginalCostOfDemand;
        monthOutput.currentReactivePower = input.input3 * Math.tan(Math.acos(input.input2));  
        monthOutput.proposedReactivePower = input.input3 * Math.tan(Math.acos(inputData.minimumPowerFactor));
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
