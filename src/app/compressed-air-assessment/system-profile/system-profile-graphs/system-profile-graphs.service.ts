import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SystemProfileGraphsService {
  xAxisHover: BehaviorSubject<HoverPositionData>;
  graphLayout: BehaviorSubject<LayoutData>;
  yAxisRangeValues: BehaviorSubject<AxisRanges>;
   
  constructor() { 
    this.xAxisHover = new BehaviorSubject<HoverPositionData>(undefined);
    this.graphLayout = new BehaviorSubject<LayoutData>({
      systemPowerGraph: undefined,
      systemCapacityGraph: undefined,
    });
    this.yAxisRangeValues = new BehaviorSubject<AxisRanges>({
      systemPowerGraph: {min: undefined, max: undefined },
      systemCapacityGraph: {min: undefined, max: undefined }
    });
  }
}

export interface LayoutData {
  systemPowerGraph: {traceShowLegend: boolean, layout: GraphLayout},
  systemCapacityGraph: {traceShowLegend: boolean, layout: GraphLayout},
};

export interface GraphLayout {
  xaxis: {
    range: Array<number>,
  },
  yaxis: {
    range: Array<number>,
  },
};

export interface HoverPositionData {
  chartName: string,
  points: { curveNumber: number, pointNumber: number }
}

export interface AxisRanges {
  systemPowerGraph: {min: number, max: number },
  systemCapacityGraph: {min: number, max: number },
}
