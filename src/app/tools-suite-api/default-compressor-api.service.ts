import { Injectable } from '@angular/core';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { GenericCompressor } from '../shared/generic-compressor-db.service';
import { type CompressorCatalogRecord, type CompressorCatalogRecordV, type DefaultData } from 'measur-tools-suite';
@Injectable({
    providedIn: 'root'
})
export class DefaultCompressorApiService {

    constructor(
        private toolsSuiteApiService: ToolsSuiteApiService,
    ) { }

    getGenericCompressors(): Array<GenericCompressor> {
        let DefaultDataInstance: DefaultData = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
        let defaultCompressors: Array<GenericCompressor> = [];

        let wasmCompressors: CompressorCatalogRecordV = DefaultDataInstance.getCompressorType1Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType1_GT100kWData();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType2Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType3Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType4Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType5Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        wasmCompressors = DefaultDataInstance.getCompressorType6Data();
        this.buildDefaultCompressorList(wasmCompressors, defaultCompressors);

        DefaultDataInstance.delete();
        return defaultCompressors;
    }

    buildDefaultCompressorList(wasmCompressors: CompressorCatalogRecordV, defaultCompressors: Array<GenericCompressor>): void {
        for (let i: number = 0; i < wasmCompressors.size(); i++) {
            let wasmClass: CompressorCatalogRecord = wasmCompressors.get(i);
            let genericCompressor: GenericCompressor = this.getGenericCompressorFromWASM(wasmClass);
            defaultCompressors.push(genericCompressor);
        }
        wasmCompressors.delete();
    }

    getGenericCompressorFromWASM(suiteDbCompressorPointer: CompressorCatalogRecord): GenericCompressor {
        let GenericCompressor: GenericCompressor = {
            BlowdownTime: suiteDbCompressorPointer.blowdownTimeSec,
            DesignInPressure: suiteDbCompressorPointer.designInletPressurePsia,
            DesignInTemp: suiteDbCompressorPointer.designInletTemperatureF,
            DesignSurgeFlow: suiteDbCompressorPointer.designSurgeFlowAcfm,
            HP: suiteDbCompressorPointer.horsepower,
            IDCompType: suiteDbCompressorPointer.compressorTypeId,
            IDControlType: suiteDbCompressorPointer.controlTypeId,
            MaxFullFlowPressure: suiteDbCompressorPointer.maxFullFlowPressurePsig,
            MaxPressSurgeFlow: suiteDbCompressorPointer.maxSurgePressureFlowAcfm,
            MaxSurgePressure: suiteDbCompressorPointer.maxSurgePressurePsig,
            MinPressStonewallFlow: suiteDbCompressorPointer.minStonewallPressureFlowAcfm,
            MinStonewallPressure: suiteDbCompressorPointer.minStonewallPressurePsig,
            MinULSumpPressure: suiteDbCompressorPointer.minUnloadSumpPressurePsig,
            Model: suiteDbCompressorPointer.model,
            ModulatingPressRange: suiteDbCompressorPointer.modulatingPressureRangePsig,
            NoLoadPowerFM: suiteDbCompressorPointer.noLoadPowerFullyModulating,
            NoLoadPowerUL: suiteDbCompressorPointer.noLoadPowerUnload,
            PowerFLBHP: suiteDbCompressorPointer.fullLoadBhpPowerKw,
            RatedCapacity: suiteDbCompressorPointer.ratedCapacityAcfm,
            RatedPressure: suiteDbCompressorPointer.ratedPressurePsig,
            SpecPackagePower: suiteDbCompressorPointer.specificPackagePower,
            TotPackageInputPower: suiteDbCompressorPointer.totalPackageInputPowerKw,
            UnloadPoint: suiteDbCompressorPointer.unloadPointPercent,
            UnloadSteps: suiteDbCompressorPointer.unloadSteps,
            AmpsFL: suiteDbCompressorPointer.fullLoadAmps,
            EffFL: suiteDbCompressorPointer.fullLoadEfficiencyPercent
        };


        return GenericCompressor
    }
}
