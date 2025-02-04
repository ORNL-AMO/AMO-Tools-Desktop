import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { CompressedAirBasicsService } from './compressed-air-basics.service';

@Component({
  selector: 'app-compressed-air-basics',
  templateUrl: './compressed-air-basics.component.html',
  styleUrl: './compressed-air-basics.component.css'
})
export class CompressedAirBasicsComponent implements OnInit {

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirBasicsService: CompressedAirBasicsService) { }

  ngOnInit(): void {
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAirItem => {
      if (selectedCompressedAirItem) {
        this.form = this.compressedAirBasicsService.getFormFromCompressedAirItem(selectedCompressedAirItem);
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir = this.compressedAirBasicsService.updateCompressedAirItemFromForm(this.form, selectedCompressedAir);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('basics');
    this.compressedAirInventoryService.focusedField.next(str);
  }
}