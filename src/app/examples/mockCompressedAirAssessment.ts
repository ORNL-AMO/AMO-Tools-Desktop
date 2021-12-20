import { Assessment } from "../shared/models/assessment";
import { Settings } from "../shared/models/settings";


export const MockCompressedAirAssessment: Assessment = {
    "name": "Compressed Air Example",
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "type": "CompressedAir",
    "directoryId": 2,
    "isExample": true,
    "compressedAirAssessment": {
        "name": "Baseline",
        "modifications": [{
            "name": "Overall System Assessment ", "modificationId": "jthhad743", "reduceAirLeaks": {
                "leakFlow": 250, "leakReduction": 75, "implementationCost": 500, "order": 1
            }, "improveEndUseEfficiency": {
                "endUseEfficiencyItems": [{
                    "reductionType": "Fixed", "reductionData": [{
                        "dayTypeId": "hptkgnqnm", "dayTypeName": "Weekday", "data": [{
                            "hourInterval": 0, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 1, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 2, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 3, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 4, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 5, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 6, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 7, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 8, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 9, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 10, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 11, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 12, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 13, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 14, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 15, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 16, "applyReduction": true, "reductionAmount": 0
                        }, {
                            "hourInterval": 17, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 18, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 19, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 20, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 21, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 22, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 23, "applyReduction": false, "reductionAmount": 0
                        }]
                    }, {
                        "dayTypeId": "fehuh48hb", "dayTypeName": "Weekend", "data": [{
                            "hourInterval": 0, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 1, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 2, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 3, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 4, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 5, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 6, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 7, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 8, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 9, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 10, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 11, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 12, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 13, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 14, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 15, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 16, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 17, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 18, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 19, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 20, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 21, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 22, "applyReduction": false, "reductionAmount": 0
                        }, {
                            "hourInterval": 23, "applyReduction": false, "reductionAmount": 0
                        }]
                    }], "name": "Remove Open Blowing ", "substituteAuxiliaryEquipment": true, "equipmentDemand": 15, "collapsed": false, "implementationCost": 1500, "airflowReduction": 100
                }], "order": 4
            }, "reduceSystemAirPressure": {
                "averageSystemPressureReduction": 5, "implementationCost": 100, "order": 3
            }, "adjustCascadingSetPoints": {
                "order": 100, "setPointData": [{
                    "compressorId": "mtz2caylr", "controlType": 2, "compressorType": 1, "fullLoadDischargePressure": 115.01, "maxFullFlowDischargePressure": 115.01
                }, {
                    "compressorId": "4wjupov45", "controlType": 4, "compressorType": 1, "fullLoadDischargePressure": 125.02, "maxFullFlowDischargePressure": 135.03
                }, {
                    "compressorId": "fyg7r7zje", "controlType": 4, "compressorType": 5, "fullLoadDischargePressure": 109.94, "maxFullFlowDischargePressure": 119.95
                }, {
                    "compressorId": "y7hvpmbhg", "controlType": 4, "compressorType": 2, "fullLoadDischargePressure": 115.01, "maxFullFlowDischargePressure": 125.02
                }], "implementationCost": 0
            }, "useAutomaticSequencer": {
                "order": 100, "implementationCost": 0, "profileSummary": [{
                    "compressorId": "mtz2caylr", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                        "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 0, "percentPower": 82.5, "percentSystemCapacity": 8.01982317781545, "percentSystemPower": 14.509235606209472, "order": 2
                    }, {
                        "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 1, "percentPower": 91.25, "percentSystemCapacity": 12.029734766723173, "percentSystemPower": 16.048093928080174, "order": 2
                    }, {
                        "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 2, "percentPower": 91.25, "percentSystemCapacity": 12.029734766723173, "percentSystemPower": 16.048093928080174, "order": 2
                    }, {
                        "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 3, "percentPower": 86, "percentSystemCapacity": 9.623787813378538, "percentSystemPower": 15.124778934957753, "order": 2
                    }, {
                        "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 4, "percentPower": 86, "percentSystemCapacity": 9.623787813378538, "percentSystemPower": 15.124778934957753, "order": 2
                    }, {
                        "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 5, "percentPower": 91.25, "percentSystemCapacity": 12.029734766723173, "percentSystemPower": 16.048093928080174, "order": 2
                    }, {
                        "power": 86.3675, "airflow": 411.3, "percentCapacity": 90, "timeInterval": 6, "percentPower": 96.50000000000001, "percentSystemCapacity": 14.435681720067809, "percentSystemPower": 16.971408921202595, "order": 2
                    }, {
                        "power": 89.5, "airflow": 457, "percentCapacity": 100, "timeInterval": 7, "percentPower": 100, "percentSystemCapacity": 16.0396463556309, "percentSystemPower": 17.586952249950873, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 8, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 88.8735, "airflow": 447.86, "percentCapacity": 98, "timeInterval": 9, "percentPower": 99.30000000000001, "percentSystemCapacity": 15.718853428518281, "percentSystemPower": 17.46384358420122, "order": 2
                    }, {
                        "power": 88.247, "airflow": 438.72, "percentCapacity": 96, "timeInterval": 10, "percentPower": 98.6, "percentSystemCapacity": 15.398060501405661, "percentSystemPower": 17.340734918451563, "order": 2
                    }, {
                        "power": 88.8735, "airflow": 447.86, "percentCapacity": 98, "timeInterval": 11, "percentPower": 99.30000000000001, "percentSystemCapacity": 15.718853428518281, "percentSystemPower": 17.46384358420122, "order": 2
                    }, {
                        "power": 86.3675, "airflow": 411.3, "percentCapacity": 90, "timeInterval": 12, "percentPower": 96.50000000000001, "percentSystemCapacity": 14.435681720067809, "percentSystemPower": 16.971408921202595, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 13, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 14, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 15, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 16, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 17, "percentPower": 98.25, "percentSystemCapacity": 15.237664037849353, "percentSystemPower": 17.279180585576736, "order": 2
                    }, {
                        "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 18, "percentPower": 91.25, "percentSystemCapacity": 12.029734766723173, "percentSystemPower": 16.048093928080174, "order": 2
                    }, {
                        "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 19, "percentPower": 86, "percentSystemCapacity": 9.623787813378538, "percentSystemPower": 15.124778934957753, "order": 2
                    }, {
                        "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 20, "percentPower": 86, "percentSystemCapacity": 9.623787813378538, "percentSystemPower": 15.124778934957753, "order": 2
                    }, {
                        "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 21, "percentPower": 87.75, "percentSystemCapacity": 10.425770131160084, "percentSystemPower": 15.432550599331893, "order": 2
                    }, {
                        "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 22, "percentPower": 82.5, "percentSystemCapacity": 8.01982317781545, "percentSystemPower": 14.509235606209472, "order": 2
                    }, {
                        "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 23, "percentPower": 82.5, "percentSystemCapacity": 8.01982317781545, "percentSystemPower": 14.509235606209472, "order": 2
                    }], "fullLoadPressure": 115, "automaticShutdownTimer": false
                }, {
                    "compressorId": "mtz2caylr", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 115, "fullLoadCapacity": 457, "automaticShutdownTimer": false
                }, {
                    "compressorId": "4wjupov45", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 0, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 1, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 81.00803509719226, "airflow": 349.44, "percentCapacity": 84, "timeInterval": 2, "percentPower": 94.85718395455768, "percentSystemCapacity": 12.264538342476282, "percentSystemPower": 15.918261956610783, "order": 1
                    }, {
                        "power": 85.1636563242499, "airflow": 395.2, "percentCapacity": 95, "timeInterval": 3, "percentPower": 99.72325096516381, "percentSystemCapacity": 13.87060883970532, "percentSystemPower": 16.73485091850067, "order": 1
                    }, {
                        "power": 85.1636563242499, "airflow": 395.2, "percentCapacity": 95, "timeInterval": 4, "percentPower": 99.72325096516381, "percentSystemCapacity": 13.87060883970532, "percentSystemPower": 16.73485091850067, "order": 1
                    }, {
                        "power": 63.471943930902384, "airflow": 208, "percentCapacity": 50, "timeInterval": 5, "percentPower": 74.32311935702855, "percentSystemCapacity": 7.300320441950168, "percentSystemPower": 12.472380414797088, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 6, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 7, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 8, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 9, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 10, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 11, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 12, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 13, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 14, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 15, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 16, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 17, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 18, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 19, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 20, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 21, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 22, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }, {
                        "power": 79.34978306232034, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 23, "percentPower": 92.91543684112452, "percentSystemCapacity": 11.680512707120268, "percentSystemPower": 15.59241168448032, "order": 1
                    }], "fullLoadPressure": 125, "automaticShutdownTimer": false
                }, {
                    "compressorId": "4wjupov45", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 125, "fullLoadCapacity": 416, "automaticShutdownTimer": false
                }, {
                    "compressorId": "fyg7r7zje", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 113.81194386257513, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 5, "percentPower": 67.94742917168665, "percentSystemCapacity": 21.669316542596313, "percentSystemPower": 22.364304158493837, "order": 3
                    }, {
                        "power": 113.81194386257513, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 6, "percentPower": 67.94742917168665, "percentSystemCapacity": 21.669316542596313, "percentSystemPower": 22.364304158493837, "order": 3
                    }, {
                        "power": 99.22711104883977, "airflow": 514.5, "percentCapacity": 50, "timeInterval": 7, "percentPower": 59.240066297814785, "percentSystemCapacity": 18.05776378549693, "percentSystemPower": 19.498351552139866, "order": 3
                    }, {
                        "power": 113.81194386257513, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 8, "percentPower": 67.94742917168665, "percentSystemCapacity": 21.669316542596313, "percentSystemPower": 22.364304158493837, "order": 4
                    }, {
                        "power": 135.68882475251738, "airflow": 771.75, "percentCapacity": 75, "timeInterval": 9, "percentPower": 81.00825358359246, "percentSystemCapacity": 27.086645678245397, "percentSystemPower": 26.6631606902176, "order": 4
                    }, {
                        "power": 142.98102016545306, "airflow": 823.2, "percentCapacity": 80, "timeInterval": 10, "percentPower": 85.36180308385258, "percentSystemCapacity": 28.89242205679509, "percentSystemPower": 28.096093567587555, "order": 4
                    }, {
                        "power": 156.10684816069775, "airflow": 915.81, "percentCapacity": 89, "timeInterval": 11, "percentPower": 93.19811830489418, "percentSystemCapacity": 32.14281953818453, "percentSystemPower": 30.675348430084053, "order": 4
                    }, {
                        "power": 164.85731176874907, "airflow": 977.55, "percentCapacity": 95, "timeInterval": 12, "percentPower": 98.42227568283526, "percentSystemCapacity": 34.30975119244417, "percentSystemPower": 32.39483430315368, "order": 4
                    }, {
                        "power": 166.31571549557484, "airflow": 987.84, "percentCapacity": 96, "timeInterval": 13, "percentPower": 99.29296447497005, "percentSystemCapacity": 34.67090646815411, "percentSystemPower": 32.68141393114066, "order": 4
                    }, {
                        "power": 166.31571549557484, "airflow": 987.84, "percentCapacity": 96, "timeInterval": 14, "percentPower": 99.29296447497005, "percentSystemCapacity": 34.67090646815411, "percentSystemPower": 32.68141393114066, "order": 4
                    }, {
                        "power": 163.39890607779074, "airflow": 967.26, "percentCapacity": 94, "timeInterval": 15, "percentPower": 97.55158571808403, "percentSystemCapacity": 33.948595916734234, "percentSystemPower": 32.10825428921021, "order": 4
                    }, {
                        "power": 150.27316647172623, "airflow": 874.65, "percentCapacity": 85, "timeInterval": 16, "percentPower": 89.71532326670223, "percentSystemCapacity": 30.698198435344782, "percentSystemPower": 29.529016795387353, "order": 4
                    }, {
                        "power": 142.98102016545306, "airflow": 823.2, "percentCapacity": 80, "timeInterval": 17, "percentPower": 85.36180308385258, "percentSystemCapacity": 28.89242205679509, "percentSystemPower": 28.096093567587555, "order": 4
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 109.9, "automaticShutdownTimer": false
                }, {
                    "compressorId": "fyg7r7zje", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 109.9, "fullLoadCapacity": 1029, "automaticShutdownTimer": false
                }, {
                    "compressorId": "y7hvpmbhg", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 8, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 165.47022516070746, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 9, "percentPower": 99.38151661303752, "percentSystemCapacity": 29.913764964779467, "percentSystemPower": 32.51527316972047, "order": 3
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 10, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 11, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 12, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 13, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 160.79987214250175, "airflow": 757.6, "percentCapacity": 80, "timeInterval": 14, "percentPower": 96.57649978528634, "percentSystemCapacity": 26.59001330202619, "percentSystemPower": 31.597538247691443, "order": 3
                    }, {
                        "power": 163.22432875103112, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 15, "percentPower": 98.03262988049917, "percentSystemCapacity": 28.251889133402823, "percentSystemPower": 32.07394944999629, "order": 3
                    }, {
                        "power": 165.47022516070746, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 16, "percentPower": 99.38151661303752, "percentSystemCapacity": 29.913764964779467, "percentSystemPower": 32.51527316972047, "order": 3
                    }, {
                        "power": 165.47022516070746, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 17, "percentPower": 99.38151661303752, "percentSystemCapacity": 29.913764964779467, "percentSystemPower": 32.51527316972047, "order": 3
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 115, "automaticShutdownTimer": false
                }, {
                    "compressorId": "y7hvpmbhg", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }, {
                        "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                    }], "fullLoadPressure": 115, "fullLoadCapacity": 947, "automaticShutdownTimer": false
                }], "targetPressure": null, "variance": null
            }, "reduceRuntime": {
                "runtimeData": [{
                    "compressorId": "mtz2caylr", "fullLoadCapacity": 457, "intervalData": [{
                        "isCompressorOn": true, "timeInterval": 0
                    }, {
                        "isCompressorOn": true, "timeInterval": 1
                    }, {
                        "isCompressorOn": true, "timeInterval": 2
                    }, {
                        "isCompressorOn": true, "timeInterval": 3
                    }, {
                        "isCompressorOn": true, "timeInterval": 4
                    }, {
                        "isCompressorOn": true, "timeInterval": 5
                    }, {
                        "isCompressorOn": true, "timeInterval": 6
                    }, {
                        "isCompressorOn": true, "timeInterval": 7
                    }, {
                        "isCompressorOn": true, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": true, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": true, "timeInterval": 18
                    }, {
                        "isCompressorOn": true, "timeInterval": 19
                    }, {
                        "isCompressorOn": true, "timeInterval": 20
                    }, {
                        "isCompressorOn": true, "timeInterval": 21
                    }, {
                        "isCompressorOn": true, "timeInterval": 22
                    }, {
                        "isCompressorOn": true, "timeInterval": 23
                    }], "dayTypeId": "hptkgnqnm", "automaticShutdownTimer": true
                }, {
                    "compressorId": "4wjupov45", "fullLoadCapacity": 416, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": true, "timeInterval": 1
                    }, {
                        "isCompressorOn": false, "timeInterval": 2
                    }, {
                        "isCompressorOn": true, "timeInterval": 3
                    }, {
                        "isCompressorOn": true, "timeInterval": 4
                    }, {
                        "isCompressorOn": true, "timeInterval": 5
                    }, {
                        "isCompressorOn": true, "timeInterval": 6
                    }, {
                        "isCompressorOn": true, "timeInterval": 7
                    }, {
                        "isCompressorOn": true, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": true, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": true, "timeInterval": 18
                    }, {
                        "isCompressorOn": true, "timeInterval": 19
                    }, {
                        "isCompressorOn": true, "timeInterval": 20
                    }, {
                        "isCompressorOn": true, "timeInterval": 21
                    }, {
                        "isCompressorOn": true, "timeInterval": 22
                    }, {
                        "isCompressorOn": true, "timeInterval": 23
                    }], "dayTypeId": "hptkgnqnm", "automaticShutdownTimer": false
                }, {
                    "compressorId": "fyg7r7zje", "fullLoadCapacity": 1029, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": false, "timeInterval": 1
                    }, {
                        "isCompressorOn": false, "timeInterval": 2
                    }, {
                        "isCompressorOn": false, "timeInterval": 3
                    }, {
                        "isCompressorOn": false, "timeInterval": 4
                    }, {
                        "isCompressorOn": true, "timeInterval": 5
                    }, {
                        "isCompressorOn": true, "timeInterval": 6
                    }, {
                        "isCompressorOn": true, "timeInterval": 7
                    }, {
                        "isCompressorOn": true, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": true, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": false, "timeInterval": 18
                    }, {
                        "isCompressorOn": false, "timeInterval": 19
                    }, {
                        "isCompressorOn": false, "timeInterval": 20
                    }, {
                        "isCompressorOn": false, "timeInterval": 21
                    }, {
                        "isCompressorOn": false, "timeInterval": 22
                    }, {
                        "isCompressorOn": false, "timeInterval": 23
                    }], "dayTypeId": "hptkgnqnm", "automaticShutdownTimer": true
                }, {
                    "compressorId": "y7hvpmbhg", "fullLoadCapacity": 947, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": false, "timeInterval": 1
                    }, {
                        "isCompressorOn": false, "timeInterval": 2
                    }, {
                        "isCompressorOn": false, "timeInterval": 3
                    }, {
                        "isCompressorOn": false, "timeInterval": 4
                    }, {
                        "isCompressorOn": false, "timeInterval": 5
                    }, {
                        "isCompressorOn": false, "timeInterval": 6
                    }, {
                        "isCompressorOn": false, "timeInterval": 7
                    }, {
                        "isCompressorOn": true, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": true, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": false, "timeInterval": 18
                    }, {
                        "isCompressorOn": false, "timeInterval": 19
                    }, {
                        "isCompressorOn": false, "timeInterval": 20
                    }, {
                        "isCompressorOn": false, "timeInterval": 21
                    }, {
                        "isCompressorOn": false, "timeInterval": 22
                    }, {
                        "isCompressorOn": false, "timeInterval": 23
                    }], "dayTypeId": "hptkgnqnm", "automaticShutdownTimer": false
                }, {
                    "compressorId": "mtz2caylr", "fullLoadCapacity": 457, "intervalData": [{
                        "isCompressorOn": true, "timeInterval": 0
                    }, {
                        "isCompressorOn": true, "timeInterval": 1
                    }, {
                        "isCompressorOn": true, "timeInterval": 2
                    }, {
                        "isCompressorOn": true, "timeInterval": 3
                    }, {
                        "isCompressorOn": true, "timeInterval": 4
                    }, {
                        "isCompressorOn": true, "timeInterval": 5
                    }, {
                        "isCompressorOn": true, "timeInterval": 6
                    }, {
                        "isCompressorOn": true, "timeInterval": 7
                    }, {
                        "isCompressorOn": true, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": true, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": true, "timeInterval": 18
                    }, {
                        "isCompressorOn": true, "timeInterval": 19
                    }, {
                        "isCompressorOn": true, "timeInterval": 20
                    }, {
                        "isCompressorOn": true, "timeInterval": 21
                    }, {
                        "isCompressorOn": true, "timeInterval": 22
                    }, {
                        "isCompressorOn": true, "timeInterval": 23
                    }], "dayTypeId": "fehuh48hb", "automaticShutdownTimer": false
                }, {
                    "compressorId": "4wjupov45", "fullLoadCapacity": 416, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": false, "timeInterval": 1
                    }, {
                        "isCompressorOn": true, "timeInterval": 2
                    }, {
                        "isCompressorOn": true, "timeInterval": 3
                    }, {
                        "isCompressorOn": true, "timeInterval": 4
                    }, {
                        "isCompressorOn": true, "timeInterval": 5
                    }, {
                        "isCompressorOn": true, "timeInterval": 6
                    }, {
                        "isCompressorOn": true, "timeInterval": 7
                    }, {
                        "isCompressorOn": false, "timeInterval": 8
                    }, {
                        "isCompressorOn": true, "timeInterval": 9
                    }, {
                        "isCompressorOn": true, "timeInterval": 10
                    }, {
                        "isCompressorOn": true, "timeInterval": 11
                    }, {
                        "isCompressorOn": false, "timeInterval": 12
                    }, {
                        "isCompressorOn": true, "timeInterval": 13
                    }, {
                        "isCompressorOn": true, "timeInterval": 14
                    }, {
                        "isCompressorOn": true, "timeInterval": 15
                    }, {
                        "isCompressorOn": true, "timeInterval": 16
                    }, {
                        "isCompressorOn": true, "timeInterval": 17
                    }, {
                        "isCompressorOn": false, "timeInterval": 18
                    }, {
                        "isCompressorOn": false, "timeInterval": 19
                    }, {
                        "isCompressorOn": false, "timeInterval": 20
                    }, {
                        "isCompressorOn": false, "timeInterval": 21
                    }, {
                        "isCompressorOn": false, "timeInterval": 22
                    }, {
                        "isCompressorOn": false, "timeInterval": 23
                    }], "dayTypeId": "fehuh48hb", "automaticShutdownTimer": true
                }, {
                    "compressorId": "fyg7r7zje", "fullLoadCapacity": 1029, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": false, "timeInterval": 1
                    }, {
                        "isCompressorOn": false, "timeInterval": 2
                    }, {
                        "isCompressorOn": false, "timeInterval": 3
                    }, {
                        "isCompressorOn": false, "timeInterval": 4
                    }, {
                        "isCompressorOn": false, "timeInterval": 5
                    }, {
                        "isCompressorOn": false, "timeInterval": 6
                    }, {
                        "isCompressorOn": false, "timeInterval": 7
                    }, {
                        "isCompressorOn": false, "timeInterval": 8
                    }, {
                        "isCompressorOn": false, "timeInterval": 9
                    }, {
                        "isCompressorOn": false, "timeInterval": 10
                    }, {
                        "isCompressorOn": false, "timeInterval": 11
                    }, {
                        "isCompressorOn": false, "timeInterval": 12
                    }, {
                        "isCompressorOn": false, "timeInterval": 13
                    }, {
                        "isCompressorOn": false, "timeInterval": 14
                    }, {
                        "isCompressorOn": false, "timeInterval": 15
                    }, {
                        "isCompressorOn": false, "timeInterval": 16
                    }, {
                        "isCompressorOn": false, "timeInterval": 17
                    }, {
                        "isCompressorOn": false, "timeInterval": 18
                    }, {
                        "isCompressorOn": false, "timeInterval": 19
                    }, {
                        "isCompressorOn": false, "timeInterval": 20
                    }, {
                        "isCompressorOn": false, "timeInterval": 21
                    }, {
                        "isCompressorOn": false, "timeInterval": 22
                    }, {
                        "isCompressorOn": false, "timeInterval": 23
                    }], "dayTypeId": "fehuh48hb", "automaticShutdownTimer": false
                }, {
                    "compressorId": "y7hvpmbhg", "fullLoadCapacity": 947, "intervalData": [{
                        "isCompressorOn": false, "timeInterval": 0
                    }, {
                        "isCompressorOn": false, "timeInterval": 1
                    }, {
                        "isCompressorOn": false, "timeInterval": 2
                    }, {
                        "isCompressorOn": false, "timeInterval": 3
                    }, {
                        "isCompressorOn": false, "timeInterval": 4
                    }, {
                        "isCompressorOn": false, "timeInterval": 5
                    }, {
                        "isCompressorOn": false, "timeInterval": 6
                    }, {
                        "isCompressorOn": false, "timeInterval": 7
                    }, {
                        "isCompressorOn": false, "timeInterval": 8
                    }, {
                        "isCompressorOn": false, "timeInterval": 9
                    }, {
                        "isCompressorOn": false, "timeInterval": 10
                    }, {
                        "isCompressorOn": false, "timeInterval": 11
                    }, {
                        "isCompressorOn": false, "timeInterval": 12
                    }, {
                        "isCompressorOn": false, "timeInterval": 13
                    }, {
                        "isCompressorOn": false, "timeInterval": 14
                    }, {
                        "isCompressorOn": false, "timeInterval": 15
                    }, {
                        "isCompressorOn": false, "timeInterval": 16
                    }, {
                        "isCompressorOn": false, "timeInterval": 17
                    }, {
                        "isCompressorOn": false, "timeInterval": 18
                    }, {
                        "isCompressorOn": false, "timeInterval": 19
                    }, {
                        "isCompressorOn": false, "timeInterval": 20
                    }, {
                        "isCompressorOn": false, "timeInterval": 21
                    }, {
                        "isCompressorOn": false, "timeInterval": 22
                    }, {
                        "isCompressorOn": false, "timeInterval": 23
                    }], "dayTypeId": "fehuh48hb", "automaticShutdownTimer": false
                }], "implementationCost": 1500, "order": 5
            }, "addPrimaryReceiverVolume": {
                "increasedVolume": 1000, "implementationCost": 2000, "order": 2
            }
        }], "setupDone": true,
        "systemBasics": {
            "notes": undefined,
            "utilityType": "Electricity", "electricityCost": 0.066, "demandCost": 5
        }, "systemInformation": {
            "systemElevation": 0, "totalAirStorage": 1000, "isSequencerUsed": false, "targetPressure": 0, "variance": 0, "atmosphericPressure": 14.7, "atmosphericPressureKnown": true
        },
        "compressorInventoryItems": [{
            "itemId": "mtz2caylr", "name": "Compressor A", "description": null,
            "modifiedDate": new Date(),
            "nameplateData": {
                "compressorType": 1, "motorPower": 100, "fullLoadOperatingPressure": 115, "fullLoadRatedCapacity": 457, "ratedLoadPower": null, "ploytropicCompressorExponent": 1.4, "fullLoadAmps": 119, "totalPackageInputPower": 89.5
            }, "compressorControls": {
                "controlType": 2, "unloadPointCapacity": 50, "numberOfUnloadSteps": 2, "automaticShutdown": false, "unloadSumpPressure": 15
            }, "inletConditions": {
                "temperature": 68
            }, "designDetails": {
                "blowdownTime": 40, "modulatingPressureRange": 20, "inputPressure": 14.5, "designEfficiency": 91.7, "serviceFactor": 1.15, "noLoadPowerFM": 65, "noLoadPowerUL": 17, "maxFullFlowPressure": 115
            }, "centrifugalSpecifics": {
                "surgeAirflow": null, "maxFullLoadPressure": -9999.04, "maxFullLoadCapacity": null, "minFullLoadPressure": -9999.04, "minFullLoadCapacity": null
            }, "performancePoints": {
                "fullLoad": {
                    "dischargePressure": 115, "isDefaultPower": true, "airflow": 457, "isDefaultAirFlow": true, "power": 89.5, "isDefaultPressure": true
                }, "maxFullFlow": {
                    "dischargePressure": 115, "isDefaultPower": true, "airflow": 457, "isDefaultAirFlow": true, "power": 89.5, "isDefaultPressure": true
                }, "unloadPoint": {
                    "dischargePressure": 125, "isDefaultPower": true, "airflow": 229, "isDefaultAirFlow": true, "power": 73.9, "isDefaultPressure": true
                }, "noLoad": {
                    "dischargePressure": 15, "isDefaultPower": true, "airflow": 0, "isDefaultAirFlow": true, "power": 16, "isDefaultPressure": true
                }, "blowoff": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }
            }, "isValid": true, "compressorLibId": 317
        }, {
            "itemId": "4wjupov45", "name": "Compressor B", "description": null,
            "modifiedDate": new Date(),
            "nameplateData": {
                "compressorType": 1, "motorPower": 100, "fullLoadOperatingPressure": 125, "fullLoadRatedCapacity": 416, "ratedLoadPower": null, "ploytropicCompressorExponent": 1.4, "fullLoadAmps": 119, "totalPackageInputPower": 85.4
            }, "compressorControls": {
                "controlType": 4, "unloadPointCapacity": 100, "numberOfUnloadSteps": 2, "automaticShutdown": false, "unloadSumpPressure": 15
            }, "inletConditions": {
                "temperature": 68
            }, "designDetails": {
                "blowdownTime": 40, "modulatingPressureRange": -9999.04, "inputPressure": 14.5, "designEfficiency": 91.7, "serviceFactor": 1.15, "noLoadPowerFM": null, "noLoadPowerUL": 16, "maxFullFlowPressure": 135
            }, "centrifugalSpecifics": {
                "surgeAirflow": null, "maxFullLoadPressure": -9999.04, "maxFullLoadCapacity": null, "minFullLoadPressure": -9999.04, "minFullLoadCapacity": null
            }, "performancePoints": {
                "fullLoad": {
                    "dischargePressure": 125, "isDefaultPower": true, "airflow": 416, "isDefaultAirFlow": true, "power": 85.4, "isDefaultPressure": true
                }, "maxFullFlow": {
                    "dischargePressure": 135, "isDefaultPower": true, "airflow": 413, "isDefaultAirFlow": true, "power": 89, "isDefaultPressure": true
                }, "unloadPoint": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }, "noLoad": {
                    "dischargePressure": 15, "isDefaultPower": true, "airflow": 0, "isDefaultAirFlow": true, "power": 14.5, "isDefaultPressure": true
                }, "blowoff": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }
            }, "isValid": true, "compressorLibId": 324
        }, {
            "itemId": "fyg7r7zje", "name": "Compressor C", "description": null,
            "modifiedDate": new Date(),
            "nameplateData": {
                "compressorType": 5, "motorPower": 200, "fullLoadOperatingPressure": 110, "fullLoadRatedCapacity": 1029, "ratedLoadPower": null, "ploytropicCompressorExponent": 1.4, "fullLoadAmps": 223, "totalPackageInputPower": 166.5
            }, "compressorControls": {
                "controlType": 4, "unloadPointCapacity": 100, "numberOfUnloadSteps": 2, "automaticShutdown": false, "unloadSumpPressure": -9999.04
            }, "inletConditions": {
                "temperature": 68
            }, "designDetails": {
                "blowdownTime": null, "modulatingPressureRange": -9999.04, "inputPressure": 14.5, "designEfficiency": 94.1, "serviceFactor": 1.15, "noLoadPowerFM": null, "noLoadPowerUL": 15, "maxFullFlowPressure": 120
            }, "centrifugalSpecifics": {
                "surgeAirflow": null, "maxFullLoadPressure": -9999.04, "maxFullLoadCapacity": null, "minFullLoadPressure": -9999.04, "minFullLoadCapacity": null
            }, "performancePoints": {
                "fullLoad": {
                    "dischargePressure": 110, "isDefaultPower": true, "airflow": 1029, "isDefaultAirFlow": true, "power": 167.5, "isDefaultPressure": true
                }, "maxFullFlow": {
                    "dischargePressure": 120, "isDefaultPower": true, "airflow": 1021, "isDefaultAirFlow": true, "power": 176.8, "isDefaultPressure": true
                }, "unloadPoint": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }, "noLoad": {
                    "dischargePressure": 0, "isDefaultPower": true, "airflow": 0, "isDefaultAirFlow": true, "power": 26.3, "isDefaultPressure": true
                }, "blowoff": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }
            }, "isValid": true, "compressorLibId": 1216
        }, {
            "itemId": "y7hvpmbhg", "name": "Compressor D", "description": null,
            "modifiedDate": new Date(),
            "nameplateData": {
                "compressorType": 2, "motorPower": 200, "fullLoadOperatingPressure": 115, "fullLoadRatedCapacity": 947, "ratedLoadPower": null, "ploytropicCompressorExponent": 1.4, "fullLoadAmps": 223, "totalPackageInputPower": 166.5
            }, "compressorControls": {
                "controlType": 4, "unloadPointCapacity": 100, "numberOfUnloadSteps": 2, "automaticShutdown": false, "unloadSumpPressure": 15
            }, "inletConditions": {
                "temperature": 68
            }, "designDetails": {
                "blowdownTime": 40, "modulatingPressureRange": -9999.04, "inputPressure": 14.5, "designEfficiency": 94.1, "serviceFactor": 1.15, "noLoadPowerFM": null, "noLoadPowerUL": 20, "maxFullFlowPressure": 125
            }, "centrifugalSpecifics": {
                "surgeAirflow": null, "maxFullLoadPressure": -9999.04, "maxFullLoadCapacity": null, "minFullLoadPressure": -9999.04, "minFullLoadCapacity": null
            }, "performancePoints": {
                "fullLoad": {
                    "dischargePressure": 115, "isDefaultPower": true, "airflow": 947, "isDefaultAirFlow": true, "power": 166.5, "isDefaultPressure": true
                }, "maxFullFlow": {
                    "dischargePressure": 125, "isDefaultPower": true, "airflow": 940, "isDefaultAirFlow": true, "power": 174.2, "isDefaultPressure": true
                }, "unloadPoint": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }, "noLoad": {
                    "dischargePressure": 15, "isDefaultPower": true, "airflow": 0, "isDefaultAirFlow": true, "power": 34.1, "isDefaultPressure": true
                }, "blowoff": {
                    "isDefaultPower": true, "isDefaultAirFlow": true, "isDefaultPressure": true, "dischargePressure": null, "airflow": null, "power": null
                }
            }, "isValid": true, "compressorLibId": 709
        }], "systemProfile": {
            "systemProfileSetup": {
                "dayTypeId": "fehuh48hb", "numberOfHours": 24, "dataInterval": 1, "profileDataType": "percentCapacity"
            }, "profileSummary": [{
                "compressorId": "mtz2caylr", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                    "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 0, "percentPower": 82.5, "percentSystemCapacity": 8.020358020358021, "percentSystemPower": 14.509235606209472, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 1, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 2, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 3, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 4, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 5, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 86.3675, "airflow": 411.3, "percentCapacity": 90, "timeInterval": 6, "percentPower": 96.50000000000001, "percentSystemCapacity": 14.436644436644436, "percentSystemPower": 16.971408921202595, "order": 2
                }, {
                    "power": 89.5, "airflow": 457, "percentCapacity": 100, "timeInterval": 7, "percentPower": 100, "percentSystemCapacity": 16.040716040716042, "percentSystemPower": 17.586952249950873, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 8, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 88.8735, "airflow": 447.86, "percentCapacity": 98, "timeInterval": 9, "percentPower": 99.30000000000001, "percentSystemCapacity": 15.719901719901722, "percentSystemPower": 17.46384358420122, "order": 2
                }, {
                    "power": 88.247, "airflow": 438.72, "percentCapacity": 96, "timeInterval": 10, "percentPower": 98.6, "percentSystemCapacity": 15.3990873990874, "percentSystemPower": 17.340734918451563, "order": 2
                }, {
                    "power": 88.8735, "airflow": 447.86, "percentCapacity": 98, "timeInterval": 11, "percentPower": 99.30000000000001, "percentSystemCapacity": 15.719901719901722, "percentSystemPower": 17.46384358420122, "order": 2
                }, {
                    "power": 86.3675, "airflow": 411.3, "percentCapacity": 90, "timeInterval": 12, "percentPower": 96.50000000000001, "percentSystemCapacity": 14.436644436644436, "percentSystemPower": 16.971408921202595, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 13, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 14, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 15, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 16, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 87.93375, "airflow": 434.15, "percentCapacity": 95, "timeInterval": 17, "percentPower": 98.25, "percentSystemCapacity": 15.238680238680239, "percentSystemPower": 17.279180585576736, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 18, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 19, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 20, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 21, "percentPower": 87.75, "percentSystemCapacity": 10.426465426465427, "percentSystemPower": 15.432550599331893, "order": 2
                }, {
                    "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 22, "percentPower": 82.5, "percentSystemCapacity": 8.020358020358021, "percentSystemPower": 14.509235606209472, "order": 2
                }, {
                    "power": 73.8375, "airflow": 228.5, "percentCapacity": 50, "timeInterval": 23, "percentPower": 82.5, "percentSystemCapacity": 8.020358020358021, "percentSystemPower": 14.509235606209472, "order": 2
                }], "fullLoadPressure": 115, "fullLoadCapacity": null
            }, {
                "compressorId": "mtz2caylr", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                    "power": 75.40375, "airflow": 251.35, "percentCapacity": 55.00000000000001, "timeInterval": 0, "percentPower": 84.25, "percentSystemCapacity": 8.822393822393822, "percentSystemPower": 14.817007270583613, "order": 2
                }, {
                    "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 1, "percentPower": 87.75, "percentSystemCapacity": 10.426465426465427, "percentSystemPower": 15.432550599331893, "order": 2
                }, {
                    "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 2, "percentPower": 87.75, "percentSystemCapacity": 10.426465426465427, "percentSystemPower": 15.432550599331893, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 3, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 83.235, "airflow": 365.6, "percentCapacity": 80, "timeInterval": 4, "percentPower": 93, "percentSystemCapacity": 12.832572832572833, "percentSystemPower": 16.355865592454315, "order": 2
                }, {
                    "power": 82.29525000000001, "airflow": 351.89, "percentCapacity": 77, "timeInterval": 5, "percentPower": 91.95, "percentSystemCapacity": 12.35135135135135, "percentSystemPower": 16.171202593829832, "order": 2
                }, {
                    "power": 81.982, "airflow": 347.32, "percentCapacity": 76, "timeInterval": 6, "percentPower": 91.60000000000001, "percentSystemCapacity": 12.19094419094419, "percentSystemPower": 16.109648260955, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 7, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 80.10249999999999, "airflow": 319.9, "percentCapacity": 70, "timeInterval": 8, "percentPower": 89.49999999999999, "percentSystemCapacity": 11.228501228501228, "percentSystemPower": 15.740322263706034, "order": 2
                }, {
                    "power": 80.729, "airflow": 329.04, "percentCapacity": 72, "timeInterval": 9, "percentPower": 90.2, "percentSystemCapacity": 11.549315549315548, "percentSystemPower": 15.863430929455689, "order": 2
                }, {
                    "power": 81.04225, "airflow": 333.61, "percentCapacity": 73, "timeInterval": 10, "percentPower": 90.55, "percentSystemCapacity": 11.70972270972271, "percentSystemPower": 15.924985262330516, "order": 2
                }, {
                    "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 11, "percentPower": 87.75, "percentSystemCapacity": 10.426465426465427, "percentSystemPower": 15.432550599331893, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 12, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 81.66875, "airflow": 342.75, "percentCapacity": 75, "timeInterval": 13, "percentPower": 91.25, "percentSystemCapacity": 12.030537030537031, "percentSystemPower": 16.048093928080174, "order": 2
                }, {
                    "power": 82.29525000000001, "airflow": 351.89, "percentCapacity": 77, "timeInterval": 14, "percentPower": 91.95, "percentSystemCapacity": 12.35135135135135, "percentSystemPower": 16.171202593829832, "order": 2
                }, {
                    "power": 82.6085, "airflow": 356.46, "percentCapacity": 78, "timeInterval": 15, "percentPower": 92.30000000000001, "percentSystemCapacity": 12.511758511758513, "percentSystemPower": 16.23275692670466, "order": 2
                }, {
                    "power": 84.80125, "airflow": 388.45, "percentCapacity": 85, "timeInterval": 16, "percentPower": 94.75, "percentSystemCapacity": 13.634608634608632, "percentSystemPower": 16.663637256828455, "order": 2
                }, {
                    "power": 86.3675, "airflow": 411.3, "percentCapacity": 90, "timeInterval": 17, "percentPower": 96.50000000000001, "percentSystemCapacity": 14.436644436644436, "percentSystemPower": 16.971408921202595, "order": 2
                }, {
                    "power": 78.53625, "airflow": 297.05, "percentCapacity": 65, "timeInterval": 18, "percentPower": 87.75, "percentSystemCapacity": 10.426465426465427, "percentSystemPower": 15.432550599331893, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 19, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 20, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 21, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 22, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }, {
                    "power": 76.97, "airflow": 274.2, "percentCapacity": 60, "timeInterval": 23, "percentPower": 86, "percentSystemCapacity": 9.624429624429624, "percentSystemPower": 15.124778934957753, "order": 2
                }], "fullLoadPressure": 115, "fullLoadCapacity": 456.97
            }, {
                "compressorId": "4wjupov45", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 0, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 1, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 81.00808871671393, "airflow": 349.44, "percentCapacity": 84, "timeInterval": 2, "percentPower": 94.85724674088281, "percentSystemCapacity": 12.265356265356266, "percentSystemPower": 15.918272492967954, "order": 1
                }, {
                    "power": 85.1637863599693, "airflow": 395.2, "percentCapacity": 95, "timeInterval": 3, "percentPower": 99.72340323181416, "percentSystemCapacity": 13.87153387153387, "percentSystemPower": 16.734876470813383, "order": 1
                }, {
                    "power": 85.1637863599693, "airflow": 395.2, "percentCapacity": 95, "timeInterval": 4, "percentPower": 99.72340323181416, "percentSystemCapacity": 13.87153387153387, "percentSystemPower": 16.734876470813383, "order": 1
                }, {
                    "power": 63.471716348505396, "airflow": 208, "percentCapacity": 50, "timeInterval": 5, "percentPower": 74.32285286710233, "percentSystemCapacity": 7.300807300807301, "percentSystemPower": 12.472335694341796, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 6, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 7, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 8, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 9, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 10, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 11, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 12, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 13, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 14, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 15, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 16, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 17, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 18, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 19, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 20, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 21, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 22, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }, {
                    "power": 79.34980709277082, "airflow": 332.8, "percentCapacity": 80, "timeInterval": 23, "percentPower": 92.9154649798253, "percentSystemCapacity": 11.681291681291682, "percentSystemPower": 15.592416406518142, "order": 1
                }], "fullLoadPressure": 125, "fullLoadCapacity": null
            }, {
                "compressorId": "4wjupov45", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                    "power": 77.15091271036175, "airflow": 312, "percentCapacity": 75, "timeInterval": 0, "percentPower": 90.34064720182874, "percentSystemCapacity": 10.951210951210951, "percentSystemPower": 15.160328691366034, "order": 1
                }, {
                    "power": 74.79779504174451, "airflow": 291.2, "percentCapacity": 70, "timeInterval": 1, "percentPower": 87.58524009571957, "percentSystemCapacity": 10.22113022113022, "percentSystemPower": 14.697935751963945, "order": 1
                }, {
                    "power": 77.15091271036175, "airflow": 312, "percentCapacity": 75, "timeInterval": 2, "percentPower": 90.34064720182874, "percentSystemCapacity": 10.951210951210951, "percentSystemPower": 15.160328691366034, "order": 1
                }, {
                    "power": 72.27345357620203, "airflow": 270.4, "percentCapacity": 65, "timeInterval": 3, "percentPower": 84.6293367402834, "percentSystemCapacity": 9.491049491049493, "percentSystemPower": 14.20189694953862, "order": 1
                }, {
                    "power": 74.79779504174451, "airflow": 291.2, "percentCapacity": 70, "timeInterval": 4, "percentPower": 87.58524009571957, "percentSystemCapacity": 10.22113022113022, "percentSystemPower": 14.697935751963945, "order": 1
                }, {
                    "power": 74.79779504174451, "airflow": 291.2, "percentCapacity": 70, "timeInterval": 5, "percentPower": 87.58524009571957, "percentSystemCapacity": 10.22113022113022, "percentSystemPower": 14.697935751963945, "order": 1
                }, {
                    "power": 74.79779504174451, "airflow": 291.2, "percentCapacity": 70, "timeInterval": 6, "percentPower": 87.58524009571957, "percentSystemCapacity": 10.22113022113022, "percentSystemPower": 14.697935751963945, "order": 1
                }, {
                    "power": 69.55882569980568, "airflow": 249.6, "percentCapacity": 60, "timeInterval": 7, "percentPower": 81.45061557354295, "percentSystemCapacity": 8.760968760968762, "percentSystemPower": 13.668466437375848, "order": 1
                }, {
                    "power": 72.27345357620203, "airflow": 270.4, "percentCapacity": 65, "timeInterval": 8, "percentPower": 84.6293367402834, "percentSystemCapacity": 9.491049491049493, "percentSystemPower": 14.20189694953862, "order": 1
                }, {
                    "power": 73.80962515966785, "airflow": 282.88, "percentCapacity": 68, "timeInterval": 9, "percentPower": 86.42813250546585, "percentSystemCapacity": 9.929097929097928, "percentSystemPower": 14.503758137093309, "order": 1
                }, {
                    "power": 72.79290402267293, "airflow": 274.56, "percentCapacity": 66, "timeInterval": 10, "percentPower": 85.2375925324039, "percentSystemCapacity": 9.637065637065637, "percentSystemPower": 14.303970136111795, "order": 1
                }, {
                    "power": 75.75859230080944, "airflow": 299.52, "percentCapacity": 72, "timeInterval": 11, "percentPower": 88.71029543420309, "percentSystemCapacity": 10.513162513162513, "percentSystemPower": 14.886734584556777, "order": 1
                }, {
                    "power": 75.75859230080944, "airflow": 299.52, "percentCapacity": 72, "timeInterval": 12, "percentPower": 88.71029543420309, "percentSystemCapacity": 10.513162513162513, "percentSystemPower": 14.886734584556777, "order": 1
                }, {
                    "power": 81.40957908914702, "airflow": 353.6, "percentCapacity": 85, "timeInterval": 13, "percentPower": 95.32737598260775, "percentSystemCapacity": 12.41137241137241, "percentSystemPower": 15.99716625842936, "order": 1
                }, {
                    "power": 81.40957908914702, "airflow": 353.6, "percentCapacity": 85, "timeInterval": 14, "percentPower": 95.32737598260775, "percentSystemCapacity": 12.41137241137241, "percentSystemPower": 15.99716625842936, "order": 1
                }, {
                    "power": 78.48774926039555, "airflow": 324.48, "percentCapacity": 78, "timeInterval": 15, "percentPower": 91.9060295789175, "percentSystemCapacity": 11.38925938925939, "percentSystemPower": 15.423020094398812, "order": 1
                }, {
                    "power": 81.40957908914702, "airflow": 353.6, "percentCapacity": 85, "timeInterval": 16, "percentPower": 95.32737598260775, "percentSystemCapacity": 12.41137241137241, "percentSystemPower": 15.99716625842936, "order": 1
                }, {
                    "power": 77.15091271036175, "airflow": 312, "percentCapacity": 75, "timeInterval": 17, "percentPower": 90.34064720182874, "percentSystemCapacity": 10.951210951210951, "percentSystemPower": 15.160328691366034, "order": 1
                }, {
                    "power": 69.55882569980568, "airflow": 249.6, "percentCapacity": 60, "timeInterval": 18, "percentPower": 81.45061557354295, "percentSystemCapacity": 8.760968760968762, "percentSystemPower": 13.668466437375848, "order": 1
                }, {
                    "power": 69.55882569980568, "airflow": 249.6, "percentCapacity": 60, "timeInterval": 19, "percentPower": 81.45061557354295, "percentSystemCapacity": 8.760968760968762, "percentSystemPower": 13.668466437375848, "order": 1
                }, {
                    "power": 63.471716348505396, "airflow": 208, "percentCapacity": 50, "timeInterval": 20, "percentPower": 74.32285286710233, "percentSystemCapacity": 7.300807300807301, "percentSystemPower": 12.472335694341796, "order": 1
                }, {
                    "power": 63.471716348505396, "airflow": 208, "percentCapacity": 50, "timeInterval": 21, "percentPower": 74.32285286710233, "percentSystemCapacity": 7.300807300807301, "percentSystemPower": 12.472335694341796, "order": 1
                }, {
                    "power": 63.471716348505396, "airflow": 208, "percentCapacity": 50, "timeInterval": 22, "percentPower": 74.32285286710233, "percentSystemCapacity": 7.300807300807301, "percentSystemPower": 12.472335694341796, "order": 1
                }, {
                    "power": 63.471716348505396, "airflow": 208, "percentCapacity": 50, "timeInterval": 23, "percentPower": 74.32285286710233, "percentSystemCapacity": 7.300807300807301, "percentSystemPower": 12.472335694341796, "order": 1
                }], "fullLoadPressure": 125, "fullLoadCapacity": 416.01
            }, {
                "compressorId": "fyg7r7zje", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 113.81196578029419, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 5, "percentPower": 67.94744225689206, "percentSystemCapacity": 21.67076167076167, "percentSystemPower": 22.36430846537516, "order": 3
                }, {
                    "power": 113.81196578029419, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 6, "percentPower": 67.94744225689206, "percentSystemCapacity": 21.67076167076167, "percentSystemPower": 22.36430846537516, "order": 3
                }, {
                    "power": 99.22713388054488, "airflow": 514.5, "percentCapacity": 50, "timeInterval": 7, "percentPower": 59.24007992868351, "percentSystemCapacity": 18.05896805896806, "percentSystemPower": 19.498356038621516, "order": 3
                }, {
                    "power": 113.81196578029419, "airflow": 617.4, "percentCapacity": 60, "timeInterval": 8, "percentPower": 67.94744225689206, "percentSystemCapacity": 21.67076167076167, "percentSystemPower": 22.36430846537516, "order": 4
                }, {
                    "power": 135.68884187489417, "airflow": 771.75, "percentCapacity": 75, "timeInterval": 9, "percentPower": 81.00826380590696, "percentSystemCapacity": 27.088452088452087, "percentSystemPower": 26.663164054803335, "order": 4
                }, {
                    "power": 142.98103477630858, "airflow": 823.2, "percentCapacity": 80, "timeInterval": 10, "percentPower": 85.36181180675139, "percentSystemCapacity": 28.894348894348898, "percentSystemPower": 28.096096438653678, "order": 4
                }, {
                    "power": 156.1068571004515, "airflow": 915.81, "percentCapacity": 89, "timeInterval": 11, "percentPower": 93.1981236420606, "percentSystemCapacity": 32.14496314496314, "percentSystemPower": 30.675350186765865, "order": 4
                }, {
                    "power": 164.8573161061338, "airflow": 977.55, "percentCapacity": 95, "timeInterval": 12, "percentPower": 98.42227827231869, "percentSystemCapacity": 34.31203931203931, "percentSystemPower": 32.394835155459575, "order": 4
                }, {
                    "power": 166.31571900199646, "airflow": 987.84, "percentCapacity": 96, "timeInterval": 13, "percentPower": 99.29296656835609, "percentSystemCapacity": 34.67321867321867, "percentSystemPower": 32.68141462016044, "order": 4
                }, {
                    "power": 166.31571900199646, "airflow": 987.84, "percentCapacity": 96, "timeInterval": 14, "percentPower": 99.29296656835609, "percentSystemCapacity": 34.67321867321867, "percentSystemPower": 32.68141462016044, "order": 4
                }, {
                    "power": 163.39891122788114, "airflow": 967.26, "percentCapacity": 94, "timeInterval": 15, "percentPower": 97.55158879276486, "percentSystemCapacity": 33.95085995085995, "percentSystemPower": 32.10825530121461, "order": 4
                }, {
                    "power": 150.27317811456112, "airflow": 874.65, "percentCapacity": 85, "timeInterval": 16, "percentPower": 89.71533021764843, "percentSystemCapacity": 30.7002457002457, "percentSystemPower": 29.529019083230718, "order": 4
                }, {
                    "power": 142.98103477630858, "airflow": 823.2, "percentCapacity": 80, "timeInterval": 17, "percentPower": 85.36181180675139, "percentSystemCapacity": 28.894348894348898, "percentSystemPower": 28.096096438653678, "order": 4
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }], "fullLoadPressure": 110, "fullLoadCapacity": null
            }, {
                "compressorId": "fyg7r7zje", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }], "fullLoadPressure": 110, "fullLoadCapacity": 1029.07
            }, {
                "compressorId": "y7hvpmbhg", "dayTypeId": "hptkgnqnm", "profileSummaryData": [{
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 8, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 165.47058469203517, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 9, "percentPower": 99.38173254776888, "percentSystemCapacity": 29.91575991575992, "percentSystemPower": 32.51534381843882, "order": 3
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 10, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 11, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 12, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 13, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 160.80011965220513, "airflow": 757.6, "percentCapacity": 80, "timeInterval": 14, "percentPower": 96.57664843976283, "percentSystemCapacity": 26.591786591786594, "percentSystemPower": 31.597586883907475, "order": 3
                }, {
                    "power": 163.22463334966756, "airflow": 804.95, "percentCapacity": 85, "timeInterval": 15, "percentPower": 98.03281282262316, "percentSystemCapacity": 28.25377325377325, "percentSystemPower": 32.074009304316675, "order": 3
                }, {
                    "power": 165.47058469203517, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 16, "percentPower": 99.38173254776888, "percentSystemCapacity": 29.91575991575992, "percentSystemPower": 32.51534381843882, "order": 3
                }, {
                    "power": 165.47058469203517, "airflow": 852.3, "percentCapacity": 90, "timeInterval": 17, "percentPower": 99.38173254776888, "percentSystemCapacity": 29.91575991575992, "percentSystemPower": 32.51534381843882, "order": 3
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }], "fullLoadPressure": 115, "fullLoadCapacity": null
            }, {
                "compressorId": "y7hvpmbhg", "dayTypeId": "fehuh48hb", "profileSummaryData": [{
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 0, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 1, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 2, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 3, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 4, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 5, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 6, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 7, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 8, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 9, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 10, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 11, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 12, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 13, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 14, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 15, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 16, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 17, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 18, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 19, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 20, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 21, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 22, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }, {
                    "power": 0, "airflow": 0, "percentCapacity": 0, "timeInterval": 23, "percentPower": 0, "percentSystemCapacity": 0, "percentSystemPower": 0, "order": 0
                }], "fullLoadPressure": 115, "fullLoadCapacity": 947.14
            }]
        }, "compressedAirDayTypes": [{
            "dayTypeId": "hptkgnqnm", "name": "Weekday", "numberOfDays": 256, "profileDataType": "percentCapacity"
        }, {
            "dayTypeId": "fehuh48hb", "name": "Weekend", "numberOfDays": 104, "profileDataType": "percentCapacity"
        }]
    }, "id": 71, "selected": true
}



export const MockCompressedAirAssessmentSettings: Settings = {
    language: "English",
    currency: "$",
    unitsOfMeasure: "Imperial",
    distanceMeasurement: "ft",
    flowMeasurement: "gpm",
    powerMeasurement: "hp",
    pressureMeasurement: "psi",
    steamPressureMeasurement: "kPag",
    steamTemperatureMeasurement: "C",
    steamSpecificEnthalpyMeasurement: "kJkg",
    steamSpecificEntropyMeasurement: "kJkgK",
    steamSpecificVolumeMeasurement: "m3kg",
    steamMassFlowMeasurement: "klb",
    currentMeasurement: null,
    viscosityMeasurement: null,
    voltageMeasurement: null,
    energySourceType: "Fuel",
    furnaceType: null,
    energyResultUnit: "MMBtu",
    customFurnaceName: null,
    temperatureMeasurement: "F",
    fanTemperatureMeasurement: "F",
    appVersion: "0.2.8-beta",
    fanCurveType: null,
    fanConvertedConditions: null,
    phastRollupUnit: "MMBtu",
    phastRollupFuelUnit: "MMBtu",
    phastRollupElectricityUnit: "MMBtu",
    phastRollupSteamUnit: "MMBtu",
    defaultPanelTab: "results",
    fuelCost: 3.99,
    steamCost: 4.69,
    electricityCost: 0.066,
    densityMeasurement: "lbscf",
    fanFlowRate: "ft3/min",
    fanPressureMeasurement: "inH2o",
    fanBarometricPressure: "inHg",
    fanSpecificHeatGas: "btulbF",
    fanPowerMeasurement: "hp",
    facilityInfo: {
        companyName: "ORNL",
        facilityName: "ORNL Test Facility",
        address: {
            street: "1 Bethel Valley Rd.",
            city: "Oak Ridge",
            state: "TN",
            country: "U.S.",
            zip: "37831"
        },
        facilityContact: {
            contactName: "T. Owner",
            phoneNumber: 8655767658,
            email: "t.owner@ornl.com"
        },
        assessmentContact: {
            contactName: "D.O. Energy",
            phoneNumber: 1234567890,
            email: "AMO_ToolHelpDesk@ee.doe.gov"
        },
        date: "Tue Dec 04 2018"
    },
    steamPowerMeasurement: "kW",
    steamEnergyMeasurement: "MMBtu",
    commonRollupUnit: "MMBtu",
    pumpsRollupUnit: "MWh",
    fansRollupUnit: "MWh",
    steamRollupUnit: "MMBtu",
    wasteWaterRollupUnit: "kWh",
    compressedAirRollupUnit: "kWh"
};