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
                    },
                    {
                        "id": "11343yw8i",
                        "departmentId": "l6rd7tt1i",
                        "description": "New Pump installed 2021",
                        "name": "Pump B",
                        "notes": "",
                    },
                ]
            },
        ],
    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "compressedAirInventory",
    "name": "Compressed Air Inventory Example",
    "appVersion": "0.10.0-beta",
    "selected": false,
    "isExample": true,
}