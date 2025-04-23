import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IRRBruteForceResults, CashFlowFinalResults, CashFlowForm, CashFlowOutputs, CashFlowResults, InterestRates, Outputs, WithoutTaxesOutputs } from './cash-flow';
import { TraceData, SimpleChart } from '../../../shared/models/plotting';

@Injectable()
export class CashFlowService {

  calculate: BehaviorSubject<boolean>;
  inputData: CashFlowForm;
  constructor() {
    this.calculate = new BehaviorSubject<boolean>(true);
  }

  getTrace(name: string, data: Array<number>, years: Array<number>): TraceData {
    let trace = {
      x: years,
      y: data,
      type: 'bar',
      name: name,
      hovertemplate: `$%{y:.2r}`,
      showlegend: true,
    };

    return trace;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'Cash Flow',
      data: [],
      layout: {
        hovermode: 'closest',
        barmode: 'relative',
        legend: {
          orientation: 'h',
        },
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: ''
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: '',
          title: {
            text: 'Cost USD (thousands)'
          },
        },
        margin: {
          t: 25,
          b: 75,
          l: 75,
          r: 25
        }
      },
      config: {
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }

  getEmptyOutputs(): Outputs {
    return {
      cashFlowOutputs: [],
      totalOutputs: {
        cashFlow: 0,
        capitalExpenditures: 0,
        energySavings: 0,
        salvage: 0,
        operationCost: 0,
        disposal: 0,
        otherCashFlow: 0,
        total: 0,
        otherSavings: 0,
        otherCosts: 0,
      }
    }
  }

  getEmptyCashFlowOutputs(): CashFlowOutputs {
    return {
      cashFlow: 0,
      capitalExpenditures: 0,
      energySavings: 0,
      salvage: 0,
      operationCost: 0,
      disposal: 0,
      otherCashFlow: 0,
      total: 0,
      otherSavings: 0,
      otherCosts: 0,
    }
  }

  calculateYearlyCashFlowOutputs(inputs: CashFlowForm): Outputs {
    let outputs: Outputs = this.getEmptyOutputs();

    let outputIndex0: CashFlowOutputs = this.getEmptyCashFlowOutputs();
    outputIndex0.capitalExpenditures = -inputs.installationCost;
    outputIndex0.cashFlow = -inputs.installationCost;
    outputs.cashFlowOutputs.push(outputIndex0);
    inputs.advancedCashflows.forEach((cashFlow, index) => {
      let output: CashFlowOutputs = this.getEmptyCashFlowOutputs();
      if (index != inputs.advancedCashflows.length - 1) {
        output.energySavings = inputs.energySavings;
        output.operationCost = -inputs.operationCost;
        output.otherSavings = inputs.otherSavings;
        output.otherCosts = -inputs.otherCost;
        output.otherCashFlow = cashFlow;
        output.cashFlow = inputs.energySavings - inputs.operationCost + cashFlow + inputs.otherSavings - inputs.otherCost;
      } else if (index == inputs.advancedCashflows.length - 1) {
        output.energySavings = inputs.energySavings;
        output.salvage = inputs.salvageInput;
        output.otherSavings = inputs.otherSavings;
        output.otherCosts = -inputs.otherCost;
        output.operationCost = -inputs.operationCost;
        output.disposal = -inputs.junkCost;
        output.otherCashFlow = cashFlow;
        output.cashFlow = inputs.energySavings - inputs.operationCost + cashFlow - inputs.junkCost + inputs.salvageInput + inputs.otherSavings - inputs.otherCost;
      }
      outputs.cashFlowOutputs.push(output);
    });

    outputs.cashFlowOutputs.forEach(output => {
      outputs.totalOutputs.cashFlow += output.cashFlow;
      outputs.totalOutputs.energySavings += output.energySavings;
      outputs.totalOutputs.operationCost += output.operationCost;
      outputs.totalOutputs.otherCashFlow += output.otherCashFlow;
      outputs.totalOutputs.otherCosts += output.otherCosts;
      outputs.totalOutputs.otherSavings += output.otherSavings;
      outputs.totalOutputs.capitalExpenditures += output.capitalExpenditures;
      outputs.totalOutputs.salvage += output.salvage;
      outputs.totalOutputs.disposal += output.disposal;
    });


    return outputs;
  }



  calculatePresentValueCashFlowOutputs(inputs: CashFlowForm, yearlyCashFlowOutputs: Outputs): Outputs {
    let outputs: Outputs = this.getEmptyOutputs();

    yearlyCashFlowOutputs.cashFlowOutputs.forEach((cashFlow, index) => {
      let output: CashFlowOutputs = this.getEmptyCashFlowOutputs();
      output.total = cashFlow.cashFlow / Math.pow((1 + (inputs.discountRate / 100)), index);
      output.energySavings = cashFlow.energySavings / Math.pow((1 + (inputs.discountRate / 100)), index);
      output.operationCost = cashFlow.operationCost / Math.pow((1 + (inputs.discountRate / 100)), index);
      output.otherCashFlow = cashFlow.otherCashFlow / Math.pow((1 + (inputs.discountRate / 100)), index);
      output.otherCosts = cashFlow.otherCosts / Math.pow((1 + (inputs.discountRate / 100)), index);
      output.otherSavings = cashFlow.otherSavings / Math.pow((1 + (inputs.discountRate / 100)), index);
      outputs.cashFlowOutputs.push(output);
    });

    outputs.cashFlowOutputs.forEach(output => {
      outputs.totalOutputs.total += output.total;
      outputs.totalOutputs.energySavings += output.energySavings;
      outputs.totalOutputs.operationCost += output.operationCost;
      outputs.totalOutputs.otherCashFlow += output.otherCashFlow;
      outputs.totalOutputs.otherCosts += output.otherCosts;
      outputs.totalOutputs.otherSavings += output.otherSavings;
    });

    outputs.totalOutputs.capitalExpenditures = -inputs.installationCost;
    outputs.totalOutputs.salvage = inputs.salvageInput / Math.pow((1 + (inputs.discountRate / 100)), inputs.lifeYears);
    outputs.totalOutputs.disposal = -inputs.junkCost / Math.pow((1 + (inputs.discountRate / 100)), inputs.lifeYears)

    return outputs;
  }

  getEmptyWithoutTaxesOutputs(): WithoutTaxesOutputs {
    return {
      cashFlowOutputs: this.getEmptyCashFlowOutputs(),
      net: 0,
      simplePayback: 0,
      simplePaybackWithCostsSavings: 0,
      sir: 0,
      roi: 0,
      interestRate: 0,
      nvp: 0,
      irr: 0,
    }

  }

  calculateWithoutTaxesPresentValueOutputs(presentValueCashFlowOutputs: Outputs, bruteForceResults: Array<IRRBruteForceResults>): WithoutTaxesOutputs {
    let withoutTaxesPresentValueOutputs: WithoutTaxesOutputs = this.getEmptyWithoutTaxesOutputs();

    withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings = presentValueCashFlowOutputs.totalOutputs.energySavings;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage = presentValueCashFlowOutputs.totalOutputs.salvage;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost = presentValueCashFlowOutputs.totalOutputs.operationCost;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal = presentValueCashFlowOutputs.totalOutputs.disposal;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow = presentValueCashFlowOutputs.totalOutputs.otherCashFlow;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCosts = presentValueCashFlowOutputs.totalOutputs.otherCosts;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.otherSavings = presentValueCashFlowOutputs.totalOutputs.otherSavings;

    withoutTaxesPresentValueOutputs.net = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures + presentValueCashFlowOutputs.totalOutputs.energySavings + presentValueCashFlowOutputs.totalOutputs.salvage + presentValueCashFlowOutputs.totalOutputs.operationCost + presentValueCashFlowOutputs.totalOutputs.disposal + presentValueCashFlowOutputs.totalOutputs.otherCashFlow + presentValueCashFlowOutputs.totalOutputs.otherCosts + presentValueCashFlowOutputs.totalOutputs.otherSavings;


    let sumContinueA: number = 0;
    let sumIterationA: number = 0;
    let sumContinueB: number = 0;
    let sumIterationB: number = 0;
    bruteForceResults.forEach(result => {
      //sumContinueA += result.continueA;
      sumIterationA += result.iterationA;
      //sumContinueB += result.continueB;
      sumIterationB += result.iterationB;
    });

    let continueAList = bruteForceResults.map(result => result.continueA);
    sumContinueA = this.sumSkippingNaN(continueAList);
    let continueBList = bruteForceResults.map(result => result.continueB);  
    sumContinueB = this.sumSkippingNaN(continueBList);

    withoutTaxesPresentValueOutputs.interestRate = sumContinueA;
    withoutTaxesPresentValueOutputs.nvp = sumContinueB;

    let withoutTaxesAnnualWorthOutputsInterestRate: number = sumIterationA;
    let withoutTaxesAnnualWorthOutputsNVP: number = sumIterationB;

    withoutTaxesPresentValueOutputs.irr = withoutTaxesPresentValueOutputs.interestRate - ((withoutTaxesPresentValueOutputs.nvp - 0) / (withoutTaxesPresentValueOutputs.nvp - withoutTaxesAnnualWorthOutputsNVP)) * (withoutTaxesPresentValueOutputs.interestRate - withoutTaxesAnnualWorthOutputsInterestRate);

    return withoutTaxesPresentValueOutputs;
  }


  sumSkippingNaN(numbers: number[]): number {
    return numbers.reduce((acc, num) => {
      return isNaN(num) ? acc : acc + num;
    }, 0);
  }



  calculateWithoutTaxesAnnualWorthOutputs(inputs: CashFlowForm, withoutTaxesPresentValueOutputs: WithoutTaxesOutputs, bruteForceResults: Array<IRRBruteForceResults>): WithoutTaxesOutputs {

    let withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs = this.getEmptyWithoutTaxesOutputs();

    const factor = (inputs.discountRate / 100) * Math.pow((1 + (inputs.discountRate / 100)), inputs.lifeYears) / (Math.pow((1 + (inputs.discountRate / 100)), inputs.lifeYears) - 1);

    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures = withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage = withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost = withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal = withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCosts = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCosts * factor;
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherSavings = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherSavings * factor;
    withoutTaxesAnnualWorthOutputs.net = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCosts + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherSavings;

    withoutTaxesAnnualWorthOutputs.simplePayback = inputs.installationCost / inputs.energySavings;
    withoutTaxesAnnualWorthOutputs.simplePaybackWithCostsSavings = -withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures / (withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow);


    let sirSum1: number = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage + (withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0);
    let sirSum2: number = -withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures + -withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost + -withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal + (withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0);
    withoutTaxesAnnualWorthOutputs.sir = sirSum1 / sirSum2;

    withoutTaxesAnnualWorthOutputs.roi = -withoutTaxesAnnualWorthOutputs.net / withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures;

    let sumIterationA: number = 0;
    let sumIterationB: number = 0;
    bruteForceResults.forEach(result => {
      sumIterationA += result.iterationA;
      sumIterationB += result.iterationB;
    });

    withoutTaxesAnnualWorthOutputs.interestRate = sumIterationA;
    withoutTaxesAnnualWorthOutputs.nvp = sumIterationB;

    return withoutTaxesAnnualWorthOutputs;

  }


  getEmptybruteForceResult(): IRRBruteForceResults {
    return {
      interestRate: 0,
      results: [],
      total: 0,
      continueA: 0,
      iterationA: 0,
      continueB: 0,
      iterationB: 0,
    }


  }

  calculateIRRBruteForceResults(inputs: CashFlowForm, yearlyCashFlowOutputs: Outputs): Array<IRRBruteForceResults> {

    let irrBruteForceResults: Array<IRRBruteForceResults> = [];

    InterestRates.forEach(rate => {
      let results: IRRBruteForceResults = this.getEmptybruteForceResult();
      results.interestRate = rate;
      let total: number = 0;
      yearlyCashFlowOutputs.cashFlowOutputs.forEach((cashflow, index) => {
        let yearResult: number;
        yearResult = cashflow.cashFlow / Math.pow((1 + rate), index);
        total += yearResult;
        results.results.push(yearResult);
      });
      results.total = total;

      irrBruteForceResults.push(results);

    });

    let previousContinueA = 0;
    irrBruteForceResults.forEach(results => {
      results.continueA = results.total > 0 ? 0 : (previousContinueA === 0 ? results.interestRate : NaN);
      results.continueB = results.total > 0 ? 0 : (previousContinueA === 0 ? results.total : NaN);
      previousContinueA = results.continueA;
    });

    irrBruteForceResults.forEach((results, index) => {
      let nextIndex = index + 1;
      if (nextIndex >= irrBruteForceResults.length) return;
      let nextContinueA: number = irrBruteForceResults[nextIndex].continueA;
      results.iterationA = nextContinueA !== 0 ? (results.continueA === 0 ? results.interestRate : 0) : 0;
      results.iterationB = nextContinueA !== 0 ? (results.continueA === 0 ? results.total : 0) : 0;
    });

    return irrBruteForceResults;
  }

  getEmptyCashFlowResults(): CashFlowResults {
    return {
      benefits: 0,
      cost: 0,
      results: 0,
      totalCosts: 0,
      capital: 0,
      operating: 0,
      disposal: 0,
      otherCosts: 0,
      totalSavings: 0,
      energy: 0,
      otherSavings: 0,
      salvage: 0,
      payback: 0,
    }

  }

  calculatePresentValueCashFlowResults(withoutTaxesPresentValueOutputs: WithoutTaxesOutputs): CashFlowResults {

    let presentValueCashFlowResults: CashFlowResults = this.getEmptyCashFlowResults();

    let otherCosts: number = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow < 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0;
    let otherSavings: number = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0;

    presentValueCashFlowResults.capital = -withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures;
    presentValueCashFlowResults.operating = -withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost;
    presentValueCashFlowResults.disposal = -withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal;
    presentValueCashFlowResults.otherCosts = -(otherCosts + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCosts);

    presentValueCashFlowResults.totalCosts = presentValueCashFlowResults.capital + presentValueCashFlowResults.operating + presentValueCashFlowResults.disposal + otherCosts + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCosts;

    presentValueCashFlowResults.energy = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings;
    presentValueCashFlowResults.otherSavings = otherSavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherSavings;
    presentValueCashFlowResults.salvage = withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage;

    presentValueCashFlowResults.totalSavings = presentValueCashFlowResults.energy + presentValueCashFlowResults.salvage + otherSavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherSavings;




    return presentValueCashFlowResults;
  }


  calculateAnnualWorthCashFlowResults(withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs): CashFlowResults {

    let annualWorthCashFlowResults: CashFlowResults = this.getEmptyCashFlowResults();

    let otherCosts: number = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow < 0 ? withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow : 0;
    let otherSavings: number = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow : 0;

    annualWorthCashFlowResults.capital = -withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures;
    annualWorthCashFlowResults.operating = -withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost;
    annualWorthCashFlowResults.disposal = -withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal;
    annualWorthCashFlowResults.otherCosts = -(otherCosts + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCosts);

    annualWorthCashFlowResults.totalCosts = annualWorthCashFlowResults.capital + annualWorthCashFlowResults.operating + annualWorthCashFlowResults.disposal + otherCosts + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCosts;


    annualWorthCashFlowResults.energy = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings;
    annualWorthCashFlowResults.otherSavings = otherSavings + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherSavings;
    annualWorthCashFlowResults.salvage = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage;

    annualWorthCashFlowResults.totalSavings = annualWorthCashFlowResults.energy + annualWorthCashFlowResults.salvage + otherSavings + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherSavings;



    return annualWorthCashFlowResults;
  }


  getEmptyCashFlowFinalResults(): CashFlowFinalResults {

    return {
      netPresentValue: 0,
      annualWorth: 0,
      payback: 0,
      sir: 0,
      irr: 0,
      roi: 0,
    }
  }

  calculateCashFlowFinalResults(presentValueCashFlowResults: CashFlowResults, annualWorthCashFlowResults: CashFlowResults, withoutTaxesPresentValueOutputs: WithoutTaxesOutputs, withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs): CashFlowFinalResults {

    let fianlResults: CashFlowFinalResults = this.getEmptyCashFlowFinalResults();


    fianlResults.netPresentValue = presentValueCashFlowResults.totalSavings - presentValueCashFlowResults.totalCosts;
    fianlResults.annualWorth = annualWorthCashFlowResults.totalSavings - annualWorthCashFlowResults.totalCosts;
    fianlResults.payback = withoutTaxesAnnualWorthOutputs.simplePayback;

    fianlResults.sir = withoutTaxesAnnualWorthOutputs.sir;
    fianlResults.irr = withoutTaxesPresentValueOutputs.irr * 100;
    fianlResults.roi = withoutTaxesAnnualWorthOutputs.roi * 100;

    return fianlResults;
  }




}


export interface Expense {
  name: string,
  data: Array<number>
};