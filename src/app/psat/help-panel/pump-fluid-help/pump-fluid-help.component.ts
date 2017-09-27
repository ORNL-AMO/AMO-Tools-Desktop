import { Component, OnInit, Input } from '@angular/core';
import { HelpPanelService } from '../help-panel.service';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-pump-fluid-help',
  templateUrl: './pump-fluid-help.component.html',
  styleUrls: ['./pump-fluid-help.component.css']
})
export class PumpFluidHelpComponent implements OnInit {

  @Input()
  psat: PSAT;
  currentField: string;

  constructor(private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }

}
