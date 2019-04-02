import { Component, OnInit, ViewChild, HostListener, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { OpportunitySheet } from '../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-standalone-opportunity-sheet',
  templateUrl: './standalone-opportunity-sheet.component.html',
  styleUrls: ['./standalone-opportunity-sheet.component.css']
})
export class StandaloneOpportunitySheetComponent implements OnInit {
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitSave')
  emitSave = new EventEmitter<OpportunitySheet>();
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  containerHeight: number;
  tabSelect: string = 'help';
  constructor(private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    if (!this.opportunitySheet) {
      this.opportunitySheet = this.treasureHuntService.initOpportunitySheet();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }


  addModification() {
    this.opportunitySheet.modificationEnergyUseItems = JSON.parse(JSON.stringify(this.opportunitySheet.baselineEnergyUseItems));
  }

  save() {
    // console.log(this.baselineEnergyUse);
    this.emitSave.emit(this.opportunitySheet);
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
