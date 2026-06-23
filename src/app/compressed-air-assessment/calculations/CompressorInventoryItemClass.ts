import { AdjustCascadingSetPoints, CascadingSetPointData, CentrifugalSpecifics, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, PerformancePoints, ReduceSystemAirPressure } from "../../shared/models/compressed-air-assessment";
import { Settings } from "../../shared/models/settings";
import type { CompressedAirCalculationService } from "../compressed-air-calculation.service";
import { CompressorPerformancePointsClass } from "./performancePoints/CompressorPerformancePointsClass";

//see inventoryOptions.ts for ControlTypes definitions

export class CompressorInventoryItemClass {

    itemId: string;
    name: string;
    nameplateData: CompressorNameplateData;
    compressorControls: CompressorControls;
    designDetails: DesignDetails;
    performancePoints: CompressorPerformancePointsClass;
    centrifugalSpecifics: CentrifugalSpecifics;
    description: string;
    modifiedDate: Date;
    isReplacementCompressor: boolean;

    showMaxFullFlow: boolean;
    showMidTurndown: boolean;
    showTurndown: boolean;
    showUnloadPoint: boolean;
    showNoLoadPoint: boolean;
    showBlowoffPoint: boolean;

    color: string;
    constructor(inventoryItem: CompressorInventoryItem) {
        this.itemId = inventoryItem.itemId;
        this.description = inventoryItem.description;
        this.modifiedDate = inventoryItem.modifiedDate;
        this.performancePoints = new CompressorPerformancePointsClass(inventoryItem.performancePoints);
        this.nameplateData = inventoryItem.nameplateData;
        this.name = inventoryItem.name;
        this.compressorControls = inventoryItem.compressorControls;
        this.designDetails = inventoryItem.designDetails;
        this.centrifugalSpecifics = inventoryItem.centrifugalSpecifics;
        this.isReplacementCompressor = inventoryItem.isReplacementCompressor;
        this.color = inventoryItem.color;
        this.setShowMaxFlowPerformancePoint();
        this.setShowMidTurndownPerformancePoint();
        this.setShowTurndownPerformancePoint();
        this.setShowUnloadPerformancePoint();
        this.setShowNoLoadPerformancePoint();
        this.setShowBlowoffPerformancePoint();
    }

    adjustCompressorPerformancePointsWithSequencer(targetPressure: number, variance: number, atmosphericPressure: number, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService) {
        this.performancePoints = new CompressorPerformancePointsClass(_compressedAirCalculationService.adjustPerformancePointsForSequencer(this, targetPressure, variance, atmosphericPressure, settings));
    }

    reduceSystemPressure(reduceSystemAirPressure: ReduceSystemAirPressure, atmosphericPressure: number, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService) {
        this.performancePoints = new CompressorPerformancePointsClass(_compressedAirCalculationService.reduceSystemPressurePerformancePoints(this, reduceSystemAirPressure.averageSystemPressureReduction, atmosphericPressure, settings));
    }

    adjustCascadingSetPoints(adjustCascadingSetPoints: AdjustCascadingSetPoints, atmosphericPressure: number, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService) {
        let setPointData: CascadingSetPointData = adjustCascadingSetPoints.setPointData.find(data => { return data.compressorId == this.itemId });
        this.performancePoints = new CompressorPerformancePointsClass(_compressedAirCalculationService.adjustCascadingSetPointPerformancePoints(this, setPointData.fullLoadDischargePressure, setPointData.maxFullFlowDischargePressure, atmosphericPressure, settings));
    }

    //used to convert CompressorInventoryItemClass back to CompressorInventoryItem for storage
    //in indexedDb.
    toModel(): CompressorInventoryItem {
        return {
            itemId: this.itemId,
            name: this.name,
            description: this.description,
            nameplateData: this.nameplateData,
            compressorControls: this.compressorControls,
            designDetails: this.designDetails,
            performancePoints: this.performancePoints,
            centrifugalSpecifics: this.centrifugalSpecifics,
            modifiedDate: this.modifiedDate,
            isReplacementCompressor: this.isReplacementCompressor,
            color: this.color

        }
    }

    getRatedSpecificPower(settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService): number {
        return _compressedAirCalculationService.getRatedSpecificPower(this, settings);
    }

    getRatedIsentropicEfficiency(settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService): number {
        return _compressedAirCalculationService.getRatedIsentropicEfficiency(this, settings);
    }

    findItem(itemId: string): boolean {
        return this.itemId == itemId;
    }

    setShowMaxFlowPerformancePoint() {
        if (this.nameplateData.compressorType == 6 && (this.compressorControls.controlType == 7 || this.compressorControls.controlType == 9)) {
            this.showMaxFullFlow = false;
        } else if ((this.nameplateData.compressorType == 1 || this.nameplateData.compressorType == 2) && this.compressorControls.controlType == 1) {
            this.showMaxFullFlow = false;
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

    updatePerformancePoints(atmosphericPressure: number, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService) {
        this.performancePoints = new CompressorPerformancePointsClass(_compressedAirCalculationService.updatePerformancePoints(this, atmosphericPressure, settings));
    }
}
