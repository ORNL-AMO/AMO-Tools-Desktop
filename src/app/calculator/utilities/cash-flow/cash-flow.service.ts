import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BruteForceResult, CashFlowForm, CashFlowOutputs, Outputs, WithoutTaxesOutputs } from './cash-flow';
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

  calculateYearlyCashFlowOutputs(inputs: CashFlowForm): Outputs {
    let outputs: Outputs;

    inputs.advancedCashflows.forEach(cashFlow => {
      let output: CashFlowOutputs;
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
    let outputs: Outputs;

    let year = 1;
    yearlyCashFlowOutputs.cashFlowOutputs.forEach(cashFlow => {
      let output: CashFlowOutputs;
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

  calculateWithoutTaxesPresentValueOutputs(presentValueCashFlowOutputs: Outputs): WithoutTaxesOutputs {
    let withoutTaxesPresentValueOutputs: WithoutTaxesOutputs;

    withoutTaxesPresentValueOutputs.cashFlowOutputs.capitalExpenditures = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.energySavings = presentValueCashFlowOutputs.totalOutputs.energySavings;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.salvage = presentValueCashFlowOutputs.totalOutputs.salvage;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.operationCost = presentValueCashFlowOutputs.totalOutputs.operationCost;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.disposal = presentValueCashFlowOutputs.totalOutputs.disposal;
    withoutTaxesPresentValueOutputs.cashFlowOutputs.otherCashFlow = presentValueCashFlowOutputs.totalOutputs.otherCashFlow;

    withoutTaxesPresentValueOutputs.net = presentValueCashFlowOutputs.totalOutputs.capitalExpenditures + presentValueCashFlowOutputs.totalOutputs.energySavings + presentValueCashFlowOutputs.totalOutputs.salvage + presentValueCashFlowOutputs.totalOutputs.operationCost + presentValueCashFlowOutputs.totalOutputs.disposal + presentValueCashFlowOutputs.totalOutputs.otherCashFlow;


    //TODO calulations using brute force outputs



    //withoutTaxesPresentValueOutputs.irr = withoutTaxesPresentValueOutputs.interestRate - ((withoutTaxesPresentValueOutputs.nvp - 0) / (withoutTaxesPresentValueOutputs.nvp - withoutTaxesAnnualWorthOutputs.nvp)) * (withoutTaxesPresentValueOutputs.interestRate - withoutTaxesAnnualWorthOutputs.interestRate);

    return withoutTaxesPresentValueOutputs;
  }


  calculateWithoutTaxesAnnualWorthOutputs(inputs: CashFlowForm, withoutTaxesPresentValueOutputs: WithoutTaxesOutputs): WithoutTaxesOutputs {

    let withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs;

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



    return withoutTaxesAnnualWorthOutputs;

  }

  calculateBruteForceResults(inputs: CashFlowForm, yearlyCashFlowOutputs: Outputs): Array<BruteForceResult> {

    let bruteForceResults: Array<BruteForceResult>;

    //let interestRate: number = 0;
    let year: number = 0;


    for (let interestRate = 0; interestRate < 0.4; interestRate + 0.005) {
      let results: BruteForceResult;
      results.interestRate = interestRate;
      let total: number = 0;
      yearlyCashFlowOutputs.cashFlowOutputs.forEach(cashflow => {
        let yearResult: number;
        if (year == 0) {
          yearResult = inputs.installationCost / ((1 + interestRate) ^ year);
        } else {
          yearResult = cashflow.cashFlow / ((1 + interestRate) ^ year);
        }
        total += yearResult;
        results.results.push(yearResult);
      });
      results.total = total;

      //TODO figure out what S35 is and S37
      let previousContinueA  = 0;
      let nextContinueA = 0;
      results.continueA = total > 0 ? 0 : (previousContinueA === 0 ? interestRate : undefined);
      results.iterationA = nextContinueA !== 0 ? (results.continueA === 0 ? interestRate : 0) : 0;

      bruteForceResults.push(results);
    }







    return bruteForceResults

  }







}


export interface Expense {
  name: string,
  data: Array<number>
};