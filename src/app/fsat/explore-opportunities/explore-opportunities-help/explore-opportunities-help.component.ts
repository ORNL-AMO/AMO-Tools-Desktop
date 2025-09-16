import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';
import { Subscription } from 'rxjs';
import { HelpPanelService } from '../../help-panel/help-panel.service';

@Component({
    selector: 'app-explore-opportunities-help',
    templateUrl: './explore-opportunities-help.component.html',
    styleUrls: ['./explore-opportunities-help.component.css'],
    standalone: false
})
export class ExploreOpportunitiesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  

  currentFieldSub: Subscription;
  currentField: string;

  stepTabSub: Subscription;
  stepTab: string;


  constructor(private modifyConditionsService: ModifyConditionsService, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.stepTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.stepTab = val;
    });

    this.currentFieldSub = this.helpPanelService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy() {
    this.stepTabSub.unsubscribe();
    this.currentFieldSub.unsubscribe();
  }

}
