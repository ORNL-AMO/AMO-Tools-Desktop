import { CentrifugalSpecifics, CompressorControls, CompressorNameplateData, DesignDetails, PerformancePoints, SystemInformation } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { BlowoffPerformancePoint } from "./BlowoffPerformancePoint";
import { FullLoadPerformancePoint } from "./FullLoadPerformancePoint";
import { MaxFullFlowPerformancePoint } from "./MaxFullFlowPerformancePoint";
import { MidTurndownPerformancePoint } from "./MidTurndownPerformancePoint";
import { NoLoadPerformancePoint } from "./NoLoadPerformancePoint";
import { TurndownPerformancePoint } from "./TurndownPerformancePoint";
import { UnloadPointPerformancePoint } from "./UnloadPointPerformancePoint";


export class CompressorPerformancePointsClass implements PerformancePoints {

    fullLoad: FullLoadPerformancePoint;
    maxFullFlow: MaxFullFlowPerformancePoint;
    midTurndown: MidTurndownPerformancePoint;
    turndown: TurndownPerformancePoint;
    unloadPoint: UnloadPointPerformancePoint;
    noLoad: NoLoadPerformancePoint;
    blowoff: BlowoffPerformancePoint;
    constructor(performancePoints: PerformancePoints) {
        this.fullLoad = new FullLoadPerformancePoint(performancePoints.fullLoad);
        this.maxFullFlow = new MaxFullFlowPerformancePoint(performancePoints.maxFullFlow);
        this.midTurndown = new MidTurndownPerformancePoint(performancePoints.midTurndown);
        this.turndown = new TurndownPerformancePoint(performancePoints.turndown);
        this.unloadPoint = new UnloadPointPerformancePoint(performancePoints.unloadPoint);
        this.noLoad = new NoLoadPerformancePoint(performancePoints.noLoad);
        this.blowoff = new BlowoffPerformancePoint(performancePoints.blowoff);
    }

    adjustCompressorPerformancePointsWithSequencer(
        systemInformation: SystemInformation,
        nameplateData: CompressorNameplateData,
        centrifugalSpecifics: CentrifugalSpecifics,
        designDetails: DesignDetails,
        compressorControls: CompressorControls,
        settings: Settings
    ) {
        this.fullLoad.isDefaultPressure = false;
        this.fullLoad.isDefaultAirFlow = true;
        this.fullLoad.isDefaultPower = true;
        this.maxFullFlow.isDefaultAirFlow = true;
        this.maxFullFlow.isDefaultPressure = true;
        this.maxFullFlow.isDefaultPower = true;
        this.noLoad.isDefaultAirFlow = true;
        this.noLoad.isDefaultPressure = true;
        this.noLoad.isDefaultPower = true;
        this.unloadPoint.isDefaultAirFlow = true;
        this.unloadPoint.isDefaultPressure = true;
        this.unloadPoint.isDefaultPower = true;
        this.blowoff.isDefaultAirFlow = true;
        this.blowoff.isDefaultPressure = true;
        this.blowoff.isDefaultPower = true;

        this.fullLoad.dischargePressure = systemInformation.targetPressure - systemInformation.variance;

        if (compressorControls.controlType == 2 || compressorControls.controlType == 3 || compressorControls.controlType == 8 || compressorControls.controlType == 10 || compressorControls.controlType == 5) {
            this.unloadPoint.dischargePressure = systemInformation.targetPressure + systemInformation.variance;
            this.unloadPoint.isDefaultPressure = false;
            if (this.maxFullFlow.dischargePressure > this.fullLoad.dischargePressure) {
                this.maxFullFlow.dischargePressure = this.fullLoad.dischargePressure;
                this.maxFullFlow.isDefaultPressure = false;
            }
        } else if (compressorControls.controlType == 1) {
            this.noLoad.dischargePressure = systemInformation.targetPressure + systemInformation.variance;
            this.noLoad.isDefaultPressure = false;
        } else if (compressorControls.controlType == 6 || compressorControls.controlType == 4) {
            this.maxFullFlow.dischargePressure = systemInformation.targetPressure + systemInformation.variance;
            this.maxFullFlow.isDefaultPressure = false;
        } else if (compressorControls.controlType == 7 || compressorControls.controlType == 9) {
            this.blowoff.dischargePressure = systemInformation.targetPressure + systemInformation.variance;
            this.blowoff.isDefaultPressure = false;
        }
        this.updatePerformancePoints(nameplateData, centrifugalSpecifics, designDetails, compressorControls, systemInformation.atmosphericPressure, settings);
    }

    updatePerformancePoints(
        nameplateData: CompressorNameplateData,
        centrifugalSpecifics: CentrifugalSpecifics,
        designDetails: DesignDetails,
        compressorControls: CompressorControls,
        atmosphericPressure: number,
        settings: Settings
    ) {

        this.fullLoad.setPoints(nameplateData, centrifugalSpecifics, designDetails, atmosphericPressure, settings);
        if (compressorControls.controlType == 1) {
            //lube mod without unloading
            this.setWithoutUnloadingPerformancePoints(nameplateData, compressorControls, designDetails, settings);
        }
        else if (compressorControls.controlType == 2) {
            //lube mod with unloading
            this.setWithUnloadingPerformancePoints(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 3) {
            //variable displacement
            this.setVariableDisplacementPerformancePoints(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 4 && nameplateData.compressorType != 6) {
            //load/unload (non-centrifugal)
            this.setLubricatedLoadUnloadPerformancePoints(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 6) {
            //start/stop
            this.setStartStopPerformancePoints(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 5) {
            //multi-step unloading
            this.setMultiStepUnloading(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 8) {
            //inlet butterfly modulation with unloading
            this.setInletButterflyModulationWithUnloading(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 7 || compressorControls.controlType == 9) {
            //blowoff
            this.setInletButterflyModulationWithBlowoff(designDetails, centrifugalSpecifics, settings);
        }
        else if (compressorControls.controlType == 10) {
            //inlet van modulation with unloading
            this.setInletVaneModulationWithUnloading(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
        else if (compressorControls.controlType == 11) {
            //VFD
            this.setVFDPerformancePoints(designDetails, nameplateData, compressorControls, settings);
        }
        else if (compressorControls.controlType == 4 && nameplateData.compressorType == 6) {
            //load/unload (non-centrifugal)
            this.setLubricatedLoadUnloadCentrifugalPerformancePoints(designDetails, nameplateData, centrifugalSpecifics, compressorControls, atmosphericPressure, settings);
        }
    }

    //WITH UNLOADING
    setWithUnloadingPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //unloadPoint
        this.unloadPoint.setPoints(nameplateData, designDetails, centrifugalSpecifics, compressorControls, this.maxFullFlow, this.fullLoad, this.unloadPoint, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    setVFDPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, compressorControls: CompressorControls, settings: Settings) {
        //midturndown
        this.midTurndown.setPoints(compressorControls, this.fullLoad, settings);
        //turndown
        this.turndown.setPoints(compressorControls, this.fullLoad, settings);
        //no load
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //VARIABLE DISPLACMENT
    setVariableDisplacementPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //unloadPoint
        this.unloadPoint.setPoints(nameplateData, designDetails, centrifugalSpecifics, compressorControls, this.maxFullFlow, this.fullLoad, this.unloadPoint, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //LOAD/UNLOAD
    setLubricatedLoadUnloadPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //WITHOUT UNLOADING
    setWithoutUnloadingPerformancePoints(nameplateData: CompressorNameplateData, compressorControls: CompressorControls, designDetails: DesignDetails, settings: Settings) {
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //START STOP
    setStartStopPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //MULTI STEP UNLOADING
    setMultiStepUnloading(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //CENTRIFUGAL
    //inlet buterfly modulation with unloading
    setInletButterflyModulationWithUnloading(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //unloadPoint
        this.unloadPoint.setPoints(nameplateData, designDetails, centrifugalSpecifics, compressorControls, this.maxFullFlow, this.fullLoad, this.unloadPoint, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);

    }
    //inlet butterfly modulation with blowoff
    setInletButterflyModulationWithBlowoff(designDetails: DesignDetails, centrifugalSpecifics: CentrifugalSpecifics, settings: Settings) {
        //blowoff
        this.blowoff.setPoints(designDetails, centrifugalSpecifics, this.fullLoad, settings);
    }

    //inlet vane modulation with unloading
    setInletVaneModulationWithUnloading(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //unloadPoint
        this.unloadPoint.setPoints(nameplateData, designDetails, centrifugalSpecifics, compressorControls, this.maxFullFlow, this.fullLoad, this.unloadPoint, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    //load/unload centrifugal
    setLubricatedLoadUnloadCentrifugalPerformancePoints(designDetails: DesignDetails, nameplateData: CompressorNameplateData, centrifugalSpecifics: CentrifugalSpecifics, compressorControls: CompressorControls, atmosphericPressure: number, settings: Settings) {
        //maxFullFlow
        this.maxFullFlow.setPoints(designDetails, nameplateData, this.fullLoad, this.maxFullFlow, centrifugalSpecifics, atmosphericPressure, settings);
        //noLoad
        this.noLoad.setPoints(nameplateData, compressorControls, designDetails, this.fullLoad, settings);
    }

    setDefaultsOn() {
        this.fullLoad.setDefaultsOn();
        this.maxFullFlow.setDefaultsOn()
        this.midTurndown.setDefaultsOn();
        this.turndown.setDefaultsOn();
        this.unloadPoint.setDefaultsOn();
        this.noLoad.setDefaultsOn();
        this.blowoff.setDefaultsOn();
    }
}


