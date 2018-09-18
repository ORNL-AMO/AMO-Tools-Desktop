import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

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

  stepTab: string;
  stepTabSubscription: Subscription;
  modelTab: string;
  modelTabSubscription: Subscription;
  
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })
  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
  }
}
