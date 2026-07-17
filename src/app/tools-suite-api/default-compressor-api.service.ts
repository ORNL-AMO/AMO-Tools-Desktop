import { Injectable } from '@angular/core';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { GenericCompressor } from '../shared/generic-compressor-db.service';
@Injectable({
    providedIn: 'root'
})
export class DefaultCompressorApiService {

    constructor(
        private toolsSuiteApiService: ToolsSuiteApiService,
    ) { }

    getGenericCompressors() {
        let DefaultDataInstance = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
        let defaultCompressors: Array<GenericCompressor> = [];

        let wasmCompressors = DefaultDataInstance.getCompressorType1Data();
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

    buildDefaultCompressorList(wasmCompressors, defaultCompressors: Array<GenericCompressor>) {
        for (let i = 0; i < wasmCompressors.size(); i++) {
            let wasmClass = wasmCompressors.get(i);
            let genericCompressor: GenericCompressor = this.getGenericCompressorFromWASM(wasmClass);
            defaultCompressors.push(genericCompressor);
        }
    }

    getGenericCompressorFromWASM(suiteDbCompressorPointer): GenericCompressor {
        let GenericCompressor = {
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
