import { Component, OnInit, ViewEncapsulation, Input, ElementRef, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, Modification } from '../../../shared/models/phast/phast';
import { LossTab } from '../../tabs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
    selector: 'app-losses-result-panel',
    templateUrl: './losses-result-panel.component.html',
    styleUrls: ['./losses-result-panel.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class LossesResultPanelComponent implements OnInit {
  @Input()
  lossesTab: LossTab;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  toggleCalculate: boolean;
  @Input()
  modification: Modification;
  @Input()
  inSetup: boolean;
  @Input()
  inModifyConditions: boolean;
  @Input()
  containerHeight: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  modificationIndex: number;


  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;

  tabSelect: string = 'results';
  helpHeight: number;
  sankeyView: string = 'Baseline';
  baselineSankey: PHAST;
  modificationSankey: PHAST;
  constructor(private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.getSankeyData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      if (!changes.containerHeight.firstChange) {
        this.getContainerHeight();
      }
    }
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }

  getSankeyData() {
    this.baselineSankey = this.phast;
    if (this.modification) {
      this.modificationSankey = this.modification.phast;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }
}
