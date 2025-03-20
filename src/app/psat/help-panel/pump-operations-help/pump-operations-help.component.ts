import { Component, OnInit, Input } from '@angular/core';
import { HelpPanelService } from '../help-panel.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-pump-operations-help',
    templateUrl: './pump-operations-help.component.html',
    styleUrls: ['./pump-operations-help.component.css'],
    standalone: false
})
export class PumpOperationsHelpComponent implements OnInit {
 
  currentField: string;

  currentFieldSub: Subscription;

  constructor( private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}
