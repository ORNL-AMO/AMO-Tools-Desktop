import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { FilterCompressorOptions } from '../filter-compressors.pipe';

@Component({
  selector: 'app-compressor-options-table',
  templateUrl: './compressor-options-table.component.html',
  styleUrls: ['./compressor-options-table.component.css']
})
export class CompressorOptionsTableComponent implements OnInit {

  genericCompressors: Array<GenericCompressor>;
  filterCompressorOptionsSub: Subscription;
  filterCompressorOptions: FilterCompressorOptions
  constructor(private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.genericCompressors = this.genericCompressorDbService.genericCompressors;
    this.filterCompressorOptionsSub = this.inventoryService.filterCompressorOptions.subscribe(val => {
      this.filterCompressorOptions = val;
    });
  }

  ngOnDestroy(){
    this.filterCompressorOptionsSub.unsubscribe();
  }

  selectCompressor(compressor: GenericCompressor){

  }
}
