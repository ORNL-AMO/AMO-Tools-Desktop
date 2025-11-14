import { Injectable } from '@angular/core';
import { SuiteDbMotor } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';


@Injectable({
    providedIn: 'root'
})
export class DefaultCompressorApiService {
    
    constructor(private suiteApiHelperService: SuiteApiHelperService,
        private toolsSuiteApiService: ToolsSuiteApiService
    ) { }

    getMotors(): Array<SuiteDbMotor> {
        let DefaultData = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
        console.log(DefaultData);
        let suiteDefaultMaterials = DefaultData.getMotorData();

        let defaultMotors: Array<SuiteDbMotor> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
        let wasmClass = suiteDefaultMaterials.get(i);
        let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(wasmClass);
        defaultMotors.push(suiteDbMotor);
        wasmClass.delete();
        }
        DefaultData.delete();
        suiteDefaultMaterials.delete();
        return defaultMotors;
    }
}