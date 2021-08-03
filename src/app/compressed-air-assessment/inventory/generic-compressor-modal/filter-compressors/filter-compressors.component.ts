import { Component, OnInit } from '@angular/core';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { CompressorTypeOption, CompressorTypeOptions, ControlType, ControlTypes } from '../../inventoryOptions';
import { FilterCompressorOptions } from '../filter-compressors.pipe';
import * as _ from 'lodash';

@Component({
  selector: 'app-filter-compressors',
  templateUrl: './filter-compressors.component.html',
  styleUrls: ['./filter-compressors.component.css']
})
export class FilterCompressorsComponent implements OnInit {

  filterCompressorOptions: FilterCompressorOptions;
  compressorTypeOptions: Array<CompressorTypeOption>;
  controlTypes: Array<ControlType>;
  horsePowerOptions: Array<number>;
  minLabel: string = 'Min';
  maxLabel: string = 'Max';
  constructor(private inventoryService: InventoryService, private genericCompressorDbService: GenericCompressorDbService) { }

  ngOnInit(): void {
    let genericCompressors: Array<GenericCompressor> = this.genericCompressorDbService.genericCompressors;

    let uniqHpCompressors: Array<GenericCompressor> = _.uniqBy(genericCompressors, 'HP');
    this.horsePowerOptions = _.map(uniqHpCompressors, (compressor) => { return compressor.HP });

    this.compressorTypeOptions = CompressorTypeOptions;
    this.controlTypes = ControlTypes;
    this.filterCompressorOptions = this.inventoryService.filterCompressorOptions.getValue();
    if (this.filterCompressorOptions == undefined) {
      this.initFilterCompressorOptions(genericCompressors);
    }
  }


  initFilterCompressorOptions(genericCompressors: Array<GenericCompressor>) {
    this.filterCompressorOptions = {
      IDCompType: undefined,
      IDControlType: undefined,
      HP: undefined,
      ratedCapacityMin: Math.floor(_.minBy(genericCompressors, 'RatedCapacity').RatedCapacity),
      ratedCapacityMax: Math.ceil(_.maxBy(genericCompressors, 'RatedCapacity').RatedCapacity),
      ratedPressureMin: Math.floor(_.minBy(genericCompressors, 'RatedPressure').RatedPressure),
      ratedPressureMax: Math.ceil(_.maxBy(genericCompressors, 'RatedPressure').RatedPressure),
      maxFullFlowMin: Math.floor(_.minBy(genericCompressors, 'MaxFullFlowPressure').MaxFullFlowPressure),
      maxFullFlowMax: Math.ceil(_.maxBy(genericCompressors, 'MaxFullFlowPressure').MaxFullFlowPressure)
    }
    this.save();
  }

  save() {
    this.inventoryService.filterCompressorOptions.next(this.filterCompressorOptions);
  }

}
