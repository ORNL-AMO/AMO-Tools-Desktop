import { Component } from '@angular/core';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-centrifugal-help',
  templateUrl: './centrifugal-help.component.html',
  styleUrl: './centrifugal-help.component.css',
  standalone: false
})
export class CentrifugalHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

}
