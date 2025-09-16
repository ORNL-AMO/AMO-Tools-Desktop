import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PumpInventoryService } from '../../pump-inventory.service';

@Component({
    selector: 'app-pump-fluid-help',
    templateUrl: './pump-fluid-help.component.html',
    styleUrls: ['./pump-fluid-help.component.css'],
    standalone: false
})
export class PumpFluidHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.focusedFieldSub = this.pumpInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
