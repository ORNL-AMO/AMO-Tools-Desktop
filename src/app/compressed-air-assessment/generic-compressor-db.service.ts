import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { CompressorTypeOptions, ControlTypes } from './inventory/inventoryOptions';
@Injectable()
export class GenericCompressorDbService {

  genericCompressors: Array<GenericCompressor>;
  unitsOfMeasure: string = 'Imperial';
  constructor(private convertUnitsService: ConvertUnitsService) { }

  getAllCompressors(settings: Settings) {
    if (this.genericCompressors == undefined) {
      Papa.parse("assets/compressor-lib.csv", {
        header: true,
        download: true,
        complete: results => {
          this.setGenericCompressors(results.data);
          if (settings.unitsOfMeasure == 'Metric') {
            this.convertGenericCompressors(settings.unitsOfMeasure);
          }
        }
      });
    } else if (this.unitsOfMeasure != settings.unitsOfMeasure) {
      this.convertGenericCompressors(settings.unitsOfMeasure)
    }
  }

  setGenericCompressors(csvResults: Array<any>) {
    this.genericCompressors = new Array();
    csvResults.forEach(result => {
      if (result['Model']) {
        this.genericCompressors.push({
          BlowdownTime: Number(result['BlowdownTime']),
          DesignInPressure: Number(result['DesignInPressure']),
          DesignInTemp: Number(result['DesignInTemp']),
          DesignSurgeFlow: Number(result['DesignSurgeFlow']),
          HP: Number(result['HP']),
          IDCompLib: Number(result['IDCompLib']),
          IDCompType: Number(result['IDCompType']),
          IDControlType: Number(result['IDControlType']),
          MaxFullFlowPressure: Number(result['MaxFullFlowPressure']),
          MaxPressSurgeFlow: Number(result['MaxPressSurgeFlow']),
          MaxSurgePressure: Number(result['MaxSurgePressure']),
          MinPressStonewallFlow: Number(result['MinPressStonewallFlow']),
          MinStonewallPressure: Number(result['MinStonewallPressure']),
          MinULSumpPressure: Number(result['MinULSumpPressure']),
          Model: result['Model'],
          ModulatingPressRange: Number(result['ModulatingPressRange']),
          NoLoadPowerFM: Number(result['NoLoadPowerFM']),
          NoLoadPowerUL: Number(result['NoLoadPowerUL']),
          PowerFLBHP: Number(result['PowerFLBHP']),
          RatedCapacity: Number(result['RatedCapacity']),
          RatedPressure: Number(result['RatedPressure']),
          SpecPackagePower: Number(result['SpecPackagePower']),
          TotPackageInputPower: Number(result['TotPackageInputPower']),
          UnloadPoint: Number(result['UnloadPoint']),
          UnloadSteps: Number(result['UnloadSteps']),
          AmpsFL: Number(result['AmpsFL']),
          EffFL: Number(result['EffFL'])
        });
      }
    });
  }


  getCompressorById(IDCompLib: number): GenericCompressor {
    let compressor: GenericCompressor = this.genericCompressors.find(compressor => { return compressor.IDCompLib == IDCompLib });
    return compressor;
  }

  getCompressorTypeLabel(IDCompType: number): string {
    let compressorType: { value: number, label: string, enumValue: number, lubricantTypeEnumValue: number, stageTypeEnumValue: number } = CompressorTypeOptions.find(option => { return option.value == IDCompType });
    if (compressorType) {
      return compressorType.label;
    }
    return;
  }

  getControlTypeLabel(IDControlType: number): string {
    let controlType: { value: number, label: string, compressorTypes: Array<number>, enumValue: number } = ControlTypes.find(type => { return type.value == IDControlType });
    if (controlType) {
      return controlType.label;
    }
    return;
  }

  convertGenericCompressors(newUnitsOfMeasure: string) {
    this.genericCompressors.forEach(compressor => {
      compressor.DesignInPressure = this.convertPressure(compressor.DesignInPressure, newUnitsOfMeasure);
      compressor.DesignInTemp = this.convertTemperature(compressor.DesignInTemp, newUnitsOfMeasure);
      compressor.DesignSurgeFlow = this.convertAirflow(compressor.DesignSurgeFlow, newUnitsOfMeasure);
      compressor.MaxFullFlowPressure = this.convertPressure(compressor.MaxFullFlowPressure, newUnitsOfMeasure);
      compressor.MaxPressSurgeFlow = this.convertAirflow(compressor.MaxPressSurgeFlow, newUnitsOfMeasure);
      compressor.MaxSurgePressure = this.convertPressure(compressor.MaxSurgePressure, newUnitsOfMeasure);
      compressor.MinPressStonewallFlow = this.convertAirflow(compressor.MinPressStonewallFlow, newUnitsOfMeasure);
      compressor.MinStonewallPressure = this.convertPressure(compressor.MinStonewallPressure, newUnitsOfMeasure);
      compressor.MinULSumpPressure = this.convertPressure(compressor.MinULSumpPressure, newUnitsOfMeasure);
      compressor.ModulatingPressRange = this.convertPressure(compressor.ModulatingPressRange, newUnitsOfMeasure);
      compressor.RatedCapacity = this.convertAirflow(compressor.RatedCapacity, newUnitsOfMeasure);
      compressor.RatedPressure = this.convertPressure(compressor.RatedPressure, newUnitsOfMeasure);
    });
    this.unitsOfMeasure = newUnitsOfMeasure;
  }

  convertPressure(value: number, newUnitsOfMeasure: string): number {
    if (newUnitsOfMeasure == 'Metric') {
      value = this.convertUnitsService.value(value).from('psig').to('barg');
    } else if (newUnitsOfMeasure == 'Imperial') {
      value = this.convertUnitsService.value(value).from('barg').to('psig');
    }
    value = this.convertUnitsService.roundVal(value, 4)
    return value;
  }

  convertAirflow(value: number, newUnitsOfMeasure: string): number {
    if (newUnitsOfMeasure == 'Metric') {
      value = this.convertUnitsService.value(value).from('ft3/min').to('m3/min');
    } else if (newUnitsOfMeasure == 'Imperial') {
      value = this.convertUnitsService.value(value).from('m3/min').to('ft3/min');
    }
    value = this.convertUnitsService.roundVal(value, 4)
    return value;
  }

  convertTemperature(value: number, newUnitsOfMeasure: string): number {
    if (newUnitsOfMeasure == 'Metric') {
      value = this.convertUnitsService.value(value).from('F').to('C');
    } else if (newUnitsOfMeasure == 'Imperial') {
      value = this.convertUnitsService.value(value).from('C').to('F');
    }
    value = this.convertUnitsService.roundVal(value, 4)
    return value;
  }
}


export interface GenericCompressor {
  BlowdownTime: number,
  DesignInPressure: number,
  DesignInTemp: number,
  DesignSurgeFlow: number,
  HP: number,
  IDCompLib: number,
  IDCompType: number,
  IDControlType: number,
  MaxFullFlowPressure: number,
  MaxPressSurgeFlow: number,
  MaxSurgePressure: number,
  MinPressStonewallFlow: number,
  MinStonewallPressure: number,
  MinULSumpPressure: number,
  Model: string,
  ModulatingPressRange: number,
  NoLoadPowerFM: number,
  NoLoadPowerUL: number,
  PowerFLBHP: number,
  RatedCapacity: number,
  RatedPressure: number,
  SpecPackagePower: number,
  TotPackageInputPower: number,
  UnloadPoint: number,
  UnloadSteps: number,
  AmpsFL: number,
  EffFL: number
}