import { Component, OnInit, Input } from '@angular/core';
import { HelpPanelService } from '../help-panel.service';
import { PSAT } from '../../../shared/models/psat';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-pump-fluid-help',
    templateUrl: './pump-fluid-help.component.html',
    styleUrls: ['./pump-fluid-help.component.css'],
    standalone: false
})
export class PumpFluidHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  currentField: string;
  currentFieldSub: Subscription;
  constructor(private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }
  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }
}
