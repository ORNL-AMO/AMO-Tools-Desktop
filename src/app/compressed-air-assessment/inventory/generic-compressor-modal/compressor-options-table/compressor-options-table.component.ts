import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { FilterCompressorOptions, FilterCompressorsPipe } from '../filter-compressors.pipe';

@Component({
  selector: 'app-compressor-options-table',
  templateUrl: './compressor-options-table.component.html',
  styleUrls: ['./compressor-options-table.component.css']
})
export class CompressorOptionsTableComponent implements OnInit {
  @Output('emitClose')
  emitClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  genericCompressors: Array<GenericCompressor>;
  filterCompressorOptionsSub: Subscription;
  filterCompressorOptions: FilterCompressorOptions
  itemsPerPage: number = 25;
  pageNumber: number = 1;
  filteredCompressors: Array<GenericCompressor>;
  constructor(private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.genericCompressors = this.genericCompressorDbService.genericCompressors;
    this.filterCompressorOptionsSub = this.inventoryService.filterCompressorOptions.subscribe(val => {
      this.filterCompressorOptions = val;
      let genericCompressorsCopy: Array<GenericCompressor> = JSON.parse(JSON.stringify(this.genericCompressors));
      this.filteredCompressors = new FilterCompressorsPipe().transform(genericCompressorsCopy, this.filterCompressorOptions);
    });
  }

  ngOnDestroy() {
    this.filterCompressorOptionsSub.unsubscribe();
  }

  selectCompressor(genericCompressor: GenericCompressor) {
    this.compressedAirDataManagementService.setCompressorDataFromGenericCompressorDb(genericCompressor)
    this.emitClose.emit(true);
  }
}
