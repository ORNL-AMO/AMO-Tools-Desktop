import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';

@Component({
  selector: 'app-design-details-help',
  templateUrl: './design-details-help.component.html',
  styleUrl: './design-details-help.component.css',
  standalone: false
})
export class DesignDetailsHelpComponent {

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
