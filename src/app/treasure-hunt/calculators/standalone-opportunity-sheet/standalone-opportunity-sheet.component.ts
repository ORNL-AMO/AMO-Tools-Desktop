import { Component, OnInit, ViewChild, HostListener, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { OpportunitySheet, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunitySheetService } from './opportunity-sheet.service';

@Component({
  selector: 'app-standalone-opportunity-sheet',
  templateUrl: './standalone-opportunity-sheet.component.html',
  styleUrls: ['./standalone-opportunity-sheet.component.css']
})
export class StandaloneOpportunitySheetComponent implements OnInit {
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<OpportunitySheet>();
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  tabSelect: string = 'help';
  opportunitySheetResults: OpportunitySheetResults;
  currentField: string = 'default';
  opportunitySheet: OpportunitySheet;
  constructor(private opportunitySheetService: OpportunitySheetService) { }

  ngOnInit() {
    if (this.opportunitySheetService.opportunitySheet) {
      this.opportunitySheet = this.opportunitySheetService.opportunitySheet;
    } else {
      this.opportunitySheet = this.opportunitySheetService.initOpportunitySheet();
    }
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }


  addModification() {
    this.opportunitySheet.modificationEnergyUseItems = JSON.parse(JSON.stringify(this.opportunitySheet.baselineEnergyUseItems));
  }

  save() {
    this.emitSave.emit(this.opportunitySheet);
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  saveBaseline(baselineData: Array<{ type: string, amount: number }>) {
    this.opportunitySheet.baselineEnergyUseItems = baselineData;
    this.getResults();
  }

  saveModification(modificationData: Array<{ type: string, amount: number }>) {
    this.opportunitySheet.modificationEnergyUseItems = modificationData;
    this.getResults();
  }

  getResults() {
    this.opportunitySheetResults = this.opportunitySheetService.getResults(this.opportunitySheet, this.settings);
  }

  changeField(str: string) {
    this.currentField = str;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
