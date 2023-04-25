import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PumpItem } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpBasicsService } from './pump-basics.service';

@Component({
  selector: 'app-pump-basics',
  templateUrl: './pump-basics.component.html',
  styleUrls: ['./pump-basics.component.css']
})
export class PumpBasicsComponent implements OnInit {

  form: FormGroup;
  selectedPumpItemSub: Subscription;
  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private pumpBasicsService: PumpBasicsService) { }

  ngOnInit(): void {
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPumpItem => {
      if (selectedPumpItem) {
        this.form = this.pumpBasicsService.getFormFromPumpItem(selectedPumpItem);
      }
    });
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump = this.pumpBasicsService.updatepumpItemFromForm(this.form, selectedPump);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('basics');
    this.pumpInventoryService.focusedField.next(str);
  }
}
