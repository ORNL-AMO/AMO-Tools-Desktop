import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SystemProfileGraphsService {
  xAxisHover: BehaviorSubject<HoverPositionData>;
  yAxisRangeValues: BehaviorSubject<AxisRanges>;
   
  constructor() { 
    this.xAxisHover = new BehaviorSubject<HoverPositionData>(undefined);
    this.yAxisRangeValues = new BehaviorSubject<AxisRanges>({
      systemPowerGraph: {min: undefined, max: undefined },
      systemCapacityGraph: {min: undefined, max: undefined }
    });
  }
}

export interface HoverPositionData {
  chartName: string,
  points: { curveNumber: number, pointNumber: number }
}

export interface AxisRanges {
  systemPowerGraph: {min: number, max: number },
  systemCapacityGraph: {min: number, max: number },
}
