import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../shared/models/phast/o2Enrichment';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2EnrichmentService } from './o2-enrichment.service';

@Component({
  selector: 'app-o2-enrichment',
  templateUrl: './o2-enrichment.component.html',
  styleUrls: ['./o2-enrichment.component.css']
})
export class O2EnrichmentComponent implements OnInit {
  @Input()
  settings: Settings


  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  o2Enrichment: O2Enrichment;

  o2EnrichmentOutput: O2EnrichmentOutput = {
    availableHeatEnriched: 0.0,
    availableHeatInput: 0.0,
    fuelConsumptionEnriched: 0.0,
    fuelSavingsEnriched: 0.0
  };

  lines = [];
  tabSelect: string = 'results';
  currentField: string = 'default';
  constructor(private phastService: PhastService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService, private o2EnrichmentService: O2EnrichmentService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.o2EnrichmentService.o2Enrichment) {
      this.o2Enrichment = this.o2EnrichmentService.o2Enrichment;
    } else {
      this.o2Enrichment = this.o2EnrichmentService.initDefaultValues(this.settings);
    }

    if (this.o2EnrichmentService.lines) {
      this.lines = this.o2EnrichmentService.lines;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.o2EnrichmentService.o2Enrichment = this.o2Enrichment;
    this.o2EnrichmentService.lines = this.lines;

  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.o2EnrichmentOutput = this.phastService.o2Enrichment(this.o2Enrichment, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
