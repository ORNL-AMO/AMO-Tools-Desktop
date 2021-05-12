import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { CompressorTypeOptions, ControlTypes } from './inventory/inventoryOptions';
@Injectable()
export class GenericCompressorDbService {

  genericCompressors: Array<GenericCompressor>;
  constructor() { }

  getAllCompressors() {
    if (this.genericCompressors == undefined) {
      Papa.parse("assets/compressor-lib.csv", {
        header: true,
        download: true,
        complete: results => {
          this.setGenericCompressors(results.data);
        }
      });
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
    let compressor: GenericCompressor = this.genericCompressors.find(compressor => {return compressor.IDCompLib == IDCompLib});
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