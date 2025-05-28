import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { HelpPanelService } from './help-panel.service';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { FSAT } from '../../shared/models/fans';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
    selector: 'app-help-panel',
    templateUrl: './help-panel.component.html',
    styleUrls: ['./help-panel.component.css'],
    standalone: false
})
export class HelpPanelComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  fsat: FSAT;
  @Input()
  modificationIndex: number;
  @Input()
  containerHeight: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @ViewChild('resultTabs', { static: false }) resultTabs: ElementRef;

  currentField: string;
  tabSelect: string = 'help';
  currentFieldSub: Subscription;
  stepTab: string;
  stepTabSub: Subscription;
  helpHeight: number;
  constructor(private helpPanelService: HelpPanelService, private settingsDbService: SettingsDbService, private fsatService: FsatService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe(val => {
      this.currentField = val;
    });
    if (this.inSetup) {
      this.stepTabSub = this.fsatService.stepTab.subscribe(tab => {
        this.stepTab = tab;
      });
    }
    else {
      this.stepTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
        this.stepTab = val;
      });
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      this.getContainerHeight();
    }
  }

  ngOnDestroy() {
    this.stepTabSub.unsubscribe();
    this.currentFieldSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.containerHeight && this.resultTabs) {
      let tabHeight = this.resultTabs.nativeElement.clientHeight;
      this.helpHeight = this.containerHeight - tabHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }
}
