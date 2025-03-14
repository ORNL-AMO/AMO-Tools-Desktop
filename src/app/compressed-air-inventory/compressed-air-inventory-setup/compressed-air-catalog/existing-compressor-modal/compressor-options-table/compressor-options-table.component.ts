import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ExistingCompressorDbService, GenericCompressor } from '../../../../existing-compressor-db.service';
import { Subscription } from 'rxjs';
import { FilterCompressorOptions, FilterCompressorsPipePipe } from '../filter-compressors-pipe.pipe';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressorDataManagementService } from '../../../../compressor-data-management.service';

@Component({
  selector: 'app-compressor-options-table-inventory',
  templateUrl: './compressor-options-table.component.html',
  styleUrl: './compressor-options-table.component.css'
})
export class CompressorOptionsTableComponent implements OnInit {

   @Output('emitClose')
    emitClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  
    genericCompressors: Array<GenericCompressor>;
    filterCompressorOptionsSub: Subscription;
    filterCompressorOptions: FilterCompressorOptions;
    itemsPerPage: number = 25;
    pageNumber: number = 1;
    filteredCompressors: Array<GenericCompressor>;
    settings: Settings;
    constructor(private existingCompressorDbService: ExistingCompressorDbService, private compressedAirCatalogService: CompressedAirCatalogService,
      private compressorDataManagementService: CompressorDataManagementService, private compressedAirInventoryService: CompressedAirInventoryService) { }
  
    ngOnInit(): void {
      this.settings = this.compressedAirInventoryService.settings.getValue();
      this.genericCompressors = this.existingCompressorDbService.genericCompressors;
      this.filterCompressorOptionsSub = this.compressedAirCatalogService.filterCompressorOptions.subscribe(val => {
        this.filterCompressorOptions = val;
        let genericCompressorsCopy: Array<GenericCompressor> = JSON.parse(JSON.stringify(this.genericCompressors));
        this.filteredCompressors = new FilterCompressorsPipePipe().transform(genericCompressorsCopy, this.filterCompressorOptions);
      });
    }
  
    ngOnDestroy() {
      this.filterCompressorOptionsSub.unsubscribe();
    }
  
    selectCompressor(genericCompressor: GenericCompressor) {
      this.compressorDataManagementService.setCompressorDataFromGenericCompressorDb(genericCompressor);
      this.emitClose.emit(true);
    }

}
