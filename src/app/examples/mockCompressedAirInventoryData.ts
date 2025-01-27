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