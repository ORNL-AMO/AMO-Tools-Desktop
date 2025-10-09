import { ConvertValue } from "../../shared/convert-units/ConvertValue";
import { roundVal } from "../../shared/helperFunctions";
import { AdjustCascadingSetPoints, CascadingSetPointData, CentrifugalSpecifics, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, PerformancePoints, ReduceSystemAirPressure, SystemInformation } from "../../shared/models/compressed-air-assessment";
import { Settings } from "../../shared/models/settings";
import { CompressorPerformancePointsClass } from "./performancePoints/CompressorPerformancePointsClass";


export class CompressorInventoryItemClass {

    itemId: string;
    compressorLibId: number;
    name: string;
    nameplateData: CompressorNameplateData;
    compressorControls: CompressorControls;
    designDetails: DesignDetails;
    performancePoints: CompressorPerformancePointsClass;
    centrifugalSpecifics: CentrifugalSpecifics;
    description: string;
    modifiedDate: Date;
    originalCompressorId: string;
    isReplacementCompressor: boolean;

    showMaxFullFlow: boolean;
    showMidTurndown: boolean;
    showTurndown: boolean;
    showUnloadPoint: boolean;
    showNoLoadPoint: boolean;
    showBlowoffPoint: boolean;
    constructor(inventoryItem: CompressorInventoryItem) {
        this.itemId = inventoryItem.itemId;
        this.description = inventoryItem.description;
        this.modifiedDate = inventoryItem.modifiedDate;
        this.compressorLibId = inventoryItem.compressorLibId;
        this.performancePoints = new CompressorPerformancePointsClass(inventoryItem.performancePoints);
        this.nameplateData = inventoryItem.nameplateData;
        this.name = inventoryItem.name;
        this.compressorControls = inventoryItem.compressorControls;
        this.designDetails = inventoryItem.designDetails;
        this.centrifugalSpecifics = inventoryItem.centrifugalSpecifics;
        this.originalCompressorId = inventoryItem.originalCompressorId;
        this.isReplacementCompressor = inventoryItem.isReplacementCompressor;
        this.setShowMaxFlowPerformancePoint();
        this.setShowMidTurndownPerformancePoint();
        this.setShowTurndownPerformancePoint();
        this.setShowUnloadPerformancePoint();
        this.setShowNoLoadPerformancePoint();
        this.setShowBlowoffPerformancePoint();
    }

    adjustCompressorPerformancePointsWithSequencer(targetPressure: number, variance: number, systemInformation: SystemInformation, settings: Settings) {
        this.performancePoints.fullLoad.isDefaultPressure = false;
        this.performancePoints.fullLoad.isDefaultAirFlow = true;
        this.performancePoints.fullLoad.isDefaultPower = true;
        this.performancePoints.maxFullFlow.isDefaultAirFlow = true;
        this.performancePoints.maxFullFlow.isDefaultPressure = true;
        this.performancePoints.maxFullFlow.isDefaultPower = true;
        this.performancePoints.noLoad.isDefaultAirFlow = true;
        this.performancePoints.noLoad.isDefaultPressure = true;
        this.performancePoints.noLoad.isDefaultPower = true;
        this.performancePoints.unloadPoint.isDefaultAirFlow = true;
        this.performancePoints.unloadPoint.isDefaultPressure = true;
        this.performancePoints.unloadPoint.isDefaultPower = true;
        this.performancePoints.blowoff.isDefaultAirFlow = true;
        this.performancePoints.blowoff.isDefaultPressure = true;
        this.performancePoints.blowoff.isDefaultPower = true;

        this.performancePoints.fullLoad.dischargePressure = targetPressure - variance;

        if (this.compressorControls.controlType == 2 || this.compressorControls.controlType == 3 || this.compressorControls.controlType == 8 || this.compressorControls.controlType == 10 || this.compressorControls.controlType == 5) {
            this.performancePoints.unloadPoint.dischargePressure = targetPressure + variance;
            this.performancePoints.unloadPoint.isDefaultPressure = false;
            if (this.performancePoints.maxFullFlow.dischargePressure > this.performancePoints.fullLoad.dischargePressure) {
                this.performancePoints.maxFullFlow.dischargePressure = this.performancePoints.fullLoad.dischargePressure;
                this.performancePoints.maxFullFlow.isDefaultPressure = false;
            }
        } else if (this.compressorControls.controlType == 1) {
            this.performancePoints.noLoad.dischargePressure = targetPressure + variance;
            this.performancePoints.noLoad.isDefaultPressure = false;
        } else if (this.compressorControls.controlType == 6 || this.compressorControls.controlType == 4) {
            this.performancePoints.maxFullFlow.dischargePressure = targetPressure + variance;
            this.performancePoints.maxFullFlow.isDefaultPressure = false;
        } else if (this.compressorControls.controlType == 7 || this.compressorControls.controlType == 9) {
            this.performancePoints.blowoff.dischargePressure = targetPressure + variance;
            this.performancePoints.blowoff.isDefaultPressure = false;
        }
        this.performancePoints.updatePerformancePoints(this.nameplateData, this.centrifugalSpecifics, this.designDetails, this.compressorControls, systemInformation.atmosphericPressure, settings);
    }

    reduceSystemPressure(reduceSystemAirPressure: ReduceSystemAirPressure, atmosphericPressure: number, settings: Settings) {
        this.performancePoints.fullLoad.dischargePressure = this.performancePoints.fullLoad.dischargePressure - reduceSystemAirPressure.averageSystemPressureReduction;
        this.performancePoints.fullLoad.isDefaultPressure = false;
        this.performancePoints.fullLoad.isDefaultAirFlow = false;
        this.performancePoints.fullLoad.isDefaultPower = true;
        this.performancePoints.maxFullFlow.isDefaultAirFlow = true;
        this.performancePoints.maxFullFlow.isDefaultPressure = true;
        this.performancePoints.maxFullFlow.isDefaultPower = true;
        if (this.compressorControls.controlType != 1 && this.compressorControls.controlType != 7 && this.compressorControls.controlType != 9) {
            this.performancePoints.maxFullFlow.isDefaultPressure = false;
            this.performancePoints.maxFullFlow.dischargePressure = this.performancePoints.maxFullFlow.dischargePressure - reduceSystemAirPressure.averageSystemPressureReduction;
        }
        this.performancePoints.noLoad.isDefaultAirFlow = true;
        this.performancePoints.noLoad.isDefaultPressure = true;
        this.performancePoints.noLoad.isDefaultPower = true;
        this.performancePoints.unloadPoint.isDefaultAirFlow = true;
        this.performancePoints.unloadPoint.isDefaultPressure = true;
        this.performancePoints.unloadPoint.isDefaultPower = true;
        this.performancePoints.blowoff.isDefaultAirFlow = true;
        this.performancePoints.blowoff.isDefaultPressure = true;
        this.performancePoints.blowoff.isDefaultPower = true;
        this.performancePoints.updatePerformancePoints(this.nameplateData, this.centrifugalSpecifics, this.designDetails, this.compressorControls, atmosphericPressure, settings);
    }

    adjustCascadingSetPoints(adjustCascadingSetPoints: AdjustCascadingSetPoints, atmosphericPressure: number, settings: Settings) {
        let setPointData: CascadingSetPointData = adjustCascadingSetPoints.setPointData.find(data => { return data.compressorId == this.itemId });
        this.performancePoints.fullLoad.dischargePressure = setPointData.fullLoadDischargePressure;
        this.performancePoints.fullLoad.isDefaultPressure = false;
        this.performancePoints.fullLoad.isDefaultAirFlow = false;
        this.performancePoints.fullLoad.isDefaultPower = true;
        this.performancePoints.maxFullFlow.isDefaultAirFlow = true;
        this.performancePoints.maxFullFlow.isDefaultPressure = true;
        this.performancePoints.maxFullFlow.isDefaultPower = true;
        this.performancePoints.maxFullFlow.isDefaultPressure = false;
        this.performancePoints.maxFullFlow.dischargePressure = setPointData.maxFullFlowDischargePressure;
        this.performancePoints.noLoad.isDefaultAirFlow = true;
        this.performancePoints.noLoad.isDefaultPressure = true;
        this.performancePoints.noLoad.isDefaultPower = true;
        this.performancePoints.unloadPoint.isDefaultAirFlow = true;
        this.performancePoints.unloadPoint.isDefaultPressure = true;
        this.performancePoints.unloadPoint.isDefaultPower = true;
        this.performancePoints.blowoff.isDefaultAirFlow = true;
        this.performancePoints.blowoff.isDefaultPressure = true;
        this.performancePoints.blowoff.isDefaultPower = true;
        this.performancePoints.updatePerformancePoints(this.nameplateData, this.centrifugalSpecifics, this.designDetails, this.compressorControls, atmosphericPressure, settings)
    }

    toModel(): CompressorInventoryItem {
        return {
            itemId: this.itemId,
            compressorLibId: this.compressorLibId,
            name: this.name,
            description: this.description,
            nameplateData: this.nameplateData,
            compressorControls: this.compressorControls,
            designDetails: this.designDetails,
            performancePoints: this.performancePoints,
            centrifugalSpecifics: this.centrifugalSpecifics,
            modifiedDate: this.modifiedDate,
            originalCompressorId: this.originalCompressorId,
            isReplacementCompressor: this.isReplacementCompressor

        }
    }

    getRatedSpecificPower(): number {
        let ratedSpecificPower: number = (this.nameplateData.totalPackageInputPower / this.nameplateData.fullLoadRatedCapacity) * 100;
        return ratedSpecificPower;
    }

    getRatedIsentropicEfficiency(settings: Settings): number {
        let ratedSpecificPower: number = this.getRatedSpecificPower();
        let dischargePressure: number = this.nameplateData.fullLoadOperatingPressure;
        if (settings.unitsOfMeasure == 'Metric') {
            dischargePressure = new ConvertValue(dischargePressure, 'barg', 'psig').convertedValue;
            let conversionHelper: number = new ConvertValue(1, 'm3/min', 'ft3/min').convertedValue;
            ratedSpecificPower = roundVal((ratedSpecificPower / conversionHelper), 4);
        }
        let subNum: number = Math.pow(((dischargePressure + 14.5) / 14.5), 0.2857);
        let ratedIsentropicEfficiency: number = ((16.52 * (subNum - 1)) / ratedSpecificPower) * 100;
        ratedIsentropicEfficiency = roundVal(ratedIsentropicEfficiency, 4);
        return ratedIsentropicEfficiency;
    }

    findItem(itemId: string): boolean {
        if (this.isReplacementCompressor) {
            return this.originalCompressorId == itemId;
        } else {
            return this.itemId == itemId;
        }
    }

    setShowMaxFlowPerformancePoint() {
        if (this.nameplateData.compressorType == 6 && (this.compressorControls.controlType == 7 || this.compressorControls.controlType == 9)) {
            this.showMaxFullFlow = false;
        } else if (this.nameplateData.compressorType == 1 || this.nameplateData.compressorType == 2) {
            if (this.compressorControls.controlType == 1) {
                this.showMaxFullFlow = false;
            } else {
                this.showMaxFullFlow = true;
            }
        } else if (this.compressorControls.controlType === 11) {
            this.showMaxFullFlow = false;
        } else {
            this.showMaxFullFlow = true;
        }
    }

    setShowMidTurndownPerformancePoint() {
        if (this.compressorControls.controlType !== 11) {
            this.showMidTurndown = false;
        } else {
            this.showMidTurndown = true;
        }
    }

    setShowTurndownPerformancePoint() {
        if (this.compressorControls.controlType !== 11) {
            this.showTurndown = false;
        } else {
            this.showTurndown = true;
        }
    }

    setShowUnloadPerformancePoint() {
        if (this.nameplateData.compressorType == 1 || this.nameplateData.compressorType == 2) {
            if (this.compressorControls.controlType == 2 || this.compressorControls.controlType == 3) {
                this.showUnloadPoint = true;
            }
        } else if (this.nameplateData.compressorType == 6 && (this.compressorControls.controlType == 8 || this.compressorControls.controlType == 10)) {
            this.showUnloadPoint = true;
        } else {
            this.showUnloadPoint = false;
        }
    }

    setShowNoLoadPerformancePoint() {
        if (this.nameplateData.compressorType == 6) {
            if (this.compressorControls.controlType == 7 || this.compressorControls.controlType == 9) {
                this.showNoLoadPoint = false;
            }
        }
        this.showNoLoadPoint = true;
    }

    setShowBlowoffPerformancePoint() {
        //centrifugal
        if (this.nameplateData.compressorType == 6) {
            //"with blowoff"
            if (this.compressorControls.controlType == 7 || this.compressorControls.controlType == 9) {
                this.showBlowoffPoint = true;
            }
        } else {
            this.showBlowoffPoint = false;
        }
    }

    updatePerformancePoints(atmosphericPressure: number, settings: Settings) {
        this.performancePoints.updatePerformancePoints(this.nameplateData, this.centrifugalSpecifics, this.designDetails, this.compressorControls, atmosphericPressure, settings);
    }
}