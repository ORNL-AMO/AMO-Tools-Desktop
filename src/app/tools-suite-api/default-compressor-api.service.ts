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
            wasmClass.delete();
        }
    }

    getGenericCompressorFromWASM(suiteDbCompressorPointer): GenericCompressor {
        let GenericCompressor = {
            BlowdownTime: suiteDbCompressorPointer.blowdownTime(),
            DesignInPressure: suiteDbCompressorPointer.designInPressure(),
            DesignInTemp: suiteDbCompressorPointer.designInTemp(),
            DesignSurgeFlow: suiteDbCompressorPointer.designSurgeFlow(),
            HP: suiteDbCompressorPointer.hp(),
            IDCompLib: suiteDbCompressorPointer.ID(),
            IDCompType: suiteDbCompressorPointer.idCompType(),
            IDControlType: suiteDbCompressorPointer.idControlType(),
            MaxFullFlowPressure: suiteDbCompressorPointer.maxFullFlowPressure(),
            MaxPressSurgeFlow: suiteDbCompressorPointer.maxPressSurgeFlow(),
            MaxSurgePressure: suiteDbCompressorPointer.maxSurgePressure(),
            MinPressStonewallFlow: suiteDbCompressorPointer.minPressStonewallFlow(),
            MinStonewallPressure: suiteDbCompressorPointer.minStonewallPressure(),
            MinULSumpPressure: suiteDbCompressorPointer.minULSumpPressure(),
            Model: suiteDbCompressorPointer.model(),
            ModulatingPressRange: suiteDbCompressorPointer.modulatingPressRange(),
            NoLoadPowerFM: suiteDbCompressorPointer.noLoadPowerFM(),
            NoLoadPowerUL: suiteDbCompressorPointer.noLoadPowerUL(),
            PowerFLBHP: suiteDbCompressorPointer.powerFLBHP(),
            RatedCapacity: suiteDbCompressorPointer.ratedCapacity(),
            RatedPressure: suiteDbCompressorPointer.ratedPressure(),
            SpecPackagePower: suiteDbCompressorPointer.specPackagePower(),
            TotPackageInputPower: suiteDbCompressorPointer.totPackageInputPower(),
            UnloadPoint: suiteDbCompressorPointer.unloadPoint(),
            UnloadSteps: suiteDbCompressorPointer.unloadSteps(),
            AmpsFL: suiteDbCompressorPointer.ampsFL(),
            EffFL: suiteDbCompressorPointer.effFL()
        };


        console.log(GenericCompressor);
        return GenericCompressor
    }
}