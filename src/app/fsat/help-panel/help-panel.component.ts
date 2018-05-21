import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { HelpPanelService } from './help-panel.service';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
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


  currentField: string;
  tabSelect: string = 'help';
  currentFieldSub: Subscription;
  stepTab: string;
  stepTabSub: Subscription;
  constructor(private helpPanelService: HelpPanelService, private fsatService: FsatService, private modifyConditionsService: ModifyConditionsService) { }

  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe(val => {
      this.currentField = val;
    })
    if (this.inSetup) {
      this.stepTabSub = this.fsatService.stepTab.subscribe(tab => {
        this.stepTab = tab;
      })
    }
    else {
      this.stepTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
        this.stepTab = val;
      })
    }
  }

  ngOnDestroy() {
    this.stepTabSub.unsubscribe();
    this.currentFieldSub.unsubscribe();
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

}
