import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FanSystemChecklistService } from '../fan-system-checklist.service';

@Component({
    selector: 'app-fan-system-checklist-help',
    templateUrl: './fan-system-checklist-help.component.html',
    styleUrls: ['./fan-system-checklist-help.component.css'],
    standalone: false
})
export class FanSystemChecklistHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private fanSystemChecklistService: FanSystemChecklistService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.fanSystemChecklistService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }
}
