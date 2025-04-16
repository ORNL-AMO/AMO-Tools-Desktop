import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BruteForceResults, CashFlowFinalResults, CashFlowForm, CashFlowOutputs, CashFlowResults, InterestRates, Outputs, WithoutTaxesOutputs } from './cash-flow';
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
      cashFlowOutputs: [
        {
          cashFlow: 0,
          capitalExpenditures: 0,
          energySavings: 0,
          salvage: 0,
          operationCost: 0,
          disposal: 0,
          otherCashFlow: 0,
          total: 0,
        }
      ],
      totalOutputs: {
        cashFlow: 0,
        capitalExpenditures: 0,
        energySavings: 0,
        salvage: 0,
        operationCost: 0,
        disposal: 0,
        otherCashFlow: 0,
        total: 0,
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
    }
  }

  calculateYearlyCashFlowOutputs(inputs: CashFlowForm): Outputs {
    let outputs: Outputs = this.getEmptyOutputs();

    inputs.advancedCashflows.forEach(cashFlow => {
      let output: CashFlowOutputs = this.getEmptyCashFlowOutputs();
      output.energySavings = inputs.energySavings;
      output.operationCost = inputs.operationCost;
      output.otherCashFlow = cashFlow;
      output.cashFlow = inputs.energySavings + inputs.operationCost + cashFlow;
      outputs.cashFlowOutputs.push(output);
    });

    outputs.cashFlowOutputs.forEach(year => {
      outputs.totalOutputs.cashFlow += year.cashFlow;
      outputs.totalOutputs.energySavings += year.energySavings;
      outputs.totalOutputs.operationCost += year.operationCost;
      outputs.totalOutputs.otherCashFlow += year.otherCashFlow;
    });

    outputs.totalOutputs.capitalExpenditures = inputs.installationCost;
    outputs.totalOutputs.salvage = inputs.salvageInput;
    outputs.totalOutputs.disposal = inputs.junkCost;

    return outputs;
  }



  calculatePresentValueCashFlowOutputs(inputs: CashFlowForm, yearlyCashFlowOutputs: Outputs): Outputs {
    let outputs: Outputs = this.getEmptyOutputs();

    let year = 1;
    yearlyCashFlowOutputs.cashFlowOutputs.forEach(cashFlow => {
      let output: CashFlowOutputs = this.getEmptyCashFlowOutputs();
      output.total = cashFlow.cashFlow / ((1 + (inputs.discountRate / 100)) ^ year);
      output.energySavings = cashFlow.energySavings / ((1 + (inputs.discountRate / 100)) ^ year);
      output.operationCost = cashFlow.operationCost / ((1 + (inputs.discountRate / 100)) ^ year);
      output.otherCashFlow = cashFlow.otherCashFlow / ((1 + (inputs.discountRate / 100)) ^ year);
      outputs.cashFlowOutputs.push(output);
      year++;
    });

    outputs.cashFlowOutputs.forEach(year => {
      outputs.totalOutputs.total += year.total;
      outputs.totalOutputs.energySavings += year.energySavings;
      outputs.totalOutputs.operationCost += year.operationCost;
      outputs.totalOutputs.otherCashFlow += year.otherCashFlow;
    });

    outputs.totalOutputs.capitalExpenditures = inputs.installationCost;
    outputs.totalOutputs.salvage = inputs.salvageInput / ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears);
    outputs.totalOutputs.disposal = inputs.junkCost / ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears)

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

  calculateWithoutTaxesPresentValueOutputs(presentValueCashFlowOutputs: Outputs, bruteForceResults: Array<BruteForceResults>): WithoutTaxesOutputs {
    let withoutTaxesPresentValueOutputs: WithoutTaxesOutputs = this.getEmptyWithoutTaxesOutputs();

    withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings = presentValueCashFlowOutputs.totalOutputs.energySavings;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage = presentValueCashFlowOutputs.totalOutputs.salvage;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost = presentValueCashFlowOutputs.totalOutputs.operationCost;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal = presentValueCashFlowOutputs.totalOutputs.disposal;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow = presentValueCashFlowOutputs.totalOutputs.otherCashFlow;

    withoutTaxesPresentValueOutputs.net = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures + presentValueCashFlowOutputs.totalOutputs.energySavings + presentValueCashFlowOutputs.totalOutputs.salvage + presentValueCashFlowOutputs.totalOutputs.operationCost + presentValueCashFlowOutputs.totalOutputs.disposal + presentValueCashFlowOutputs.totalOutputs.otherCashFlow;


    let sumContinueA: number = 0;
    let sumIterationA: number = 0;
    let sumContinueB: number = 0;
    let sumIterationB: number = 0;
    bruteForceResults.forEach(result => {
      sumContinueA += result.continueA;
      sumIterationA += result.iterationA;
      sumContinueB += result.continueB;
      sumIterationB += result.iterationB;
    });


    withoutTaxesPresentValueOutputs.interestRate = sumContinueA;
    withoutTaxesPresentValueOutputs.nvp = sumContinueB;

    let withoutTaxesAnnualWorthOutputsInterestRate: number = sumIterationA;
    let withoutTaxesAnnualWorthOutputsNVP: number = sumIterationB;

    withoutTaxesPresentValueOutputs.irr = withoutTaxesPresentValueOutputs.interestRate - ((withoutTaxesPresentValueOutputs.nvp - 0) / (withoutTaxesPresentValueOutputs.nvp - withoutTaxesAnnualWorthOutputsNVP)) * (withoutTaxesPresentValueOutputs.interestRate - withoutTaxesAnnualWorthOutputsInterestRate);

    return withoutTaxesPresentValueOutputs;
  }


  calculateWithoutTaxesAnnualWorthOutputs(inputs: CashFlowForm, withoutTaxesPresentValueOutputs: WithoutTaxesOutputs, bruteForceResults: Array<BruteForceResults>): WithoutTaxesOutputs {

    let withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs = this.getEmptyWithoutTaxesOutputs();

    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures = withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage = withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost = withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal = withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));
    withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow * ((inputs.discountRate / 100) * ((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) / (((1 + (inputs.discountRate / 100)) ^ inputs.lifeYears) - 1));

    withoutTaxesAnnualWorthOutputs.net = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal + withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow;

    withoutTaxesAnnualWorthOutputs.simplePayback = inputs.installationCost / inputs.energySavings;
    withoutTaxesAnnualWorthOutputs.simplePaybackWithCostsSavings = -withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures / (withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost + withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow);


    let sum1: number = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings + withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage + (withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0);
    let sum2: number = -withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures + -withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost + -withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal + (withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0);
    withoutTaxesAnnualWorthOutputs.sir = sum1 / sum2;

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

  getEmptybruteForceResults(): Array<BruteForceResults> {
    return [
      {
        interestRate: 0,
        results: [0],
        total: 0,
        continueA: 0,
        iterationA: 0,
        continueB: 0,
        iterationB: 0,
      }
    ]

  }

  getEmptybruteForceResult(): BruteForceResults {
    return {
      interestRate: 0,
      results: [0],
      total: 0,
      continueA: 0,
      iterationA: 0,
      continueB: 0,
      iterationB: 0,
    }


  }

  calculateBruteForceResults(inputs: CashFlowForm, yearlyCashFlowOutputs: Outputs): Array<BruteForceResults> {

    let bruteForceResults: Array<BruteForceResults> = this.getEmptybruteForceResults();

    InterestRates.forEach((rate, index) => {
      let results: BruteForceResults = this.getEmptybruteForceResult();
      results.interestRate = rate;
      let total: number = 0;
      yearlyCashFlowOutputs.cashFlowOutputs.forEach(cashflow => {
        let yearResult: number;
        if (index == 0) {
          yearResult = inputs.installationCost / ((1 + rate) ^ index);
        } else {
          yearResult = cashflow.cashFlow / ((1 + rate) ^ index);
        }
        total += yearResult;
        results.results.push(yearResult);
      });
      results.total = total;

      bruteForceResults.push(results);

    });

    let previousContinueA = 0;
    bruteForceResults.forEach(results => {
      results.continueA = results.total > 0 ? 0 : (previousContinueA === 0 ? results.interestRate : 0);
      results.continueB = results.total > 0 ? 0 : (previousContinueA === 0 ? results.total : 0);
      previousContinueA = results.continueA;
    });

    let index: number = 1;
    bruteForceResults.forEach(results => {
      let nextContinueA: number = bruteForceResults[index].continueA;
      results.iterationA = nextContinueA !== 0 ? (results.continueA === 0 ? results.interestRate : 0) : 0;
      results.iterationB = nextContinueA !== 0 ? (results.continueA === 0 ? results.total : 0) : 0;
    });

    return bruteForceResults
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
      other: 0,
      totalSavings: 0,
      energy: 0,
      otherCashFlow: 0,
      salvage: 0,
      payback: 0,
    }

  }

  calculatePresentValueCashFlowResults(withoutTaxesPresentValueOutputs: WithoutTaxesOutputs): CashFlowResults {

    let presentValueCashFlowResults: CashFlowResults = this.getEmptyCashFlowResults();

    presentValueCashFlowResults.capital = withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures;
    presentValueCashFlowResults.operating = withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost;
    presentValueCashFlowResults.disposal = withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal;
    presentValueCashFlowResults.other = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow < 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0;

    presentValueCashFlowResults.totalCosts = presentValueCashFlowResults.capital + presentValueCashFlowResults.operating + presentValueCashFlowResults.disposal + presentValueCashFlowResults.other;

    presentValueCashFlowResults.energy = withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings;
    presentValueCashFlowResults.otherCashFlow = withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow : 0;
    presentValueCashFlowResults.salvage = withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage;

    presentValueCashFlowResults.totalSavings = presentValueCashFlowResults.energy + presentValueCashFlowResults.otherCashFlow + presentValueCashFlowResults.salvage;




    return presentValueCashFlowResults;
  }


  calculateAnnualWorthCashFlowResults(withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs): CashFlowResults {

    let annualWorthCashFlowResults: CashFlowResults = this.getEmptyCashFlowResults();

    annualWorthCashFlowResults.capital = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.capitalExpenditures;
    annualWorthCashFlowResults.operating = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.operationCost;
    annualWorthCashFlowResults.disposal = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.disposal;
    annualWorthCashFlowResults.other = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow < 0 ? withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow : 0;

    annualWorthCashFlowResults.totalCosts = annualWorthCashFlowResults.capital + annualWorthCashFlowResults.operating + annualWorthCashFlowResults.disposal + annualWorthCashFlowResults.other;


    annualWorthCashFlowResults.energy = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.energySavings;
    annualWorthCashFlowResults.otherCashFlow = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow > 0 ? withoutTaxesAnnualWorthOutputs.cashFlowOutputs.otherCashFlow : 0;
    annualWorthCashFlowResults.salvage = withoutTaxesAnnualWorthOutputs.cashFlowOutputs.salvage;

    annualWorthCashFlowResults.totalSavings = annualWorthCashFlowResults.energy + annualWorthCashFlowResults.otherCashFlow + annualWorthCashFlowResults.salvage;



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
    fianlResults.irr = withoutTaxesPresentValueOutputs.irr;
    fianlResults.roi = withoutTaxesAnnualWorthOutputs.roi;

    return fianlResults;
  }




}


export interface Expense {
  name: string,
  data: Array<number>
};