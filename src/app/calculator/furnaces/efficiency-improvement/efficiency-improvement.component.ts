import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-efficiency-improvement',
  templateUrl: './efficiency-improvement.component.html',
  styleUrls: ['./efficiency-improvement.component.css']
})
export class EfficiencyImprovementComponent implements OnInit {
  @Input()
  settings: Settings

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  efficiencyImprovementInputs: EfficiencyImprovementInputs = {
    currentFlueGasOxygen: 6,
    newFlueGasOxygen: 2,
    currentFlueGasTemp: 80,
    currentCombustionAirTemp: 80,
    newCombustionAirTemp: 750,
    currentEnergyInput: 10,
    newFlueGasTemp: 1600
  }
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;

  currentField: string = 'default';
  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }


  ngOnInit() {
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(results => {
        if (results) {
          this.settings = results[0];
          this.initDefaultValues(this.settings);
          this.calculate();
        }
      });
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
      this.efficiencyImprovementInputs = {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        currentCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        newCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(750).from('F').to('C'), 2),
        currentEnergyInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2),
        newFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2)
      }
    }
    else {
      this.efficiencyImprovementInputs = {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: 80,
        currentCombustionAirTemp: 80,
        newCombustionAirTemp: 750,
        currentEnergyInput: 10,
        newFlueGasTemp: 1600
      }
    }
  }

  calculate() {
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }
}
