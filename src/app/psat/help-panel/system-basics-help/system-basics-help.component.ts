import { Component, OnInit } from '@angular/core';
import { HelpPanelService } from '../help-panel.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-system-basics-help',
    templateUrl: './system-basics-help.component.html',
    styleUrls: ['./system-basics-help.component.css'],
    standalone: false
})
export class SystemBasicsHelpComponent implements OnInit {

  constructor(private helpPanelService: HelpPanelService) { }
  currentField: string;
  currentFieldSub: Subscription;
  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    });
  }
  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}
