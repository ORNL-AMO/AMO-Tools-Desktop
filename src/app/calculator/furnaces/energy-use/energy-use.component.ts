import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-energy-use',
  templateUrl: './energy-use.component.html',
  styleUrls: ['./energy-use.component.css']
})
export class EnergyUseComponent implements OnInit {
  @Input()
  inPhast: boolean;
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  flowCalculations: FlowCalculations = {
    //natural gas
    gasType: 0,
    specificGravity: 0.657,
    orificeDiameter: 3.5,
    insidePipeDiameter: 8,
    // 1 is sharp edge
    sectionType: 1,
    dischargeCoefficient: 0.6,
    gasHeatingValue: 22031,
    gasTemperature: 85,
    gasPressure: 85,
    orificePressureDrop: 10,
    operatingTime: 10
  }

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };

  headerHeight: number;

  currentField: string = 'orificeDiameter';
  tabSelect: string = 'results';

  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(results => {
        if (results) {
          this.settings = results[0];
          this.initDefaultValues(this.settings);
          this.calculate();
        }
      })
    } else {
      this.initDefaultValues(this.settings);
      this.calculate();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  initDefaultValues(settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      this.flowCalculations = {
        //natural gas
        gasType: 0,
        specificGravity: 0.657,
        orificeDiameter: this.convertUnitsService.roundVal(this.convertUnitsService.value(3.5).from('in').to('cm'), 2),
        insidePipeDiameter: this.convertUnitsService.roundVal(this.convertUnitsService.value(8).from('in').to('cm'), 2),
        // 1 is sharp edge
        sectionType: 1,
        dischargeCoefficient: 0.6,
        gasHeatingValue: this.convertUnitsService.roundVal(this.convertUnitsService.value(this.flowCalculations.gasHeatingValue).from('btuSCF').to('kJNm3'), 2),
        gasTemperature: this.convertUnitsService.roundVal(this.convertUnitsService.value(85).from('F').to('C'), 2),
        gasPressure: this.convertUnitsService.roundVal(this.convertUnitsService.value(85).from('psi').to('kPa'), 2),
        orificePressureDrop: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('in').to('cm'), 2),
        operatingTime: 10
      };
    } else {
      this.flowCalculations = {
        //natural gas
        gasType: 0,
        specificGravity: 0.657,
        orificeDiameter: 3.5,
        insidePipeDiameter: 8,
        // 1 is sharp edge
        sectionType: 1,
        dischargeCoefficient: 0.6,
        gasHeatingValue: 22031,
        gasTemperature: 85,
        gasPressure: 85,
        orificePressureDrop: 10,
        operatingTime: 10
      };
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
  }

}
