import { Component, OnInit, Input } from '@angular/core';
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
  @Input()
  x: d3.Selection<any>;
  @Input()
  y: d3.Selection<any>;


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
  graphColors: Array<string>;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private lineChartHelperService: LineChartHelperService) { }

  ngOnInit() {
    this.graphColors = JSON.parse(JSON.stringify(graphColors));
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
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
        this.addDataPoint(val);
      }
    });
  }

  ngOnDestroy() {
    this.equipmentCurveCollapsedSub.unsubscribe();
    this.equipmentInputsSub.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.selectedDataPointSub.unsubscribe();
    this.systemAndEquipmentCurveGraphService.selectedDataPoint.next(undefined);
  }

  highlightPoint() {

  }

  unhighlightPoint() {

  }

  deleteFromTable() {

  }

  setColumnTitles() {
    this.columnTitles = this.systemAndEquipmentCurveGraphService.initColumnTitles(this.settings, this.equipmentType, this.isEquipmentCurveShown, this.isEquipmentModificationShown, this.isSystemCurveShown);
  }

  addDataPoint(dataPoint: Array<{ x: number, y: number, fluidPower?: number }>) {
    let baselineEquipmentData: { x: number, y: number, fluidPower?: number };
    let modificationEquipmentData: { x: number, y: number, fluidPower?: number };
    let systemCurveData: { x: number, y: number, fluidPower?: number };
    let systemCurveIndex: number = 0;
    let flowRateX: string;
    let baselineY: string;
    let modificationY: string;
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
    console.log(newKeyColor);
    //rowData = Array<"baselineX", "baselineY", "modificationY", "systemCurveY", "fluidPower">;
    if (this.isEquipmentCurveShown == true) {
      flowRateX = baselineEquipmentData.x.toFixed(2);
      newRowDataArr.push(flowRateX);
      baselineY = baselineEquipmentData.y.toFixed(2);
      newRowDataArr.push(baselineY);
      this.lineChartHelperService.tableFocusHelper(this.svg, "intersectModification", newKeyColor.fillColor, newKeyColor.borderColor, this.x(flowRateX), this.y(baselineY), 'OP2');


      if (this.isEquipmentModificationShown) {
        modificationY = modificationEquipmentData.y.toFixed(2);
        newRowDataArr.push(modificationY);
        this.lineChartHelperService.tableFocusHelper(this.svg, "intersectModification", newKeyColor.fillColor, newKeyColor.borderColor, this.x(flowRateX), this.y(modificationY), 'OP2');
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
      this.lineChartHelperService.tableFocusHelper(this.svg, "intersectModification", newKeyColor.fillColor, newKeyColor.borderColor, this.x(flowRateX), this.y(systemCurveY), 'OP2');
    }
    this.rowData.push(newRowDataArr);
    this.keyColors.push(newKeyColor);
    console.log(this.keyColors);
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
