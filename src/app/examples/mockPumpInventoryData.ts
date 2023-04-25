import { InventoryItem } from "../shared/models/inventory/inventory";



export const MockPumpInventory: InventoryItem = {
    "pumpInventoryData": {
        "co2SavingsData": {
            "energyType": 'electricity',
            "energySource": '',
            "fuelType": '',
            "totalEmissionOutputRate": 401.07,
            "electricityUse": 0,
            "eGridRegion": '',
            "eGridSubregion": 'U.S. Average',
            "totalEmissionOutput": 0,
            "userEnteredBaselineEmissions": false,
            "userEnteredModificationEmissions": true,
            "zipcode": '00000',
        },
        "departments": [
            {
                "name": "Pump Warehouse",
                "operatingHours": 8760,
                "description": "Filled with pumps",
                "id": "a2jd7ua9i",
                "catalog": [
                    {
                        "id": "59264rw8x",
                        "departmentId": "a2jd7ua9i",
                        "description": "This is our finest pump",
                        "name": "Good pump",

                        "nameplateData": {
                            "manufacturer": "Pumps inc.",
                            "model": "A",
                            "serialNumber": "p33333",
                        },
                        "fieldMeasurements": {
                            "pumpSpeed": 333,
                            "yearlyOperatingHours": 3000,
                            "staticSuctionHead": 333,
                            "staticDischargeHead": 333,
                            "efficiency": 33,
                            "assessmentDate": '3333',
                            "operatingFlowRate": 333,
                            "operatingHead": 333,
                            "measuredPower": 33,
                            "measuredCurrent": 33,
                            "measuredVoltage": 33,
                            "system": '',
                            "location": '',
                        },
                        "fluid": {
                            "fluidType": 'Water',
                            "fluidDensity": 33
                        },
                        "pumpEquipment": {
                            "pumpType": 0,
                            "shaftOrientation": 0,
                            "shaftSealType": 0,
                            "numStages": 33,
                            "inletDiameter": 33,
                            "outletDiameter": 33,
                            "maxWorkingPressure": 33,
                            "maxAmbientTemperature": 33,
                            "maxSuctionLift": 33,
                            "displacement": 33,
                            "startingTorque": 1,
                            "ratedSpeed": 33,
                            "impellerDiameter": 33,
                            "minFlowSize": 33,
                            "pumpSize": 33,
                            "designHead": 33,
                            "designFlow": 33,
                            "designEfficiency": 33,
                        },
                        "pumpMotor": {
                            "motorRPM": 33,
                            "lineFrequency": 50,
                            "motorRatedPower": 33,
                            "motorEfficiencyClass": 0,
                            "motorRatedVoltage": 33,
                            "motorFullLoadAmps": 33,
                            "motorEfficiency": 33,
                        },
                        "pumpStatus": {
                            "status": 0,
                            "priority": 0,
                            "yearInstalled": 33,
                        },
                        "systemProperties": {
                            "driveType": 0,
                            "flangeConnectionClass": 'Class A',
                            "flangeConnectionSize": 0,
                            "componentId": 'pump-123',
                            "system": 'System A',
                            "location": 'Warehouse'
                        }
                    },
                ]
            }
        ],
        displayOptions: {
            nameplateDataOptions: {
                displayNameplateData: true,
                manufacturer: true,
                model: true,
                serialNumber: false,
            },
            pumpStatusOptions: {
                displayPumpStatus: false,
                status: false,
                priority: false,
                yearInstalled: false,
            },
            pumpPropertiesOptions: {
                displayPumpProperties: true,
                pumpType: true, 
                shaftOrientation: false, 
                shaftSealType: false, 
                numStages: true, 
                inletDiameter: true, 
                outletDiameter: true,
                maxWorkingPressure: false,
                maxAmbientTemperature: false, 
                maxSuctionLift: false, 
                displacement: false, 
                startingTorque: false,
                ratedSpeed: false, 
                impellerDiameter: false, 
                minFlowSize: false, 
                pumpSize: false, 
                designHead: false,
                designFlow: false,
                designEfficiency: false,
              },
              fluidPropertiesOptions: {
                displayFluidProperties: true,
                fluidType: true,
                fluidDensity: true
              },
              systemPropertiesOptions: {
                displaySystemProperties: true,
                driveType: true,
                flangeConnectionClass: false,
                flangeConnectionSize: false,
                componentId: false,
                system: false,
                location: false 
              },
              fieldMeasurementOptions: {
                displayFieldMeasurements: true,
                pumpSpeed: true,
                yearlyOperatingHours: true,
                staticSuctionHead: false,
                staticDischargeHead: false,
                efficiency: false,
                assessmentDate: false,
                operatingFlowRate: true,
                operatingHead: true,
                measuredPower: true,
                measuredCurrent: true,
                measuredVoltage: true,
                system: true,
                location: true,
              },
              pumpMotorPropertiesOptions: {
                displayPumpMotorProperties: true,
                motorRPM: true,
                lineFrequency: true,
                motorRatedPower: true,
                motorEfficiencyClass: true,
                motorRatedVoltage: true,
                motorFullLoadAmps: true,
                motorEfficiency: true,
              }
        }
    },
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "pumpInventory",
    "name": "Example Pump Inventory",
    "appVersion": "0.10.0-beta",
    "isExample": true,
}