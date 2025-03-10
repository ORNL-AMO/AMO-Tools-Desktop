import { Component, OnInit } from '@angular/core';
import { CompressorTypeOption, CompressorTypeOptions, ControlType, ControlTypes } from '../../../../compressed-air-inventory';
import { FilterCompressorOptions } from '../filter-compressors-pipe.pipe';
import { Settings } from '../../../../../shared/models/settings';
import { ExistingCompressorDbService, GenericCompressor } from '../../../../existing-compressor-db.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import _ from 'lodash';

@Component({
  selector: 'app-filter-compressors',
  templateUrl: './filter-compressors.component.html',
  styleUrl: './filter-compressors.component.css'
})
export class FilterCompressorsComponent implements OnInit {

  filterCompressorOptions: FilterCompressorOptions;
  compressorTypeOptions: Array<CompressorTypeOption>;
  controlTypes: Array<ControlType>;
  horsePowerOptions: Array<number>;
  minLabel: string = 'Min';
  maxLabel: string = 'Max';
  settings: Settings;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private existingCompressorDbService: ExistingCompressorDbService,
    private compressedAirInventoryService: CompressedAirInventoryService) { }


  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    let genericCompressors: Array<GenericCompressor> = this.existingCompressorDbService.genericCompressors;

    let uniqHpCompressors: Array<GenericCompressor> = _.uniqBy(genericCompressors, 'HP');
    this.horsePowerOptions = _.map(uniqHpCompressors, (compressor) => { return compressor.HP });

    this.compressorTypeOptions = CompressorTypeOptions;
    this.filterCompressorOptions = this.compressedAirCatalogService.filterCompressorOptions.getValue();
    if (this.filterCompressorOptions == undefined || this.filterCompressorOptions.unitsOfMeasure != this.settings.unitsOfMeasure) {
      this.initFilterCompressorOptions(genericCompressors);
    }
    this.setControlTypes();
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
      maxFullFlowMax: Math.ceil(_.maxBy(genericCompressors, 'MaxFullFlowPressure').MaxFullFlowPressure),
      unitsOfMeasure: this.settings.unitsOfMeasure
    }
    this.save();
  }

  save() {
    this.compressedAirCatalogService.filterCompressorOptions.next(this.filterCompressorOptions);
  }

  resetFilters() {
    let genericCompressors: Array<GenericCompressor> = this.existingCompressorDbService.genericCompressors;
    this.initFilterCompressorOptions(genericCompressors);
  }


  setControlTypes(save?: boolean) {
    //no start/stop in DB
    if (this.filterCompressorOptions.IDCompType != undefined) {
      this.controlTypes = ControlTypes.filter(type => { return type.compressorTypes.includes(this.filterCompressorOptions.IDCompType) && type.value != 6 });
      if (this.filterCompressorOptions.IDControlType != undefined) {
        let controlOptionSelected: { value: number, label: string, compressorTypes: Array<number> } = this.controlTypes.find(option => {
          return option.value == this.filterCompressorOptions.IDControlType;
        });
        if (!controlOptionSelected) {
          this.filterCompressorOptions.IDControlType = undefined;
        }
      }
    } else {
      this.controlTypes = ControlTypes.filter(type => { return type.value != 6 });
    }

    if (save) {
      this.save();
    }
  }

}
