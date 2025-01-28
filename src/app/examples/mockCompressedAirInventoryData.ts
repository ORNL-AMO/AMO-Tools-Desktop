import { InventoryItem } from "../shared/models/inventory/inventory";



export const MockCompressedAirInventory: InventoryItem = {
    "compressedAirInventoryData": {
        "departments": [
            {
                "name": "QC Dept",
                "operatingHours": 8760,
                "description": "Main building",
                "id": "l6rd7tt1i",
                "catalog": [
                    {
                        "id": "66334rw8x",
                        "departmentId": "l6rd7tt1i",
                        "description": "Main pump",
                        "name": "Pump A",
                        "notes": "",
                        "nameplateData": {
                            "compressorType": 2,
                            "fullLoadOperatingPressure": 100,
                            "fullLoadRatedCapacity": 1857,
                            "totalPackageInputPower": 290.1
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
                        }
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
        }
    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "compressedAirInventory",
    "name": "Compressed Air Inventory Example",
    "appVersion": "0.10.0-beta",
    "selected": false,
    "isExample": true,
}