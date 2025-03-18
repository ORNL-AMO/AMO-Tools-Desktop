import { InventoryItem } from "../shared/models/inventory/inventory";



export const MockCompressedAirInventory: InventoryItem = {
    "compressedAirInventoryData": {
        "systemInformation": {
            "systemElevation": null,
            "atmosphericPressure": 14.7,
            "atmosphericPressureKnown": true,
        },
        "systems": [
            {
                "name": "QC Dept",
                "operatingHours": 8760,
                "totalAirStorage": 3000,
                "description": "Main building",
                "id": "l6rd7tt1i",
                "catalog": [
                    {
                        "id": "66334rw8x",
                        "systemId": "l6rd7tt1i",
                        "description": "Main Compressor",
                        "name": "Compressor A",
                        "notes": "",
                        "centrifugalSpecifics": {
                            "surgeAirflow": null,
                            "maxFullLoadPressure": null,
                            "maxFullLoadCapacity": null,
                            "minFullLoadPressure": null,
                            "minFullLoadCapacity": null
                        },
                        "nameplateData": {
                            "compressorType": 2,
                            "fullLoadOperatingPressure": 100,
                            "fullLoadRatedCapacity": 1857,
                            "totalPackageInputPower": 290.1
                        },
                        "fieldMeasurements": {
                            "yearlyOperatingHours": 8760,
                        },
                        "compressedAirMotor": {
                            "motorPower": 350,
                            "motorFullLoadAmps": 385
                        },
                        "compressedAirControlsProperties": {
                            "controlType": 4,
                            "unloadPointCapacity": 100,
                            "numberOfUnloadSteps": 2,
                            "automaticShutdown": true,
                            "unloadSumpPressure": 15,
                        },
                        "compressedAirDesignDetailsProperties": {
                            "blowdownTime": 40,
                            "modulatingPressureRange": 50,
                            "inputPressure": 14.5,
                            "designEfficiency": 94.5,
                            "serviceFactor": 1.15,
                            "noLoadPowerFM": 20,
                            "noLoadPowerUL": 20,
                            "maxFullFlowPressure": 110
                        },
                        "compressedAirPerformancePointsProperties": {
                            "fullLoad": {
                                "dischargePressure": 100,
                                "isDefaultPower": true,
                                "airflow": 1857,
                                "isDefaultAirFlow": true,
                                "power": 290.1,
                                "isDefaultPressure": true
                            },
                            "maxFullFlow": {
                                "dischargePressure": 110,
                                "isDefaultPower": true,
                                "airflow": 1843,
                                "isDefaultAirFlow": true,
                                "power": 305.9,
                                "isDefaultPressure": true
                            },
                            "unloadPoint": {
                                "isDefaultPower": true,
                                "isDefaultAirFlow": true,
                                "isDefaultPressure": true,
                                "power": undefined,
                                "airflow": undefined,
                                "dischargePressure": undefined,
                            },
                            "noLoad": {
                                "dischargePressure": 15,
                                "isDefaultPower": true,
                                "airflow": 0,
                                "isDefaultAirFlow": true,
                                "power": 59.5,
                                "isDefaultPressure": true
                            },
                            "blowoff": {
                                "isDefaultPower": true,
                                "isDefaultAirFlow": true,
                                "isDefaultPressure": true,
                                "power": undefined,
                                "airflow": undefined,
                                "dischargePressure": undefined,
                            },
                            "midTurndown": {
                                "isDefaultPower": true,
                                "isDefaultAirFlow": true,
                                "isDefaultPressure": true,
                                "power": undefined,
                                "airflow": undefined,
                                "dischargePressure": undefined,
                            },
                            "turndown": {
                                "isDefaultPower": true,
                                "isDefaultAirFlow": true,
                                "isDefaultPressure": true,
                                "power": undefined,
                                "airflow": undefined,
                                "dischargePressure": undefined,
                            }
                        },
                    },
                ]
            },
        ],
        displayOptions: {
            nameplateDataOptions: {
                displayNameplateData: true,
                compressorType: true,
                fullLoadOperatingPressure: true,
                fullLoadRatedCapacity: true,
                totalPackageInputPower: true
            },
            fieldMeasurementsOptions: {
                displayFieldMeasurements: true,
                yearlyOperatingHours: true,
            },
            compressedAirMotorPropertiesOptions: {
                displayCompressedAirMotorProperties: true,
                motorPower: true,
                motorFullLoadAmps: true
            },
            compressedAirControlsPropertiesOptions: {
                displayCompressedAirControlsProperties: true,
                controlType: true,
                unloadPointCapacity: true,
                numberOfUnloadSteps: true,
                automaticShutdown: true,
                unloadSumpPressure: true,
            },
            compressedAirDesignDetailsPropertiesOptions: {
                displayCompressedAirDesignDetailsProperties: true,
                blowdownTime: true,
                modulatingPressureRange: true,
                inputPressure: true,
                designEfficiency: true,
                serviceFactor: true,
                noLoadPowerFM: true,
                noLoadPowerUL: true,
                maxFullFlowPressure: true
            },
            compressedAirPerformancePointsPropertiesOptions: {
                displayCompressedAirPerformancePointsProperties: true
            }
        },
        endUses: [
            {
                "endUseId": "x22ow6wc6",
                "modifiedDate": new Date("2022-08-03T21:07:29.942Z"),
                "endUseName": "Pneumatic Tools 1",
                "requiredPressure": 95,
                "location": "Production Line 1",
                "endUseDescription": "Total of all hand tools found on production line 1",                
            },
        ]
    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "compressedAirInventory",
    "name": "Compressed Air Inventory Example",
    "appVersion": "0.10.0-beta",
    "selected": false,
    "isExample": true,
}