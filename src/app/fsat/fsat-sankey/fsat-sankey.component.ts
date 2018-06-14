import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';


var svg;

// use these values to alter label font position and size
const width = 2650,
  height = 1400,
  labelFontSize = 28,
  labelPadding = 4,
  reportFontSize = 34,
  reportPadding = 4,
  topLabelPositionY = 150,
  bottomLabelPositionY = 1250,
  topReportPositionY = 125,
  bottomReportPositionY = 1250;

@Component({
  selector: 'app-fsat-sankey',
  templateUrl: './fsat-sankey.component.html',
  styleUrls: ['./fsat-sankey.component.css']
})
export class FsatSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  location: string;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @Input()
  isBaseline: boolean;

  @ViewChild('ngChart') ngChart: ElementRef;
  width: number;
  height: number;

  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  title: string;
  unit: string;
  titlePlacement: string;

  energyInput: number;
  motorLosses: number;
  driveLosses: number;
  fanLosses: number;
  usefulOutput: number;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    console.log('this.fsat = ');
    console.log(this.fsat);
  }

}
