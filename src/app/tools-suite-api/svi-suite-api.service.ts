import { Injectable } from '@angular/core';
import { StatePointAnalysisInput, StatePointAnalysisResults } from '../shared/models/waste-water';
declare var Module: any;

@Injectable({
  providedIn: 'root'
})
export class SviSuiteApiService {

  constructor() { }

  svi(inputs: StatePointAnalysisInput): StatePointAnalysisResults {
    let sviParamEnum = this.getParameter(inputs.sviParameter);
    let instance = new Module.SludgeVolumeIndex(sviParamEnum, inputs.sviValue, inputs.numberOfClarifiers, inputs.areaOfClarifier, inputs.MLSS, inputs.influentFlow, inputs.rasFlow, inputs.sludgeSettlingVelocity);
    let results = instance.calculate();
    let graphData: Array<Array<number>> = new Array();
    for (let i = 0; i < results.GraphData.size(); i++) {
      let dataPoint = results.GraphData.get(i)
      let graphDataPoints = [dataPoint.SolidsConcentration, dataPoint.SolidsFlux];
      graphData.push(graphDataPoints)
      dataPoint.delete();
    }
    let output: StatePointAnalysisResults= {
      SurfaceOverflow: results.SurfaceOverflow,
      AppliedSolidsLoading: results.AppliedSolidsLoading,
      TotalAreaClarifier: results.TotalAreaClarifier,
      RasConcentration: results.RasConcentration,
      UnderFlowRateX2: results.UnderFlowRateX2,
      UnderFlowRateY1: results.UnderFlowRateY1,
      OverFlowRateX2: results.OverFlowRateX2,
      OverFlowRateY2: results.OverFlowRateY2,
      StatePointX: results.StatePointX,
      StatePointY: results.StatePointY,
      graphData: graphData
    };
    results.delete();
    instance.delete();
    return output; 
  }


  getParameter(sviParameter: number) {
    if (sviParameter == 0) {
      return Module.SVIParameter.SVISN;
    } else if (sviParameter == 1) {
      return Module.SVIParameter.SVIGN;
    } else if (sviParameter == 2) {
      return Module.SVIParameter.SVIGS;
    } else if (sviParameter == 3) {
      return Module.SVIParameter.SVISS;
    } else if (sviParameter == 4) {
      return Module.SVIParameter.VoK;
    }
  }
}
