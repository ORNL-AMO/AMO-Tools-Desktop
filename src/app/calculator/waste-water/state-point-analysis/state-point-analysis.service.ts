import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { StatePointAnalysisInput, StatePointAnalysisOutput, StatePointAnalysisResults } from '../../../shared/models/waste-water';
import { StatePointAnalysisFormService } from './state-point-analysis-form.service';
declare var sviAddon: any;

@Injectable()
export class StatePointAnalysisService {
  baselineData: BehaviorSubject<StatePointAnalysisInput>;
  modificationData: BehaviorSubject<StatePointAnalysisInput>;
  output: BehaviorSubject<StatePointAnalysisOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  sviParameters: Array<{ value: number, display: string }>

  constructor(private convertUnitsService: ConvertUnitsService,
              private statePointAnalysisFormService: StatePointAnalysisFormService,
              ) {
    this.baselineData = new BehaviorSubject<StatePointAnalysisInput>(undefined);
    this.modificationData = new BehaviorSubject<StatePointAnalysisInput>(undefined);
    this.output = new BehaviorSubject<StatePointAnalysisOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);

    this.sviParameters = [
      {
        value: 0,
        display: 'SVISN'
      },
      {
        value: 1,
        display: 'SVIGN'
      },
      {
        value: 2,
        display: 'SVIGS'
      },
      {
        value: 3,
        display: 'SVISS'
      },
      {
        value: 4,
        display: 'VoK'
      }
    ];
  }

  calculate(settings: Settings) {
    let baselineInputs: StatePointAnalysisInput = this.baselineData.getValue();
    let modificationInputs: StatePointAnalysisInput = this.modificationData.getValue();
    
    this.initDefaultEmptyOutput();
    let output: StatePointAnalysisOutput = this.output.getValue();
    
    let validBaseline = this.statePointAnalysisFormService.getFormFromInput(baselineInputs).valid;
    if (validBaseline) {
      let baselineInputCopy = JSON.parse(JSON.stringify(baselineInputs));
      baselineInputCopy = this.convertStatePointAnalysisInput(baselineInputCopy, settings);
      
      let baselineResults: StatePointAnalysisResults = sviAddon.svi(baselineInputCopy);
      baselineResults = this.convertStatePointAnalysisResults(baselineResults, settings);
      output.baseline = baselineResults;
      output.sviParameterName = this.sviParameters[baselineInputs.sviParameter].display;
      if (modificationInputs) {
        let validModification = this.statePointAnalysisFormService.getFormFromInput(modificationInputs).valid;
        if (validModification) {
          let modificationInputCopy = JSON.parse(JSON.stringify(modificationInputs));
          modificationInputCopy = this.convertStatePointAnalysisInput(modificationInputCopy, settings);
          
          let modificationResults: StatePointAnalysisResults = sviAddon.svi(modificationInputCopy);
          modificationResults = this.convertStatePointAnalysisResults(modificationResults, settings);
          output.modification = modificationResults;
        }
      }
    }
    this.output.next(output);
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: StatePointAnalysisInput = {
      sviParameter: 0,
      sviValue: 0,
      numberOfClarifiers: 0,
      areaOfClarifier: 0,
      diameter: 0,
      userDefinedArea: true,
      MLSS: 0,
      influentFlow: 0,
      rasFlow: 0,
      sludgeSettlingVelocity: 1
    };

    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
  }

  initDefaultEmptyOutput() {
     let output: StatePointAnalysisOutput = {
      baseline: {
        SurfaceOverflow: 0,
        AppliedSolidsLoading: 0,
        RasConcentration: 0,
        UnderFlowRateX2: 0,
        UnderFlowRateY1: 0,
        OverFlowRateX2: 0,
        OverFlowRateY2: 0,
        StatePointX: 0,
        StatePointY: 0,
        TotalAreaClarifier: 0
      },
      modification: {
        SurfaceOverflow: 0,
        AppliedSolidsLoading: 0,
        RasConcentration: 0,
        UnderFlowRateX2: 0,
        UnderFlowRateY1: 0,
        OverFlowRateX2: 0,
        OverFlowRateY2: 0,
        StatePointX: 0,
        StatePointY: 0,
        TotalAreaClarifier: 0
      },
      
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: StatePointAnalysisInput = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  generateExampleData(settings: Settings) {    
    // VoK method examples
    let exampleBaseline: StatePointAnalysisInput = {
      sviValue: 600,
      sviParameter: 4,
      numberOfClarifiers: 2,
      areaOfClarifier: 910,
      diameter: 0,
      userDefinedArea: true,
      MLSS: 2.5,
      influentFlow: 1,
      rasFlow: .7,
      sludgeSettlingVelocity: 375,
    }
    let exampleMod: StatePointAnalysisInput = {
      sviValue: 600,
      sviParameter: 4,
      numberOfClarifiers: 2,
      areaOfClarifier: 910,
      diameter: 0,
      userDefinedArea: true,
      MLSS: 2.5,
      influentFlow: .9,
      rasFlow: .7,
      sludgeSettlingVelocity: 375,
    }

     // SVIGN method examples
    //  let exampleBaseline: StatePointAnalysisInput = {
    //    sviValue: 150,
    //    sviParameter: 1,
    //    numberOfClarifiers: 1,
    //    areaOfClarifier: 10010.427,
    //    MLSS: 2.5,
    //    influentFlow: 12,
    //    rasFlow: 5,
    //    sludgeSettlingVelocity: 1,
    //  }

    //  let exampleMod: StatePointAnalysisInput = {
    //    sviValue: 150,
    //    sviParameter: 1,
    //    numberOfClarifiers: 1,
    //    areaOfClarifier: 10010.427,
    //    MLSS: 2.5,
    //    influentFlow: 6.34,
    //    rasFlow: 5,
    //    sludgeSettlingVelocity: 1,
    //  }

    if (settings.unitsOfMeasure == 'Metric') {
      exampleBaseline = this.convertStatePointAnalysisExample(exampleBaseline);
      exampleMod = this.convertStatePointAnalysisExample(exampleMod);
    }

    this.baselineData.next(exampleBaseline);
    this.modificationData.next(exampleMod);
    this.generateExample.next(true);
  }

  convertStatePointAnalysisInput(input: StatePointAnalysisInput, settings: Settings) {
    input.sviValue = this.convertUnitsService.value(input.sviValue).from('mL/g').to('L/g');
    input.MLSS = this.convertUnitsService.value(input.MLSS).from('g/L').to('kgL');
    if (input.sviParameter == 4) {
      input.sludgeSettlingVelocity = this.convertUnitsService.value(input.sludgeSettlingVelocity).from('m/d').to('m/h');
    }
    
    if (settings.unitsOfMeasure == 'Imperial') {
      input.areaOfClarifier = this.convertUnitsService.value(input.areaOfClarifier).from('ft2').to('m2');
      input.influentFlow = this.convertUnitsService.value(input.influentFlow).from('MGD').to('L/h');
      input.rasFlow = this.convertUnitsService.value(input.rasFlow).from('MGD').to('L/h');
    } else if (settings.unitsOfMeasure == 'Metric'){
      input.influentFlow = this.convertUnitsService.value(input.influentFlow).from('m3/d').to('L/h');
      input.rasFlow = this.convertUnitsService.value(input.rasFlow).from('m3/d').to('L/h');
    }

    return input;
  }

  
  convertStatePointAnalysisExample(input: StatePointAnalysisInput) {
    input.areaOfClarifier = this.convertUnitsService.value(input.areaOfClarifier).from('ft2').to('m2');
    input.areaOfClarifier = this.convertUnitsService.roundVal(input.areaOfClarifier, 2);
    
    input.influentFlow = this.convertUnitsService.value(input.influentFlow).from('MGD').to('m3/d');
    input.influentFlow = this.convertUnitsService.roundVal(input.influentFlow, 2);

    input.rasFlow = this.convertUnitsService.value(input.rasFlow).from('MGD').to('m3/d');
    input.rasFlow = this.convertUnitsService.roundVal(input.rasFlow, 2);

    return input;
  }

  convertStatePointAnalysisResults(results: StatePointAnalysisResults, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
      results.TotalAreaClarifier = this.convertUnitsService.value(results.TotalAreaClarifier).from('m2').to('ft2');
      results.SurfaceOverflow = this.convertUnitsService.value(results.SurfaceOverflow).from('L/m2h').to('gal/ft2d');
      results.AppliedSolidsLoading = this.convertUnitsService.value(results.AppliedSolidsLoading).from('kg/m2h').to('lb/ft2d');

      results.OverFlowRateY2 = this.convertUnitsService.value(results.OverFlowRateY2).from('kg/m2h').to('lb/ft2d');
      results.UnderFlowRateY1 = this.convertUnitsService.value(results.UnderFlowRateY1).from('kg/m2h').to('lb/ft2d');
      results.StatePointY = this.convertUnitsService.value(results.StatePointY).from('kg/m2h').to('lb/ft2d');
      
      results.graphData = results.graphData.map(pair => {
        return [
          // pair[0] Solids Concentration: always g/L
          pair[0],
          // pair[1] Solids flux: kg/m2h to lb/ft2d
          this.convertUnitsService.value(pair[1]).from('kg/m2h').to('lb/ft2d')
        ];
      });
    } else if (settings.unitsOfMeasure == 'Metric'){
      results.SurfaceOverflow = this.convertUnitsService.value(results.SurfaceOverflow).from('L/m2h').to('L/m2d');
      results.AppliedSolidsLoading = this.convertUnitsService.value(results.AppliedSolidsLoading).from('kg/m2h').to('kg/m2d');

      results.OverFlowRateY2 = this.convertUnitsService.value(results.OverFlowRateY2).from('kg/m2h').to('kg/m2d');
      results.UnderFlowRateY1 = this.convertUnitsService.value(results.UnderFlowRateY1).from('kg/m2h').to('kg/m2d');
      results.StatePointY = this.convertUnitsService.value(results.StatePointY).from('kg/m2h').to('kg/m2d');

      results.graphData = results.graphData.map(pair => {
        return [
          // pair[0] Solids Concentration: always g/L
          pair[0],
          // pair[1] Solids flux: kg/m2h to kg/m2d
          this.convertUnitsService.value(pair[1]).from('kg/m2h').to('kg/m2d')
        ];
      });
    }
    
    results.RasConcentration = this.convertUnitsService.value(results.RasConcentration).from('kgL').to('mg/L');
    return results;
  }

  calculateArea(diameter: number): number {
    // (diameter / 2)^2 * Math.PI;
    let area = Math.pow(diameter / 2, 2) * Math.PI;
    return area;
  }

}
