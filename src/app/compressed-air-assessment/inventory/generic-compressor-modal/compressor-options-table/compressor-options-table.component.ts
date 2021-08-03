import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../../performance-points/calculations/performance-point-calculations.service';
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
    private compressedAirAssessmentService: CompressedAirAssessmentService, private performancePointCalculationsService: PerformancePointCalculationsService) { }

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
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor = this.performancePointCalculationsService.setCompressorData(selectedCompressor, genericCompressor);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
    this.emitClose.emit(true);
  }
}
