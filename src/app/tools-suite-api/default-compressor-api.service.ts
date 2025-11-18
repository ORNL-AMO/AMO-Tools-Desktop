// import { GenericCompressorDbService } from './../compressed-air-assessment/generic-compressor-db.service';
import { Injectable } from '@angular/core';
// import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { GenericCompressor } from './../compressed-air-assessment/generic-compressor-db.service';
// import { Settings } from '../shared/models/settings';
@Injectable({
    providedIn: 'root'
})
export class DefaultCompressorApiService {
    
    constructor(
        private toolsSuiteApiService: ToolsSuiteApiService,
    ) { }

    getGenericCompressors(){
        let DefaultData = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
                // console.log('b 3', Object.getOwnPropertyNames(Object.getPrototypeOf(DefaultData)));
        let suiteDefaultMaterials = DefaultData.getCompressorData();
        // console.log(suiteDefaultMaterials);
        let defaultCompressors: Array<GenericCompressor> = [];

        // for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
        //     let wasmClass = suiteDefaultMaterials.get(i);
        //     let genericCompressor: GenericCompressor = this.getGenericCompressorsFromWASM(wasmClass);
        //     defaultCompressors.push(genericCompressor);
        //     wasmClass.delete();
        // }
        // DefaultData.delete();
        // suiteDefaultMaterials.delete();
        // return defaultCompressors;
    }   

    getGenericCompressorsFromWASM(suiteDbCompressorPointer): GenericCompressor {

        let GenericCompressor = {
            BlowdownTime: suiteDbCompressorPointer.getBlowdownTime(),
            DesignInPressure: suiteDbCompressorPointer.getDesignInPressure(),
            DesignInTemp: suiteDbCompressorPointer.getDesignInTemp(),
            DesignSurgeFlow: suiteDbCompressorPointer.getDesignSurgeFlow(),
            HP: suiteDbCompressorPointer.getHP(),
            IDCompLib: suiteDbCompressorPointer.getIDCompLib(),
            IDCompType: suiteDbCompressorPointer.getIDCompType(),
            IDControlType: suiteDbCompressorPointer.getIDControlType(),
            MaxFullFlowPressure: suiteDbCompressorPointer.getMaxFullFlowPressure(),
            MaxPressSurgeFlow: suiteDbCompressorPointer.getMaxPressSurgeFlow(),
            MaxSurgePressure: suiteDbCompressorPointer.getMaxSurgePressure(),
            MinPressStonewallFlow: suiteDbCompressorPointer.getMinPressStonewallFlow(),
            MinStonewallPressure: suiteDbCompressorPointer.getMinStonewallPressure(),
            MinULSumpPressure: suiteDbCompressorPointer.getMinULSumpPressure(),
            Model: suiteDbCompressorPointer.getModel(),
            ModulatingPressRange: suiteDbCompressorPointer.getModulatingPressRange(),
            NoLoadPowerFM: suiteDbCompressorPointer.getNoLoadPowerFM(),
            NoLoadPowerUL: suiteDbCompressorPointer.getNoLoadPowerUL(), 
            PowerFLBHP: suiteDbCompressorPointer.getPowerFLBHP(),
            RatedCapacity: suiteDbCompressorPointer.getRatedCapacity(),
            RatedPressure: suiteDbCompressorPointer.getRatedPressure(),
            SpecPackagePower: suiteDbCompressorPointer.getSpecPackagePower(),
            TotPackageInputPower: suiteDbCompressorPointer.getTotPackageInputPower(),
            UnloadPoint: suiteDbCompressorPointer.getUnloadPoint(),
            UnloadSteps: suiteDbCompressorPointer.getUnloadSteps(),
            AmpsFL: suiteDbCompressorPointer.getAmpsFL(),
            EffFL: suiteDbCompressorPointer.getEffFL()
        };
        console.log(GenericCompressor);
        return GenericCompressor
    }
}