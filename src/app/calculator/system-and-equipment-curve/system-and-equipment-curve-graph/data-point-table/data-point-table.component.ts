import { Component, OnInit, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { SystemAndEquipmentCurveService } from '../../system-and-equipment-curve.service';
import { SystemAndEquipmentCurveGraphService } from '../system-and-equipment-curve-graph.service';
import * as d3 from 'd3';
import { LineChartHelperService } from '../../../../shared/helper-services/line-chart-helper.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
@Component({
  selector: 'app-data-point-table',
  templateUrl: './data-point-table.component.html',
  styleUrls: ['./data-point-table.component.css']
})
export class DataPointTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  equipmentType: string;
  @Input()
  svg: d3.Selection<any>;
  // @Input()
  // x: d3.Selection<any>;
  // @Input()
  // y: d3.Selection<any>;
  @Input()
  ngChart: ElementRef;

  isEquipmentCurveShown: boolean;
  isEquipmentModificationShown: boolean;
  isSystemCurveShown: boolean;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  equipmentCurveCollapsedSub: Subscription;
  equipmentInputsSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  selectedDataPointSub: Subscription;
  modificationIntersectionPointSub: Subscription;
  baselineIntersectionPointSub: Subscription;
  clearAllSub: Subscription;

  graphColors: Array<string>;
  existingDataPoints: Array<{
    keyColor: {
      borderColor: string,
      fillColor: string
    },
    dataStrings: Array<string>,
    dataObj: {
      flowRateX: string;
      baselineEquipmentY: string;
      modificationEquipmentY: string;
      systemCurveY: string;
      fluidPower: string;
    }
  }>;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private lineChartHelperService: LineChartHelperService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.graphColors = JSON.parse(JSON.stringify(graphColors));
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.existingDataPoints = new Array();
    this.rowData = new Array();
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentCurveShown = (val == 'open');
        this.setColumnTitles();
        this.rowData = new Array();
        this.keyColors = new Array();
      }
    });
    this.equipmentInputsSub = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(val => {
      if (val != undefined) {
        this.isEquipmentModificationShown = (val.baselineMeasurement != val.modifiedMeasurement);
        this.setColumnTitles();
      }
    });
    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      if (val != undefined) {
        this.isSystemCurveShown = (val == 'open');
        this.setColumnTitles();
        this.rowData = new Array();
        this.keyColors = new Array();
      }
    });

    this.selectedDataPointSub = this.systemAndEquipmentCurveGraphService.selectedDataPoint.subscribe(val => {
      if (val) {
        this.addNewDataPoint(val);
      }
    });

    this.baselineIntersectionPointSub = this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.subscribe(val => {
      if (val) {
        //add data point to rows
        this.svg.selectAll('.tablePoint').remove();
        this.rowData = new Array();
        this.keyColors = new Array();
        this.existingDataPoints = new Array();
        this.addBaselinePoint(val);
        if (this.isEquipmentModificationShown == true) {
          let modVal = this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.getValue();
          if (modVal != undefined) {
            this.addModificationPoint(modVal);
          }
        }
      }
    });

    this.clearAllSub = this.systemAndEquipmentCurveGraphService.clearDataPoints.subscribe(val => {
      if (val == true) {
        this.clearData();
      }
    })
  }

  ngOnDestroy() {
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.selectedDataPointSub.unsubscribe();
    this.systemAndEquipmentCurveGraphService.selectedDataPoint.next(undefined);
    this.baselineIntersectionPointSub.unsubscribe();
    this.clearAllSub.unsubscribe();
  }

  getHighlightIds(index: number): Array<string> {
    let baselineIntersection = this.systemAndEquipmentCurveGraphService.baselineIntersectionPoint.getValue();
    let modificationIntersection = this.systemAndEquipmentCurveGraphService.modificationIntersectionPoint.getValue();
    let ids: Array<string> = new Array<string>();
    if (baselineIntersection != undefined && index == 0) {
      //highlight baseline
      ids.push('#intersectBaseline');
    } else if (modificationIntersection != undefined && index == 1) {
      //highlight modification
      ids.push('#intersectModification');
    } else {
      //highlight other points
      if (this.isSystemCurveShown == true) {
        //hight light system curve
        ids.push('#systemCurveY' + (index + 1));
      }
      if (this.isEquipmentCurveShown == true) {
        //highligh equipment curve
        ids.push('#baselineEquipmentY' + (index + 1));
        if (this.isEquipmentModificationShown == true) {
          //highlight modification
          ids.push('#modificationEquipmentY' + (index + 1));
        }
      }
    }
    return ids;
  }

  highlightPoint(index: number) {
    let ids: Array<string> = this.getHighlightIds(index);
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }

  unhighlightPoint(index: number) {
    let ids: Array<string> = this.getHighlightIds(index);
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
  }

  clearData() {
    this.svg.selectAll('.tablePoint').remove();
    this.rowData = new Array();
    this.keyColors = new Array();
    this.existingDataPoints = new Array();
  }


  addBaselinePoint(point: { x: number, y: number, fluidPower: number }) {
    let rowData: Array<string> = new Array();
    let flowRateX: string = point.x.toFixed(2);
    rowData.push(flowRateX);
    let baselineEquipmentY: string = point.y.toFixed(2);
    rowData.push(baselineEquipmentY);
    let modificationEquipmentY: string;
    if (this.isEquipmentModificationShown == true) {
      modificationEquipmentY = '&mdash;';
      rowData.push(modificationEquipmentY);
    }
    let systemCurveY: string = point.y.toFixed(2);
    rowData.push(systemCurveY);
    let fluidPower: string = point.fluidPower.toFixed(2);
    rowData.push(fluidPower);
    let keyColor: { borderColor: string, fillColor: string } = { borderColor: "#145A32", fillColor: "#145A32" };
    this.addDataPointToArrs(keyColor, rowData, flowRateX, baselineEquipmentY, modificationEquipmentY, systemCurveY, fluidPower);
    this.renderBaselinePoint(point);
  }

  renderBaselinePoint(point: { x: number, y: number, fluidPower: number }) {
    let xRef = this.systemAndEquipmentCurveGraphService.xRef;
    let yRef = this.systemAndEquipmentCurveGraphService.yRef;
    this.lineChartHelperService.tableFocusHelper(this.svg, "intersectBaseline", "#145A32", "#145A32", xRef(point.x), yRef(point.y), 'OP1');
  }

  addModificationPoint(point: { x: number, y: number, fluidPower: number }) {
    let flowRateX: string = point.x.toFixed(2);
    let baselineEquipmentY: string = '&mdash;';
    let modificationEquipmentY: string = point.y.toFixed(2);
    let systemCurveY: string = point.y.toFixed(2);
    let fluidPower: string = point.fluidPower.toFixed(2);
    let rowData: Array<string> = [flowRateX, baselineEquipmentY, modificationEquipmentY, systemCurveY, fluidPower];
    let keyColor: { borderColor: string, fillColor: string } = { borderColor: "#3498DB", fillColor: "#3498DB" };
    this.addDataPointToArrs(keyColor, rowData, flowRateX, baselineEquipmentY, modificationEquipmentY, systemCurveY, fluidPower);
    this.renderModificationPoint(point);
  }

  renderModificationPoint(point: { x: number, y: number, fluidPower: number }) {
    let xRef = this.systemAndEquipmentCurveGraphService.xRef;
    let yRef = this.systemAndEquipmentCurveGraphService.yRef;
    this.lineChartHelperService.tableFocusHelper(this.svg, "intersectModification", "#3498DB", "#3498DB", xRef(point.x), yRef(point.y), 'OP2');
  }

  deleteFromTable(index: number) {
    this.svg.selectAll('.tablePoint').remove();
    this.existingDataPoints.splice(index, 1);
    this.rowData = new Array();
    this.keyColors = new Array();
    let iterateIndex: number = 1;
    this.existingDataPoints.forEach(dataPoint => {
      this.rowData.push(dataPoint.dataStrings);
      this.keyColors.push(dataPoint.keyColor);
      if (dataPoint.keyColor.borderColor == "#3498DB") {
        this.renderModificationPoint({ x: Number(dataPoint.dataObj.flowRateX), y: Number(dataPoint.dataObj.modificationEquipmentY), fluidPower: 0 });
      } else if (dataPoint.keyColor.borderColor == "#145A32") {
        this.renderBaselinePoint({ x: Number(dataPoint.dataObj.flowRateX), y: Number(dataPoint.dataObj.baselineEquipmentY), fluidPower: 0 });
      } else {
        this.renderDataPoint(dataPoint, iterateIndex);
      }
      iterateIndex++;
    });
    this.cd.detectChanges();
  }

  setColumnTitles() {
    this.columnTitles = this.systemAndEquipmentCurveGraphService.initColumnTitles(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }

  addNewDataPoint(dataPoint: Array<{ x: number, y: number, fluidPower?: number }>) {
    let baselineEquipmentData: { x: number, y: number, fluidPower?: number };
    let modificationEquipmentData: { x: number, y: number, fluidPower?: number };
    let systemCurveData: { x: number, y: number, fluidPower?: number };
    let systemCurveIndex: number = 0;
    let flowRateX: string;
    let baselineEquipmentY: string;
    let modificationEquipmentY: string;
    let systemCurveY: string;
    let fluidPower: string;

    let newRowDataArr: Array<string> = new Array();
    if (this.isEquipmentCurveShown == true) {
      baselineEquipmentData = dataPoint[0];
      systemCurveIndex = 1;
      if (this.isEquipmentModificationShown == true) {
        modificationEquipmentData = dataPoint[1];
        systemCurveIndex = 2;
      }
    }
    if (this.isSystemCurveShown == true) {
      systemCurveData = dataPoint[systemCurveIndex];
    }

    let newKeyColor: { borderColor: string, fillColor: string } = this.getNewKeyColor();
    //rowData = Array<"flowRateX", "baselineY?", "modificationY?", "systemCurveY", "fluidPower">;
    if (this.isEquipmentCurveShown == true) {
      flowRateX = baselineEquipmentData.x.toFixed(2);
      newRowDataArr.push(flowRateX);
      baselineEquipmentY = baselineEquipmentData.y.toFixed(2);
      newRowDataArr.push(baselineEquipmentY);
      if (this.isEquipmentModificationShown) {
        modificationEquipmentY = modificationEquipmentData.y.toFixed(2);
        newRowDataArr.push(modificationEquipmentY);
      }
    }

    if (this.isSystemCurveShown == true) {
      if (this.isEquipmentCurveShown == false) {
        flowRateX = systemCurveData.x.toFixed(2);
        newRowDataArr.push(flowRateX);
      }
      systemCurveY = systemCurveData.y.toFixed(2);
      newRowDataArr.push(systemCurveY);
      fluidPower = systemCurveData.fluidPower.toFixed(2);
      newRowDataArr.push(fluidPower);
    }

    let newDataPoint = this.addDataPointToArrs(newKeyColor, newRowDataArr, flowRateX, baselineEquipmentY, modificationEquipmentY, systemCurveY, fluidPower);
    this.renderDataPoint(newDataPoint, this.existingDataPoints.length);
  }


  addDataPointToArrs(keyColor: { borderColor: string, fillColor: string }, rowDataArr: Array<string>, flowRateX: string, baselineEquipmentY: string, modificationEquipmentY: string, systemCurveY: string, fluidPower: string) {
    let newDataPoint = {
      keyColor: keyColor,
      dataStrings: rowDataArr,
      dataObj: {
        flowRateX: flowRateX,
        baselineEquipmentY: baselineEquipmentY,
        modificationEquipmentY: modificationEquipmentY,
        systemCurveY: systemCurveY,
        fluidPower: fluidPower
      }
    }
    this.existingDataPoints.push(newDataPoint);
    this.rowData.push(rowDataArr);
    this.keyColors.push(keyColor);
    this.cd.detectChanges();
    return newDataPoint;
  }


  renderDataPoint(dataPoint: {
    keyColor: {
      borderColor: string,
      fillColor: string
    },
    dataStrings: Array<string>,
    dataObj: {
      flowRateX: string;
      baselineEquipmentY: string;
      modificationEquipmentY: string;
      systemCurveY: string;
      fluidPower: string;
    }
  }, index: number) {

    let xRef = this.systemAndEquipmentCurveGraphService.xRef;
    let yRef = this.systemAndEquipmentCurveGraphService.yRef;
    if (dataPoint.dataObj.baselineEquipmentY) {
      this.lineChartHelperService.tableFocusHelper(this.svg, "baselineEquipmentY" + index, dataPoint.keyColor.fillColor, dataPoint.keyColor.borderColor, xRef(dataPoint.dataObj.flowRateX), yRef(dataPoint.dataObj.baselineEquipmentY), index.toString());
    };
    if (dataPoint.dataObj.modificationEquipmentY) {
      this.lineChartHelperService.tableFocusHelper(this.svg, "modificationEquipmentY" + index, dataPoint.keyColor.fillColor, dataPoint.keyColor.borderColor, xRef(dataPoint.dataObj.flowRateX), yRef(dataPoint.dataObj.modificationEquipmentY), index.toString());
    }
    if (dataPoint.dataObj.systemCurveY) {
      this.lineChartHelperService.tableFocusHelper(this.svg, "systemCurveY" + index, dataPoint.keyColor.fillColor, dataPoint.keyColor.borderColor, xRef(dataPoint.dataObj.flowRateX), yRef(dataPoint.dataObj.systemCurveY), index.toString());
    }
  }


  getNewKeyColor(): { borderColor: string, fillColor: string } {
    let randomBorderIndex: number = this.getRandomInt(this.graphColors.length);
    let randomFillIndex: number = this.getRandomInt(this.graphColors.length);
    let newKeyColor: { borderColor: string, fillColor: string } = { borderColor: this.graphColors[randomBorderIndex], fillColor: this.graphColors[randomFillIndex] };

    let inUseTest: Array<{ borderColor: string, fillColor: string }> = _.intersection(this.keyColors, [newKeyColor]);
    if (inUseTest.length == 0) {
      return newKeyColor;
    } else {
      return this.getNewKeyColor();
    }
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
