import { Component, OnInit } from '@angular/core';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { CompressorTypeOption, CompressorTypeOptions, ControlType, ControlTypes } from '../../inventoryOptions';
import { FilterCompressorOptions } from '../filter-compressors.pipe';
import * as _ from 'lodash';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-filter-compressors',
    templateUrl: './filter-compressors.component.html',
    styleUrls: ['./filter-compressors.component.css'],
    standalone: false
})
export class FilterCompressorsComponent implements OnInit {

  filterCompressorOptions: FilterCompressorOptions;
  compressorTypeOptions: Array<CompressorTypeOption>;
  controlTypes: Array<ControlType>;
  horsePowerOptions: Array<number>;
  minLabel: string = 'Min';
  maxLabel: string = 'Max';
  settings: Settings;
  constructor(private inventoryService: InventoryService, private genericCompressorDbService: GenericCompressorDbService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    let genericCompressors: Array<GenericCompressor> = this.genericCompressorDbService.genericCompressors;

    let uniqHpCompressors: Array<GenericCompressor> = _.uniqBy(genericCompressors, 'HP');
    this.horsePowerOptions = _.map(uniqHpCompressors, (compressor) => { return compressor.HP });

    this.compressorTypeOptions = CompressorTypeOptions;
    this.filterCompressorOptions = this.inventoryService.filterCompressorOptions.getValue();
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
    this.inventoryService.filterCompressorOptions.next(this.filterCompressorOptions);
  }

  resetFilters(){
    let genericCompressors: Array<GenericCompressor> = this.genericCompressorDbService.genericCompressors;
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
