import { CentrifugalSpecifics, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, PerformancePoints, SystemInformation } from "../../shared/models/compressed-air-assessment";
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
    isValid: boolean;
    description: string;
    modifiedDate: Date;
    // replacementCompressorId: string;
    // isReplacementCompressor: boolean;
    constructor(inventoryItem: CompressorInventoryItem) {
        this.itemId = inventoryItem.itemId;
        this.description = inventoryItem.description;
        this.isValid = inventoryItem.isValid;
        this.modifiedDate = inventoryItem.modifiedDate;
        this.compressorLibId = inventoryItem.compressorLibId;
        this.performancePoints = new CompressorPerformancePointsClass(inventoryItem.performancePoints);
        this.nameplateData = inventoryItem.nameplateData;
        this.name = inventoryItem.name;
        this.compressorControls = inventoryItem.compressorControls;
        this.designDetails = inventoryItem.designDetails;
        this.centrifugalSpecifics = inventoryItem.centrifugalSpecifics;
        // this.replacementCompressorId = inventoryItem.replacementCompressorId;
        // this.isReplacementCompressor = inventoryItem.isReplacementCompressor;
    }

    adjustCompressorPerformancePointsWithSequencer(systemInformation: SystemInformation, settings: Settings) {
        this.performancePoints.adjustCompressorPerformancePointsWithSequencer(systemInformation, this.nameplateData, this.centrifugalSpecifics, this.designDetails, this.compressorControls, settings);
    }

    toModel(): CompressorInventoryItem {
        return {
            itemId: this.itemId,
            compressorLibId: this.compressorLibId,
            name: this.name,
            description: this.description,
            isValid: this.isValid,
            nameplateData: this.nameplateData,
            compressorControls: this.compressorControls,
            designDetails: this.designDetails,
            performancePoints: this.performancePoints,
            centrifugalSpecifics: this.centrifugalSpecifics,
            modifiedDate: this.modifiedDate,
            // replacementCompressorId: this.replacementCompressorId,
            // isReplacementCompressor: this.isReplacementCompressor

        }
    }
}