import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EfficiencyImprovementService } from './efficiency-improvement.service';

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

  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;

  currentField: string = 'default';
  constructor(private phastService: PhastService, private efficiencyImprovementService: EfficiencyImprovementService, private settingsDbService: SettingsDbService) { }


  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    if (this.efficiencyImprovementService.efficiencyImprovementInputs) {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.efficiencyImprovementInputs;
    } else {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.initDefaultValues(this.settings);
    }
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.efficiencyImprovementService.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }
}
