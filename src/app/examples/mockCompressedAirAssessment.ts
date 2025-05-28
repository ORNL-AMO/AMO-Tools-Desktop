import { Assessment } from "../shared/models/assessment";
import { Calculator } from "../shared/models/calculators";
import { Settings } from "../shared/models/settings";



export const MockCompressedAirAssessment: Assessment =  {
    "name": "Compressed Air Example",
    "createdDate": new Date("2022-08-03T21:06:22.630Z"),
    "modifiedDate": new Date("2022-08-03T21:13:37.500Z"),
    "type": "CompressedAir",
    "isExample": true,
    "compressedAirAssessment": {
        "name": "Baseline",
        "modifications": [
            {
                "name": "Scenario 1",
                "modificationId": "wsth9ineg",
                "flowReallocation": {
                    "implementationCost": 0,
                },
                "reduceAirLeaks": {
                    "leakFlow": 2000,
                    "leakReduction": 10,
                    "implementationCost": 1000,
                    "order": 1
                },
                "improveEndUseEfficiency": {
                    "endUseEfficiencyItems": [
                        {
                            "reductionType": "Fixed",
                            "reductionData": [
                                {
                                    "dayTypeId": "hopx028cf",
                                    "dayTypeName": "Weekday",
                                    "data": [
                                        {
                                            "hourInterval": 0,
                                            "applyReduction": true,
                                            "reductionAmount": undefined
                                        },
                                        {
                                            "hourInterval": 1,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 2,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 3,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 4,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 5,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 6,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 7,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 8,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 9,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 10,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 11,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 12,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 13,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 14,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 15,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 16,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 17,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 18,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 19,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 20,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 21,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 22,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 23,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        }
                                    ]
                                },
                                {
                                    "dayTypeId": "mufcn7yvy",
                                    "dayTypeName": "Weekend",
                                    "data": [
                                        {
                                            "hourInterval": 0,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 1,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 2,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 3,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 4,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 5,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 6,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 7,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 8,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 9,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 10,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 11,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 12,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 13,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 14,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 15,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 16,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 17,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 18,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 19,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 20,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 21,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 22,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        },
                                        {
                                            "hourInterval": 23,
                                            "applyReduction": true,
                                            "reductionAmount": undefined

                                        }
                                    ]
                                }
                            ],
                            "name": "New Nozzels ",
                            "substituteAuxiliaryEquipment": false,
                            "equipmentDemand": 0,
                            "collapsed": false,
                            "implementationCost": 500,
                            "airflowReduction": 200
                        }
                    ],
                    "order": 2
                },
                "reduceSystemAirPressure": {
                    "averageSystemPressureReduction": 2,
                    "implementationCost": 400,
                    "order": 3
                },
                "adjustCascadingSetPoints": {
                    "order": 100,
                    "setPointData": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 125,
                            "maxFullFlowDischargePressure": 135
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 125,
                            "maxFullFlowDischargePressure": 135
                        }
                    ],
                    "implementationCost": 0
                },
                "useAutomaticSequencer": {
                    "order": 100,
                    "targetPressure": undefined,
                    "variance": undefined,
                    "implementationCost": 0,
                    "profileSummary": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 0,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 1,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 221.59999999999997,
                                    "airflow": 826.56,
                                    "percentCapacity": 44.510529108176875,
                                    "timeInterval": 2,
                                    "percentPower": 76.38745260255084,
                                    "percentSystemCapacity": 4.529595164066444,
                                    "percentSystemPower": 7.425775752295421,
                                    "order": 3
                                },
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 3,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 219.8,
                                    "airflow": 811.28,
                                    "percentCapacity": 43.687415667047524,
                                    "timeInterval": 4,
                                    "percentPower": 75.76697690451569,
                                    "percentSystemCapacity": 4.445831372956337,
                                    "percentSystemPower": 7.365458079217212,
                                    "order": 3
                                },
                                {
                                    "power": 219.3,
                                    "airflow": 807.08,
                                    "percentCapacity": 43.46133679665374,
                                    "timeInterval": 5,
                                    "percentPower": 75.59462254395036,
                                    "percentSystemCapacity": 4.422824552355655,
                                    "percentSystemPower": 7.34870317002882,
                                    "order": 3
                                },
                                {
                                    "power": 219.6,
                                    "airflow": 809.59,
                                    "percentCapacity": 43.59685181315922,
                                    "timeInterval": 6,
                                    "percentPower": 75.69803516028955,
                                    "percentSystemCapacity": 4.436615180679344,
                                    "percentSystemPower": 7.358756115541853,
                                    "order": 3
                                },
                                {
                                    "power": 217.9,
                                    "airflow": 795.43,
                                    "percentCapacity": 42.83412784901619,
                                    "timeInterval": 7,
                                    "percentPower": 75.11203033436745,
                                    "percentSystemCapacity": 4.3589968991463754,
                                    "percentSystemPower": 7.301789424301321,
                                    "order": 3
                                },
                                {
                                    "power": 217.4,
                                    "airflow": 791.31,
                                    "percentCapacity": 42.61217361432519,
                                    "timeInterval": 8,
                                    "percentPower": 74.93967597380214,
                                    "percentSystemCapacity": 4.336409820353018,
                                    "percentSystemPower": 7.285034515112929,
                                    "order": 3
                                },
                                {
                                    "power": 217.9,
                                    "airflow": 795.43,
                                    "percentCapacity": 42.83412784901619,
                                    "timeInterval": 9,
                                    "percentPower": 75.11203033436745,
                                    "percentSystemCapacity": 4.3589968991463754,
                                    "percentSystemPower": 7.301789424301321,
                                    "order": 3
                                },
                                {
                                    "power": 219.8,
                                    "airflow": 811.28,
                                    "percentCapacity": 43.687415667047524,
                                    "timeInterval": 10,
                                    "percentPower": 75.76697690451569,
                                    "percentSystemCapacity": 4.445831372956337,
                                    "percentSystemPower": 7.365458079217212,
                                    "order": 3
                                },
                                {
                                    "power": 218.7,
                                    "airflow": 802.07,
                                    "percentCapacity": 43.19149043314234,
                                    "timeInterval": 11,
                                    "percentPower": 75.38779731127197,
                                    "percentSystemCapacity": 4.395363751334138,
                                    "percentSystemPower": 7.328597279002748,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 12,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 234.2,
                                    "airflow": 941.73,
                                    "percentCapacity": 50.71262960473022,
                                    "timeInterval": 13,
                                    "percentPower": 80.73078248879696,
                                    "percentSystemCapacity": 5.160749297237178,
                                    "percentSystemPower": 7.847999463842906,
                                    "order": 3
                                },
                                {
                                    "power": 244.09999999999997,
                                    "airflow": 1043.81,
                                    "percentCapacity": 56.209670514834585,
                                    "timeInterval": 14,
                                    "percentPower": 84.14339882799034,
                                    "percentSystemCapacity": 5.720153339875483,
                                    "percentSystemPower": 8.17974666577307,
                                    "order": 3
                                },
                                {
                                    "power": 233.6,
                                    "airflow": 935.9,
                                    "percentCapacity": 50.39838547189199,
                                    "timeInterval": 15,
                                    "percentPower": 80.52395725611858,
                                    "percentSystemCapacity": 5.128770376003038,
                                    "percentSystemPower": 7.827893572816835,
                                    "order": 3
                                },
                                {
                                    "power": 235.4,
                                    "airflow": 953.52,
                                    "percentCapacity": 51.347261357457775,
                                    "timeInterval": 16,
                                    "percentPower": 81.14443295415373,
                                    "percentSystemCapacity": 5.225332329066149,
                                    "percentSystemPower": 7.8882112458950475,
                                    "order": 3
                                },
                                {
                                    "power": 235.90000000000003,
                                    "airflow": 958.47,
                                    "percentCapacity": 51.61414247027303,
                                    "timeInterval": 17,
                                    "percentPower": 81.31678731471906,
                                    "percentSystemCapacity": 5.2524913726050535,
                                    "percentSystemPower": 7.904966155083441,
                                    "order": 3
                                },
                                {
                                    "power": 236.8,
                                    "airflow": 967.46,
                                    "percentCapacity": 52.09821949879083,
                                    "timeInterval": 18,
                                    "percentPower": 81.62702516373665,
                                    "percentSystemCapacity": 5.30175326661851,
                                    "percentSystemPower": 7.935124991622547,
                                    "order": 3
                                },
                                {
                                    "power": 237,
                                    "airflow": 969.47,
                                    "percentCapacity": 52.20644291424308,
                                    "timeInterval": 19,
                                    "percentPower": 81.69596690796277,
                                    "percentSystemCapacity": 5.312766576707003,
                                    "percentSystemPower": 7.941826955297902,
                                    "order": 3
                                },
                                {
                                    "power": 237.39999999999998,
                                    "airflow": 973.51,
                                    "percentCapacity": 52.423606143365454,
                                    "timeInterval": 20,
                                    "percentPower": 81.83385039641502,
                                    "percentSystemCapacity": 5.334866100845552,
                                    "percentSystemPower": 7.955230882648616,
                                    "order": 3
                                },
                                {
                                    "power": 236.4,
                                    "airflow": 963.46,
                                    "percentCapacity": 51.88248472163535,
                                    "timeInterval": 21,
                                    "percentPower": 81.48914167528439,
                                    "percentSystemCapacity": 5.27979910829005,
                                    "percentSystemPower": 7.921721064271832,
                                    "order": 3
                                },
                                {
                                    "power": 235.6,
                                    "airflow": 955.5,
                                    "percentCapacity": 51.45383931284695,
                                    "timeInterval": 22,
                                    "percentPower": 81.21337469837985,
                                    "percentSystemCapacity": 5.236178189607452,
                                    "percentSystemPower": 7.894913209570404,
                                    "order": 3
                                },
                                {
                                    "power": 236.8,
                                    "airflow": 967.46,
                                    "percentCapacity": 52.09821949879083,
                                    "timeInterval": 23,
                                    "percentPower": 81.62702516373665,
                                    "percentSystemCapacity": 5.30175326661851,
                                    "percentSystemPower": 7.935124991622547,
                                    "order": 3
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "xnkj5gkbf",
                            "avgPower": 228.0958333333333,
                            "avgAirflow": 887.8091666666666,
                            "avgPrecentPower": 78.62662300356196,
                            "avgPercentCapacity": 47.80876168491161,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zh8wf6z6q",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 240.5,
                                    "airflow": 1005.38,
                                    "percentCapacity": 54.13975309537386,
                                    "timeInterval": 0,
                                    "percentPower": 82.90244743192002,
                                    "percentSystemCapacity": 5.509509069383454,
                                    "percentSystemPower": 8.059111319616648,
                                    "order": 3
                                },
                                {
                                    "power": 239.80000000000004,
                                    "airflow": 998.08,
                                    "percentCapacity": 53.747017098325166,
                                    "timeInterval": 1,
                                    "percentPower": 82.66115132712858,
                                    "percentSystemCapacity": 5.4695424567947075,
                                    "percentSystemPower": 8.0356544467529,
                                    "order": 3
                                },
                                {
                                    "power": 239.80000000000004,
                                    "airflow": 998.08,
                                    "percentCapacity": 53.747017098325166,
                                    "timeInterval": 2,
                                    "percentPower": 82.66115132712858,
                                    "percentSystemCapacity": 5.4695424567947075,
                                    "percentSystemPower": 8.0356544467529,
                                    "order": 3
                                },
                                {
                                    "power": 237.7,
                                    "airflow": 976.54,
                                    "percentCapacity": 52.587108861529245,
                                    "timeInterval": 3,
                                    "percentPower": 81.93726301275422,
                                    "percentSystemCapacity": 5.351504885788021,
                                    "percentSystemPower": 7.965283828161651,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 4,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 234.2,
                                    "airflow": 941.73,
                                    "percentCapacity": 50.71262960473022,
                                    "timeInterval": 5,
                                    "percentPower": 80.73078248879696,
                                    "percentSystemCapacity": 5.160749297237178,
                                    "percentSystemPower": 7.847999463842906,
                                    "order": 3
                                },
                                {
                                    "power": 232.3,
                                    "airflow": 923.38,
                                    "percentCapacity": 49.72441942210099,
                                    "timeInterval": 6,
                                    "percentPower": 80.07583591864874,
                                    "percentSystemCapacity": 5.060184506074175,
                                    "percentSystemPower": 7.784330808927016,
                                    "order": 3
                                },
                                {
                                    "power": 230.9,
                                    "airflow": 910.1,
                                    "percentCapacity": 49.008959083462614,
                                    "timeInterval": 7,
                                    "percentPower": 79.59324370906583,
                                    "percentSystemCapacity": 4.9873759873953345,
                                    "percentSystemPower": 7.737417063199518,
                                    "order": 3
                                },
                                {
                                    "power": 230.1,
                                    "airflow": 902.59,
                                    "percentCapacity": 48.604844760665756,
                                    "timeInterval": 8,
                                    "percentPower": 79.31747673216132,
                                    "percentSystemCapacity": 4.946251464300542,
                                    "percentSystemPower": 7.71060920849809,
                                    "order": 3
                                },
                                {
                                    "power": 232.7,
                                    "airflow": 927.21,
                                    "percentCapacity": 49.93079741981514,
                                    "timeInterval": 9,
                                    "percentPower": 80.213719407101,
                                    "percentSystemCapacity": 5.081186475701267,
                                    "percentSystemPower": 7.79773473627773,
                                    "order": 3
                                },
                                {
                                    "power": 253,
                                    "airflow": 1146.12,
                                    "percentCapacity": 61.71900903391578,
                                    "timeInterval": 10,
                                    "percentPower": 87.21130644605309,
                                    "percentSystemCapacity": 6.28080884348869,
                                    "percentSystemPower": 8.477984049326453,
                                    "order": 3
                                },
                                {
                                    "power": 234.3,
                                    "airflow": 942.71,
                                    "percentCapacity": 50.76520140904777,
                                    "timeInterval": 11,
                                    "percentPower": 80.76525336091002,
                                    "percentSystemCapacity": 5.166099244662522,
                                    "percentSystemPower": 7.851350445680586,
                                    "order": 3
                                },
                                {
                                    "power": 274.9,
                                    "airflow": 1453.51,
                                    "percentCapacity": 78.27177875554571,
                                    "timeInterval": 12,
                                    "percentPower": 94.76042743881419,
                                    "percentSystemCapacity": 7.965294451394586,
                                    "percentSystemPower": 9.21184907177803,
                                    "order": 3
                                },
                                {
                                    "power": 255.6,
                                    "airflow": 1178.17,
                                    "percentCapacity": 63.44455831104607,
                                    "timeInterval": 13,
                                    "percentPower": 88.10754912099276,
                                    "percentSystemCapacity": 6.456408635664871,
                                    "percentSystemPower": 8.565109577106092,
                                    "order": 3
                                },
                                {
                                    "power": 244.8,
                                    "airflow": 1051.47,
                                    "percentCapacity": 56.62221217638903,
                                    "timeInterval": 14,
                                    "percentPower": 84.3846949327818,
                                    "percentSystemCapacity": 5.762135467533671,
                                    "percentSystemPower": 8.203203538636823,
                                    "order": 3
                                },
                                {
                                    "power": 258,
                                    "airflow": 1208.69,
                                    "percentCapacity": 65.08833556854556,
                                    "timeInterval": 15,
                                    "percentPower": 88.9348500517063,
                                    "percentSystemCapacity": 6.623686932857799,
                                    "percentSystemPower": 8.645533141210375,
                                    "order": 3
                                },
                                {
                                    "power": 235.2,
                                    "airflow": 951.54,
                                    "percentCapacity": 51.240915074072156,
                                    "timeInterval": 16,
                                    "percentPower": 81.07549120992759,
                                    "percentSystemCapacity": 5.214510044528277,
                                    "percentSystemPower": 7.8815092822196915,
                                    "order": 3
                                },
                                {
                                    "power": 236.09999999999997,
                                    "airflow": 960.46,
                                    "percentCapacity": 51.721303290950196,
                                    "timeInterval": 17,
                                    "percentPower": 81.38572905894517,
                                    "percentSystemCapacity": 5.263396548185802,
                                    "percentSystemPower": 7.911668118758795,
                                    "order": 3
                                },
                                {
                                    "power": 235.90000000000003,
                                    "airflow": 958.47,
                                    "percentCapacity": 51.61414247027303,
                                    "timeInterval": 18,
                                    "percentPower": 81.31678731471906,
                                    "percentSystemCapacity": 5.2524913726050535,
                                    "percentSystemPower": 7.904966155083441,
                                    "order": 3
                                },
                                {
                                    "power": 236.3,
                                    "airflow": 962.46,
                                    "percentCapacity": 51.82869874245269,
                                    "timeInterval": 19,
                                    "percentPower": 81.45467080317131,
                                    "percentSystemCapacity": 5.274325600873227,
                                    "percentSystemPower": 7.918370082434153,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 20,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 236.6,
                                    "airflow": 965.46,
                                    "percentCapacity": 51.990233722839974,
                                    "timeInterval": 21,
                                    "percentPower": 81.55808341951051,
                                    "percentSystemCapacity": 5.290764139813341,
                                    "percentSystemPower": 7.928423027947189,
                                    "order": 3
                                },
                                {
                                    "power": 245.3,
                                    "airflow": 1056.98,
                                    "percentCapacity": 56.91895088098984,
                                    "timeInterval": 22,
                                    "percentPower": 84.55704929334712,
                                    "percentSystemCapacity": 5.792332956269078,
                                    "percentSystemPower": 8.219958447825213,
                                    "order": 3
                                },
                                {
                                    "power": 272.2,
                                    "airflow": 1410.47,
                                    "percentCapacity": 75.95436940122183,
                                    "timeInterval": 23,
                                    "percentPower": 93.82971389176144,
                                    "percentSystemCapacity": 7.729464268855157,
                                    "percentSystemPower": 9.121372562160714,
                                    "order": 3
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "xnkj5gkbf",
                            "avgPower": 242.14166666666674,
                            "avgAirflow": 1032.5275,
                            "avgPrecentPower": 83.46834424910948,
                            "avgPercentCapacity": 55.60197294567532,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 266.9,
                                    "airflow": 1330.59,
                                    "percentCapacity": 71.65283688756729,
                                    "timeInterval": 0,
                                    "percentPower": 92.00275766976903,
                                    "percentSystemCapacity": 7.2917206324097155,
                                    "percentSystemPower": 8.943770524763755,
                                    "order": 4
                                },
                                {
                                    "power": 267.1,
                                    "airflow": 1333.5,
                                    "percentCapacity": 71.80951355352217,
                                    "timeInterval": 1,
                                    "percentPower": 92.07169941399518,
                                    "percentSystemCapacity": 7.307664767036972,
                                    "percentSystemPower": 8.950472488439114,
                                    "order": 4
                                },
                                {
                                    "power": 267.6,
                                    "airflow": 1340.81,
                                    "percentCapacity": 72.20308247338241,
                                    "timeInterval": 2,
                                    "percentPower": 92.2440537745605,
                                    "percentSystemCapacity": 7.347716141663259,
                                    "percentSystemPower": 8.967227397627505,
                                    "order": 4
                                },
                                {
                                    "power": 268.6,
                                    "airflow": 1355.58,
                                    "percentCapacity": 72.99835867669645,
                                    "timeInterval": 3,
                                    "percentPower": 92.58876249569114,
                                    "percentSystemCapacity": 7.428647088043913,
                                    "percentSystemPower": 9.00073721600429,
                                    "order": 4
                                },
                                {
                                    "power": 267.4,
                                    "airflow": 1337.88,
                                    "percentCapacity": 72.04533200341463,
                                    "timeInterval": 4,
                                    "percentPower": 92.17511203033435,
                                    "percentSystemCapacity": 7.331662731824911,
                                    "percentSystemPower": 8.960525433952148,
                                    "order": 4
                                },
                                {
                                    "power": 267,
                                    "airflow": 1332.05,
                                    "percentCapacity": 71.7311218015972,
                                    "timeInterval": 5,
                                    "percentPower": 92.0372285418821,
                                    "percentSystemCapacity": 7.299687263566747,
                                    "percentSystemPower": 8.947121506601436,
                                    "order": 4
                                },
                                {
                                    "power": 266.2,
                                    "airflow": 1320.47,
                                    "percentCapacity": 71.10781586707171,
                                    "timeInterval": 6,
                                    "percentPower": 91.76146156497758,
                                    "percentSystemCapacity": 7.236256798835607,
                                    "percentSystemPower": 8.920313651900006,
                                    "order": 4
                                },
                                {
                                    "power": 265.1,
                                    "airflow": 1304.76,
                                    "percentCapacity": 70.26173374702722,
                                    "timeInterval": 7,
                                    "percentPower": 91.38228197173387,
                                    "percentSystemCapacity": 7.150155609832834,
                                    "percentSystemPower": 8.883452851685545,
                                    "order": 4
                                },
                                {
                                    "power": 263.8,
                                    "airflow": 1286.49,
                                    "percentCapacity": 69.27783665336618,
                                    "timeInterval": 8,
                                    "percentPower": 90.93416063426403,
                                    "percentSystemCapacity": 7.050029738343981,
                                    "percentSystemPower": 8.839890087795725,
                                    "order": 4
                                },
                                {
                                    "power": 263.3,
                                    "airflow": 1279.55,
                                    "percentCapacity": 68.90394602683094,
                                    "timeInterval": 9,
                                    "percentPower": 90.76180627369872,
                                    "percentSystemCapacity": 7.011980916912816,
                                    "percentSystemPower": 8.823135178607334,
                                    "order": 4
                                },
                                {
                                    "power": 262.5,
                                    "airflow": 1268.53,
                                    "percentCapacity": 68.31086658292591,
                                    "timeInterval": 10,
                                    "percentPower": 90.4860392967942,
                                    "percentSystemCapacity": 6.951626438212045,
                                    "percentSystemPower": 8.796327323905905,
                                    "order": 4
                                },
                                {
                                    "power": 261.3,
                                    "airflow": 1252.23,
                                    "percentCapacity": 67.43292479012766,
                                    "timeInterval": 11,
                                    "percentPower": 90.07238883143744,
                                    "percentSystemCapacity": 6.862283063090041,
                                    "percentSystemPower": 8.756115541853763,
                                    "order": 4
                                },
                                {
                                    "power": 260.7,
                                    "airflow": 1244.17,
                                    "percentCapacity": 66.99911807866474,
                                    "timeInterval": 12,
                                    "percentPower": 89.86556359875904,
                                    "percentSystemCapacity": 6.818136906624312,
                                    "percentSystemPower": 8.736009650827693,
                                    "order": 4
                                },
                                {
                                    "power": 254.9,
                                    "airflow": 1169.44,
                                    "percentCapacity": 62.97445389261185,
                                    "timeInterval": 13,
                                    "percentPower": 87.8662530162013,
                                    "percentSystemCapacity": 6.408568658405316,
                                    "percentSystemPower": 8.541652704242344,
                                    "order": 4
                                },
                                {
                                    "power": 258.4,
                                    "airflow": 1213.87,
                                    "percentCapacity": 65.36722685823584,
                                    "timeInterval": 14,
                                    "percentPower": 89.07273354015855,
                                    "percentSystemCapacity": 6.652068186965364,
                                    "percentSystemPower": 8.65893706856109,
                                    "order": 4
                                },
                                {
                                    "power": 246.1,
                                    "airflow": 1065.87,
                                    "percentCapacity": 57.39735972211846,
                                    "timeInterval": 15,
                                    "percentPower": 84.83281627025163,
                                    "percentSystemCapacity": 5.841018029590858,
                                    "percentSystemPower": 8.246766302526641,
                                    "order": 4
                                },
                                {
                                    "power": 244.8,
                                    "airflow": 1051.47,
                                    "percentCapacity": 56.62221217638903,
                                    "timeInterval": 16,
                                    "percentPower": 84.3846949327818,
                                    "percentSystemCapacity": 5.762135467533671,
                                    "percentSystemPower": 8.203203538636823,
                                    "order": 4
                                },
                                {
                                    "power": 246.3,
                                    "airflow": 1068.1,
                                    "percentCapacity": 57.517666091521576,
                                    "timeInterval": 17,
                                    "percentPower": 84.90175801447776,
                                    "percentSystemCapacity": 5.853260956376347,
                                    "percentSystemPower": 8.253468266201997,
                                    "order": 4
                                },
                                {
                                    "power": 248.6,
                                    "airflow": 1094.18,
                                    "percentCapacity": 58.92186566214392,
                                    "timeInterval": 18,
                                    "percentPower": 85.69458807307824,
                                    "percentSystemCapacity": 5.996158731619972,
                                    "percentSystemPower": 8.330540848468601,
                                    "order": 4
                                },
                                {
                                    "power": 248.6,
                                    "airflow": 1094.18,
                                    "percentCapacity": 58.92186566214392,
                                    "timeInterval": 19,
                                    "percentPower": 85.69458807307824,
                                    "percentSystemCapacity": 5.996158731619972,
                                    "percentSystemPower": 8.330540848468601,
                                    "order": 4
                                },
                                {
                                    "power": 250.5,
                                    "airflow": 1116.27,
                                    "percentCapacity": 60.11137531961417,
                                    "timeInterval": 20,
                                    "percentPower": 86.34953464322646,
                                    "percentSystemCapacity": 6.117208678678404,
                                    "percentSystemPower": 8.394209503384491,
                                    "order": 4
                                },
                                {
                                    "power": 251.5,
                                    "airflow": 1128.1,
                                    "percentCapacity": 60.74852536346383,
                                    "timeInterval": 21,
                                    "percentPower": 86.69424336435712,
                                    "percentSystemCapacity": 6.182047983338027,
                                    "percentSystemPower": 8.427719321761277,
                                    "order": 4
                                },
                                {
                                    "power": 250.60000000000002,
                                    "airflow": 1117.44,
                                    "percentCapacity": 60.174741613705905,
                                    "timeInterval": 22,
                                    "percentPower": 86.38400551533954,
                                    "percentSystemCapacity": 6.123657122788901,
                                    "percentSystemPower": 8.397560485222172,
                                    "order": 4
                                },
                                {
                                    "power": 250.5,
                                    "airflow": 1116.27,
                                    "percentCapacity": 60.11137531961417,
                                    "timeInterval": 23,
                                    "percentPower": 86.34953464322646,
                                    "percentSystemCapacity": 6.117208678678404,
                                    "percentSystemPower": 8.394209503384491,
                                    "order": 4
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "il2g6xrsz",
                            "avgPower": 258.2625000000001,
                            "avgAirflow": 1217.5749999999998,
                            "avgPrecentPower": 89.0253360910031,
                            "avgPercentCapacity": 65.56679811765655,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 257,
                                    "airflow": 1195.86,
                                    "percentCapacity": 64.3973248342344,
                                    "timeInterval": 0,
                                    "percentPower": 88.59014133057566,
                                    "percentSystemCapacity": 6.553366517819666,
                                    "percentSystemPower": 8.612023322833592,
                                    "order": 4
                                },
                                {
                                    "power": 256.4,
                                    "airflow": 1188.24,
                                    "percentCapacity": 63.986925754595525,
                                    "timeInterval": 1,
                                    "percentPower": 88.38331609789726,
                                    "percentSystemCapacity": 6.511602429103676,
                                    "percentSystemPower": 8.59191743180752,
                                    "order": 4
                                },
                                {
                                    "power": 258.1,
                                    "airflow": 1209.98,
                                    "percentCapacity": 65.15792418627093,
                                    "timeInterval": 2,
                                    "percentPower": 88.96932092381937,
                                    "percentSystemCapacity": 6.630768589100455,
                                    "percentSystemPower": 8.648884123048054,
                                    "order": 4
                                },
                                {
                                    "power": 258.3,
                                    "airflow": 1212.57,
                                    "percentCapacity": 65.29736965295707,
                                    "timeInterval": 3,
                                    "percentPower": 89.0382626680455,
                                    "percentSystemCapacity": 6.644959198023963,
                                    "percentSystemPower": 8.65558608672341,
                                    "order": 4
                                },
                                {
                                    "power": 256.4,
                                    "airflow": 1188.24,
                                    "percentCapacity": 63.986925754595525,
                                    "timeInterval": 4,
                                    "percentPower": 88.38331609789726,
                                    "percentSystemCapacity": 6.511602429103676,
                                    "percentSystemPower": 8.59191743180752,
                                    "order": 4
                                },
                                {
                                    "power": 254.2,
                                    "airflow": 1160.78,
                                    "percentCapacity": 62.508458827265656,
                                    "timeInterval": 5,
                                    "percentPower": 87.62495691140984,
                                    "percentSystemCapacity": 6.361146867724261,
                                    "percentSystemPower": 8.518195831378595,
                                    "order": 4
                                },
                                {
                                    "power": 246.70000000000002,
                                    "airflow": 1072.59,
                                    "percentCapacity": 57.7591313815994,
                                    "timeInterval": 6,
                                    "percentPower": 85.03964150293002,
                                    "percentSystemCapacity": 5.877833569466796,
                                    "percentSystemPower": 8.266872193552711,
                                    "order": 4
                                },
                                {
                                    "power": 241.7,
                                    "airflow": 1018.01,
                                    "percentCapacity": 54.82028805653203,
                                    "timeInterval": 7,
                                    "percentPower": 83.31609789727679,
                                    "percentSystemCapacity": 5.578763421798552,
                                    "percentSystemPower": 8.099323101668789,
                                    "order": 4
                                },
                                {
                                    "power": 226.9,
                                    "airflow": 873.19,
                                    "percentCapacity": 47.02165345264044,
                                    "timeInterval": 8,
                                    "percentPower": 78.21440882454326,
                                    "percentSystemCapacity": 4.785138670624359,
                                    "percentSystemPower": 7.603377789692381,
                                    "order": 4
                                },
                                {
                                    "power": 228.2,
                                    "airflow": 885.02,
                                    "percentCapacity": 47.658505643248276,
                                    "timeInterval": 9,
                                    "percentPower": 78.66253016201308,
                                    "percentSystemCapacity": 4.849947664374838,
                                    "percentSystemPower": 7.6469405535822,
                                    "order": 4
                                },
                                {
                                    "power": 220.7,
                                    "airflow": 818.88,
                                    "percentCapacity": 44.097152773355845,
                                    "timeInterval": 10,
                                    "percentPower": 76.07721475353326,
                                    "percentSystemCapacity": 4.487528096236399,
                                    "percentSystemPower": 7.395616915756317,
                                    "order": 4
                                },
                                {
                                    "power": 188.8,
                                    "airflow": 584.2,
                                    "percentCapacity": 31.459363811133294,
                                    "timeInterval": 11,
                                    "percentPower": 65.0810065494657,
                                    "percentSystemCapacity": 3.2014488490395947,
                                    "percentSystemPower": 6.326653709536894,
                                    "order": 4
                                },
                                {
                                    "power": 220.4,
                                    "airflow": 816.34,
                                    "percentCapacity": 43.96017203258482,
                                    "timeInterval": 12,
                                    "percentPower": 75.97380213719407,
                                    "percentSystemCapacity": 4.473588309102916,
                                    "percentSystemPower": 7.3855639702432825,
                                    "order": 4
                                },
                                {
                                    "power": 219.3,
                                    "airflow": 807.08,
                                    "percentCapacity": 43.46133679665374,
                                    "timeInterval": 13,
                                    "percentPower": 75.59462254395036,
                                    "percentSystemCapacity": 4.422824552355655,
                                    "percentSystemPower": 7.34870317002882,
                                    "order": 4
                                },
                                {
                                    "power": 223.4,
                                    "airflow": 842.12,
                                    "percentCapacity": 45.348418229539014,
                                    "timeInterval": 14,
                                    "percentPower": 77.007928300586,
                                    "percentSystemCapacity": 4.614862596024437,
                                    "percentSystemPower": 7.486093425373635,
                                    "order": 4
                                },
                                {
                                    "power": 230.3,
                                    "airflow": 904.46,
                                    "percentCapacity": 48.70555527659653,
                                    "timeInterval": 15,
                                    "percentPower": 79.38641847638746,
                                    "percentSystemCapacity": 4.95650022734764,
                                    "percentSystemPower": 7.717311172173448,
                                    "order": 4
                                },
                                {
                                    "power": 235.3,
                                    "airflow": 952.53,
                                    "percentCapacity": 51.29405930912889,
                                    "timeInterval": 16,
                                    "percentPower": 81.10996208204068,
                                    "percentSystemCapacity": 5.219918245125623,
                                    "percentSystemPower": 7.8848602640573695,
                                    "order": 4
                                },
                                {
                                    "power": 238.6,
                                    "airflow": 985.71,
                                    "percentCapacity": 53.08089040369188,
                                    "timeInterval": 17,
                                    "percentPower": 82.2475008617718,
                                    "percentSystemCapacity": 5.401754355526952,
                                    "percentSystemPower": 7.995442664700758,
                                    "order": 4
                                },
                                {
                                    "power": 239.5,
                                    "airflow": 994.97,
                                    "percentCapacity": 53.57964570073679,
                                    "timeInterval": 18,
                                    "percentPower": 82.55773871078938,
                                    "percentSystemCapacity": 5.4525099773272805,
                                    "percentSystemPower": 8.025601501239864,
                                    "order": 4
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 19,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 4
                                },
                                {
                                    "power": 244.09999999999997,
                                    "airflow": 1043.81,
                                    "percentCapacity": 56.209670514834585,
                                    "timeInterval": 20,
                                    "percentPower": 84.14339882799034,
                                    "percentSystemCapacity": 5.720153339875483,
                                    "percentSystemPower": 8.17974666577307,
                                    "order": 4
                                },
                                {
                                    "power": 280.8,
                                    "airflow": 1553.59,
                                    "percentCapacity": 83.66120366492575,
                                    "timeInterval": 21,
                                    "percentPower": 96.794208893485,
                                    "percentSystemCapacity": 8.513746997247212,
                                    "percentSystemPower": 9.40955700020106,
                                    "order": 4
                                },
                                {
                                    "power": 272.3,
                                    "airflow": 1412.04,
                                    "percentCapacity": 76.03862615847086,
                                    "timeInterval": 22,
                                    "percentPower": 93.86418476387452,
                                    "percentSystemCapacity": 7.738038622110937,
                                    "percentSystemPower": 9.124723543998392,
                                    "order": 4
                                },
                                {
                                    "power": 281.6,
                                    "airflow": 1567.84,
                                    "percentCapacity": 84.42861319256832,
                                    "timeInterval": 23,
                                    "percentPower": 97.06997587038953,
                                    "percentSystemCapacity": 8.591842103167435,
                                    "percentSystemPower": 9.436364854902488,
                                    "order": 4
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "il2g6xrsz",
                            "avgPower": 242.47083333333342,
                            "avgAirflow": 1053.8058333333336,
                            "avgPrecentPower": 83.581810869815,
                            "avgPercentCapacity": 56.74776841592321,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 390.2,
                                    "airflow": 1189.74,
                                    "percentCapacity": 38.44070518099008,
                                    "timeInterval": 0,
                                    "percentPower": 78.44792923200643,
                                    "percentSystemCapacity": 6.5198368333606025,
                                    "percentSystemPower": 13.075531130621274,
                                    "order": 5
                                },
                                {
                                    "power": 387.4,
                                    "airflow": 1166.34,
                                    "percentCapacity": 37.684498272667845,
                                    "timeInterval": 1,
                                    "percentPower": 77.88500201045436,
                                    "percentSystemCapacity": 6.391578373186485,
                                    "percentSystemPower": 12.981703639166275,
                                    "order": 5
                                },
                                {
                                    "power": 383.9,
                                    "airflow": 1137.82,
                                    "percentCapacity": 36.763238029784695,
                                    "timeInterval": 2,
                                    "percentPower": 77.18134298351428,
                                    "percentSystemCapacity": 6.235325608405504,
                                    "percentSystemPower": 12.86441927484753,
                                    "order": 5
                                },
                                {
                                    "power": 382,
                                    "airflow": 1122.68,
                                    "percentCapacity": 36.273892442063584,
                                    "timeInterval": 3,
                                    "percentPower": 76.79935665460394,
                                    "percentSystemCapacity": 6.152328863885729,
                                    "percentSystemPower": 12.800750619931641,
                                    "order": 5
                                },
                                {
                                    "power": 380.3,
                                    "airflow": 1109.32,
                                    "percentCapacity": 35.84228161298175,
                                    "timeInterval": 4,
                                    "percentPower": 76.45757941294733,
                                    "percentSystemCapacity": 6.0791243748453825,
                                    "percentSystemPower": 12.743783928691107,
                                    "order": 5
                                },
                                {
                                    "power": 378.9,
                                    "airflow": 1098.45,
                                    "percentCapacity": 35.49115640525682,
                                    "timeInterval": 5,
                                    "percentPower": 76.17611580217128,
                                    "percentSystemCapacity": 6.019570861150255,
                                    "percentSystemPower": 12.696870182963607,
                                    "order": 5
                                },
                                {
                                    "power": 371.1,
                                    "airflow": 1040.01,
                                    "percentCapacity": 33.603050016740625,
                                    "timeInterval": 6,
                                    "percentPower": 74.60796139927625,
                                    "percentSystemCapacity": 5.699333614742011,
                                    "percentSystemPower": 12.435493599624692,
                                    "order": 5
                                },
                                {
                                    "power": 364,
                                    "airflow": 989.73,
                                    "percentCapacity": 31.978243278121287,
                                    "timeInterval": 7,
                                    "percentPower": 73.1805388017692,
                                    "percentSystemCapacity": 5.423753997467415,
                                    "percentSystemPower": 12.19757388914952,
                                    "order": 5
                                },
                                {
                                    "power": 381.2,
                                    "airflow": 1116.37,
                                    "percentCapacity": 36.070057762774965,
                                    "timeInterval": 8,
                                    "percentPower": 76.63852030558907,
                                    "percentSystemCapacity": 6.117756947379906,
                                    "percentSystemPower": 12.773942765230212,
                                    "order": 5
                                },
                                {
                                    "power": 386,
                                    "airflow": 1154.83,
                                    "percentCapacity": 37.31285401753128,
                                    "timeInterval": 9,
                                    "percentPower": 77.60353839967833,
                                    "percentSystemCapacity": 6.328544672526267,
                                    "percentSystemPower": 12.934789893438777,
                                    "order": 5
                                },
                                {
                                    "power": 389.6,
                                    "airflow": 1184.68,
                                    "percentCapacity": 38.27718731392365,
                                    "timeInterval": 10,
                                    "percentPower": 78.32730197024529,
                                    "percentSystemCapacity": 6.492102955753709,
                                    "percentSystemPower": 13.055425239595204,
                                    "order": 5
                                },
                                {
                                    "power": 380.7,
                                    "airflow": 1112.45,
                                    "percentCapacity": 35.94331556595818,
                                    "timeInterval": 11,
                                    "percentPower": 76.53799758745477,
                                    "percentSystemCapacity": 6.096260503980742,
                                    "percentSystemPower": 12.75718785604182,
                                    "order": 5
                                },
                                {
                                    "power": 386.1,
                                    "airflow": 1155.65,
                                    "percentCapacity": 37.33925982807915,
                                    "timeInterval": 12,
                                    "percentPower": 77.6236429433052,
                                    "percentSystemCapacity": 6.333023299424869,
                                    "percentSystemPower": 12.938140875276458,
                                    "order": 5
                                },
                                {
                                    "power": 395.8,
                                    "airflow": 1238.22,
                                    "percentCapacity": 40.00713377964704,
                                    "timeInterval": 13,
                                    "percentPower": 79.57378367511058,
                                    "percentSystemCapacity": 6.785515072775515,
                                    "percentSystemPower": 13.263186113531267,
                                    "order": 5
                                },
                                {
                                    "power": 398.6,
                                    "airflow": 1263.34,
                                    "percentCapacity": 40.8187658805955,
                                    "timeInterval": 14,
                                    "percentPower": 80.13671089666265,
                                    "percentSystemCapacity": 6.923174068415337,
                                    "percentSystemPower": 13.357013604986262,
                                    "order": 5
                                },
                                {
                                    "power": 406.7,
                                    "airflow": 1339.57,
                                    "percentCapacity": 43.28182799815914,
                                    "timeInterval": 15,
                                    "percentPower": 81.76517893043828,
                                    "percentSystemCapacity": 7.340928192366427,
                                    "percentSystemPower": 13.628443133838214,
                                    "order": 5
                                },
                                {
                                    "power": 400.1,
                                    "airflow": 1277.05,
                                    "percentCapacity": 41.26172226860882,
                                    "timeInterval": 16,
                                    "percentPower": 80.43827905106555,
                                    "percentSystemCapacity": 6.998302850797035,
                                    "percentSystemPower": 13.407278332551439,
                                    "order": 5
                                },
                                {
                                    "power": 393.4,
                                    "airflow": 1217.16,
                                    "percentCapacity": 39.32674712720683,
                                    "timeInterval": 17,
                                    "percentPower": 79.09127462806595,
                                    "percentSystemCapacity": 6.670116306373583,
                                    "percentSystemPower": 13.182762549426982,
                                    "order": 5
                                },
                                {
                                    "power": 393.4,
                                    "airflow": 1217.16,
                                    "percentCapacity": 39.32674712720683,
                                    "timeInterval": 18,
                                    "percentPower": 79.09127462806595,
                                    "percentSystemCapacity": 6.670116306373583,
                                    "percentSystemPower": 13.182762549426982,
                                    "order": 5
                                },
                                {
                                    "power": 388.9,
                                    "airflow": 1178.81,
                                    "percentCapacity": 38.087439145957624,
                                    "timeInterval": 19,
                                    "percentPower": 78.18657016485726,
                                    "percentSystemCapacity": 6.459920219023392,
                                    "percentSystemPower": 13.031968366731453,
                                    "order": 5
                                },
                                {
                                    "power": 384.1,
                                    "airflow": 1139.43,
                                    "percentCapacity": 36.81518243913984,
                                    "timeInterval": 20,
                                    "percentPower": 77.22155207076801,
                                    "percentSystemCapacity": 6.244135776476205,
                                    "percentSystemPower": 12.871121238522889,
                                    "order": 5
                                },
                                {
                                    "power": 384.7,
                                    "airflow": 1144.27,
                                    "percentCapacity": 36.971517990591664,
                                    "timeInterval": 21,
                                    "percentPower": 77.34217933252914,
                                    "percentSystemCapacity": 6.270651478566483,
                                    "percentSystemPower": 12.891227129548957,
                                    "order": 5
                                },
                                {
                                    "power": 379.9,
                                    "airflow": 1106.2,
                                    "percentCapacity": 35.741565683899566,
                                    "timeInterval": 22,
                                    "percentPower": 76.37716123843988,
                                    "percentSystemCapacity": 6.062042184988446,
                                    "percentSystemPower": 12.730380001340395,
                                    "order": 5
                                },
                                {
                                    "power": 375.6,
                                    "airflow": 1073.3,
                                    "percentCapacity": 34.67851867513079,
                                    "timeInterval": 23,
                                    "percentPower": 75.51266586248492,
                                    "percentSystemCapacity": 5.881741303130742,
                                    "percentSystemPower": 12.586287782320221,
                                    "order": 5
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ndidf48pq",
                            "avgPower": 385.94166666666666,
                            "avgAirflow": 1157.1908333333333,
                            "avgPrecentPower": 77.59181074922934,
                            "avgPercentCapacity": 37.389037826792396,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 319.4,
                                    "airflow": 724.44,
                                    "percentCapacity": 23.406891228915903,
                                    "timeInterval": 0,
                                    "percentPower": 64.21391234418978,
                                    "percentSystemCapacity": 3.969987305649645,
                                    "percentSystemPower": 10.703035989544937,
                                    "order": 5
                                },
                                {
                                    "power": 334.4,
                                    "airflow": 805.16,
                                    "percentCapacity": 26.014905544381527,
                                    "timeInterval": 1,
                                    "percentPower": 67.22959388821873,
                                    "percentSystemCapacity": 4.412326428094083,
                                    "percentSystemPower": 11.205683265196702,
                                    "order": 5
                                },
                                {
                                    "power": 332,
                                    "airflow": 791.73,
                                    "percentCapacity": 25.58092290569234,
                                    "timeInterval": 2,
                                    "percentPower": 66.74708484117411,
                                    "percentSystemCapacity": 4.33871966205161,
                                    "percentSystemPower": 11.12525970109242,
                                    "order": 5
                                },
                                {
                                    "power": 334.8,
                                    "airflow": 807.42,
                                    "percentCapacity": 26.08788612948154,
                                    "timeInterval": 3,
                                    "percentPower": 67.31001206272617,
                                    "percentSystemCapacity": 4.42470449203997,
                                    "percentSystemPower": 11.219087192547418,
                                    "order": 5
                                },
                                {
                                    "power": 338.6,
                                    "airflow": 829.17,
                                    "percentCapacity": 26.790674358462653,
                                    "timeInterval": 4,
                                    "percentPower": 68.07398472054686,
                                    "percentSystemCapacity": 4.543902736707689,
                                    "percentSystemPower": 11.346424502379199,
                                    "order": 5
                                },
                                {
                                    "power": 338,
                                    "airflow": 825.7,
                                    "percentCapacity": 26.67855423542711,
                                    "timeInterval": 5,
                                    "percentPower": 67.95335745878569,
                                    "percentSystemCapacity": 4.5248863085624125,
                                    "percentSystemPower": 11.326318611353127,
                                    "order": 5
                                },
                                {
                                    "power": 346,
                                    "airflow": 873.11,
                                    "percentCapacity": 28.210465832325337,
                                    "timeInterval": 6,
                                    "percentPower": 69.56172094893446,
                                    "percentSystemCapacity": 4.784710201175303,
                                    "percentSystemPower": 11.594397158367402,
                                    "order": 5
                                },
                                {
                                    "power": 344,
                                    "airflow": 861.02,
                                    "percentCapacity": 27.819849648330287,
                                    "timeInterval": 7,
                                    "percentPower": 69.15963007639728,
                                    "percentSystemCapacity": 4.718458716658387,
                                    "percentSystemPower": 11.527377521613834,
                                    "order": 5
                                },
                                {
                                    "power": 372.1,
                                    "airflow": 1047.31,
                                    "percentCapacity": 33.838877809286096,
                                    "timeInterval": 8,
                                    "percentPower": 74.80900683554485,
                                    "percentSystemCapacity": 5.739331807307127,
                                    "percentSystemPower": 12.469003418001476,
                                    "order": 5
                                },
                                {
                                    "power": 373.5,
                                    "airflow": 1057.62,
                                    "percentCapacity": 34.17204847717541,
                                    "timeInterval": 9,
                                    "percentPower": 75.09047044632086,
                                    "percentSystemCapacity": 5.795840094084716,
                                    "percentSystemPower": 12.515917163728973,
                                    "order": 5
                                },
                                {
                                    "power": 410.2,
                                    "airflow": 1374.26,
                                    "percentCapacity": 44.40273409297366,
                                    "timeInterval": 10,
                                    "percentPower": 82.46883795737837,
                                    "percentSystemCapacity": 7.53104241658009,
                                    "percentSystemPower": 13.74572749815696,
                                    "order": 5
                                },
                                {
                                    "power": 426.1,
                                    "airflow": 1547.05,
                                    "percentCapacity": 49.98534782780091,
                                    "timeInterval": 11,
                                    "percentPower": 85.66546039404906,
                                    "percentSystemCapacity": 8.477896291486399,
                                    "percentSystemPower": 14.278533610347832,
                                    "order": 5
                                },
                                {
                                    "power": 421.8,
                                    "airflow": 1497.68,
                                    "percentCapacity": 48.390408181052976,
                                    "timeInterval": 12,
                                    "percentPower": 84.8009650180941,
                                    "percentSystemCapacity": 8.207382360826337,
                                    "percentSystemPower": 14.134441391327659,
                                    "order": 5
                                },
                                {
                                    "power": 423.8,
                                    "airflow": 1520.38,
                                    "percentCapacity": 49.1238661032269,
                                    "timeInterval": 13,
                                    "percentPower": 85.20305589063129,
                                    "percentSystemCapacity": 8.331782419415127,
                                    "percentSystemPower": 14.20146102808123,
                                    "order": 5
                                },
                                {
                                    "power": 413.6,
                                    "airflow": 1409.05,
                                    "percentCapacity": 45.52670959859761,
                                    "timeInterval": 14,
                                    "percentPower": 83.1523924406916,
                                    "percentSystemCapacity": 7.721677236281215,
                                    "percentSystemPower": 13.859660880638028,
                                    "order": 5
                                },
                                {
                                    "power": 406.6,
                                    "airflow": 1338.6,
                                    "percentCapacity": 43.25032308254393,
                                    "timeInterval": 15,
                                    "percentPower": 81.74507438681142,
                                    "percentSystemCapacity": 7.3355847183512415,
                                    "percentSystemPower": 13.625092152000537,
                                    "order": 5
                                },
                                {
                                    "power": 385,
                                    "airflow": 1146.7,
                                    "percentCapacity": 37.04996969877627,
                                    "timeInterval": 16,
                                    "percentPower": 77.40249296340973,
                                    "percentSystemCapacity": 6.283957486722522,
                                    "percentSystemPower": 12.901280075061994,
                                    "order": 5
                                },
                                {
                                    "power": 378.3,
                                    "airflow": 1093.83,
                                    "percentCapacity": 35.341849344906784,
                                    "timeInterval": 17,
                                    "percentPower": 76.05548854041014,
                                    "percentSystemCapacity": 5.994247244765809,
                                    "percentSystemPower": 12.67676429193754,
                                    "order": 5
                                },
                                {
                                    "power": 392.4,
                                    "airflow": 1208.51,
                                    "percentCapacity": 39.04730367627715,
                                    "timeInterval": 18,
                                    "percentPower": 78.89022919179735,
                                    "percentSystemCapacity": 6.622720565436091,
                                    "percentSystemPower": 13.149252731050199,
                                    "order": 5
                                },
                                {
                                    "power": 413,
                                    "airflow": 1402.83,
                                    "percentCapacity": 45.325772064026594,
                                    "timeInterval": 19,
                                    "percentPower": 83.03176517893044,
                                    "percentSystemCapacity": 7.6875966976195915,
                                    "percentSystemPower": 13.839554989611958,
                                    "order": 5
                                },
                                {
                                    "power": 410,
                                    "airflow": 1372.25,
                                    "percentCapacity": 44.33771177345247,
                                    "timeInterval": 20,
                                    "percentPower": 82.42862887012465,
                                    "percentSystemCapacity": 7.520014135183876,
                                    "percentSystemPower": 13.739025534481602,
                                    "order": 5
                                },
                                {
                                    "power": 397.4,
                                    "airflow": 1252.5,
                                    "percentCapacity": 40.46852659520401,
                                    "timeInterval": 21,
                                    "percentPower": 79.89545637314033,
                                    "percentSystemCapacity": 6.863770813905985,
                                    "percentSystemPower": 13.316801822934119,
                                    "order": 5
                                },
                                {
                                    "power": 406.8,
                                    "airflow": 1340.55,
                                    "percentCapacity": 43.31336139517226,
                                    "timeInterval": 22,
                                    "percentPower": 81.78528347406514,
                                    "percentSystemCapacity": 7.346276497043958,
                                    "percentSystemPower": 13.631794115675893,
                                    "order": 5
                                },
                                {
                                    "power": 385.8,
                                    "airflow": 1153.2,
                                    "percentCapacity": 37.26010664844939,
                                    "timeInterval": 23,
                                    "percentPower": 77.56332931242461,
                                    "percentSystemCapacity": 6.319598316360743,
                                    "percentSystemPower": 12.928087929763421,
                                    "order": 5
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ndidf48pq",
                            "avgPower": 379.3166666666666,
                            "avgAirflow": 1136.669583333333,
                            "avgPrecentPower": 76.25988473394987,
                            "avgPercentCapacity": 36.72604442716413,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 383.6,
                                    "airflow": 1654.02,
                                    "percentCapacity": 71.44796741410823,
                                    "timeInterval": 0,
                                    "percentPower": 92.54523522316043,
                                    "percentSystemCapacity": 9.064119057631553,
                                    "percentSystemPower": 12.854366329334496,
                                    "order": 1
                                },
                                {
                                    "power": 386.8,
                                    "airflow": 1700.5,
                                    "percentCapacity": 73.45592026743235,
                                    "timeInterval": 1,
                                    "percentPower": 93.31724969843185,
                                    "percentSystemCapacity": 9.318854417969415,
                                    "percentSystemPower": 12.961597748140205,
                                    "order": 1
                                },
                                {
                                    "power": 391.3,
                                    "airflow": 1768.86,
                                    "percentCapacity": 76.40880668240486,
                                    "timeInterval": 2,
                                    "percentPower": 94.40289505428227,
                                    "percentSystemCapacity": 9.693467090627315,
                                    "percentSystemPower": 13.112391930835738,
                                    "order": 1
                                },
                                {
                                    "power": 391.6,
                                    "airflow": 1773.55,
                                    "percentCapacity": 76.6112739093221,
                                    "timeInterval": 3,
                                    "percentPower": 94.47527141133897,
                                    "percentSystemCapacity": 9.719152734550672,
                                    "percentSystemPower": 13.122444876348771,
                                    "order": 1
                                },
                                {
                                    "power": 389,
                                    "airflow": 1733.47,
                                    "percentCapacity": 74.88012588232786,
                                    "timeInterval": 4,
                                    "percentPower": 93.84800965018094,
                                    "percentSystemCapacity": 9.49953372520764,
                                    "percentSystemPower": 13.035319348569132,
                                    "order": 1
                                },
                                {
                                    "power": 388.4,
                                    "airflow": 1724.4,
                                    "percentCapacity": 74.48807846412339,
                                    "timeInterval": 5,
                                    "percentPower": 93.70325693606755,
                                    "percentSystemCapacity": 9.449797328169973,
                                    "percentSystemPower": 13.015213457543059,
                                    "order": 1
                                },
                                {
                                    "power": 392.5,
                                    "airflow": 1787.71,
                                    "percentCapacity": 77.22301393211018,
                                    "timeInterval": 6,
                                    "percentPower": 94.69240048250904,
                                    "percentSystemCapacity": 9.796760042351767,
                                    "percentSystemPower": 13.152603712887878,
                                    "order": 1
                                },
                                {
                                    "power": 388.5,
                                    "airflow": 1725.91,
                                    "percentCapacity": 74.5532290011993,
                                    "timeInterval": 7,
                                    "percentPower": 93.72738238841978,
                                    "percentSystemCapacity": 9.45806253495048,
                                    "percentSystemPower": 13.01856443938074,
                                    "order": 1
                                },
                                {
                                    "power": 393.6,
                                    "airflow": 1805.23,
                                    "percentCapacity": 77.97964526961624,
                                    "timeInterval": 8,
                                    "percentPower": 94.9577804583836,
                                    "percentSystemCapacity": 9.892748728581852,
                                    "percentSystemPower": 13.189464513102342,
                                    "order": 1
                                },
                                {
                                    "power": 390,
                                    "airflow": 1748.74,
                                    "percentCapacity": 75.53969086793906,
                                    "timeInterval": 9,
                                    "percentPower": 94.08926417370326,
                                    "percentSystemCapacity": 9.583208261687798,
                                    "percentSystemPower": 13.068829166945918,
                                    "order": 1
                                },
                                {
                                    "power": 390.3,
                                    "airflow": 1753.36,
                                    "percentCapacity": 75.73907569285635,
                                    "timeInterval": 10,
                                    "percentPower": 94.16164053075995,
                                    "percentSystemCapacity": 9.60850286217462,
                                    "percentSystemPower": 13.07888211245895,
                                    "order": 1
                                },
                                {
                                    "power": 384,
                                    "airflow": 1659.74,
                                    "percentCapacity": 71.69494943416738,
                                    "timeInterval": 11,
                                    "percentPower": 92.64173703256937,
                                    "percentSystemCapacity": 9.095451991456462,
                                    "percentSystemPower": 12.86777025668521,
                                    "order": 1
                                },
                                {
                                    "power": 376.3,
                                    "airflow": 1554.08,
                                    "percentCapacity": 67.13076878526056,
                                    "timeInterval": 12,
                                    "percentPower": 90.78407720144753,
                                    "percentSystemCapacity": 8.51642534731906,
                                    "percentSystemPower": 12.609744655183968,
                                    "order": 1
                                },
                                {
                                    "power": 371.6,
                                    "airflow": 1493.86,
                                    "percentCapacity": 64.52969591255764,
                                    "timeInterval": 13,
                                    "percentPower": 89.65018094089264,
                                    "percentSystemCapacity": 8.186444872729666,
                                    "percentSystemPower": 12.452248508813083,
                                    "order": 1
                                },
                                {
                                    "power": 368.9,
                                    "airflow": 1460.62,
                                    "percentCapacity": 63.09382516511306,
                                    "timeInterval": 14,
                                    "percentPower": 88.99879372738239,
                                    "percentSystemCapacity": 8.00428568923919,
                                    "percentSystemPower": 12.361771999195764,
                                    "order": 1
                                },
                                {
                                    "power": 368.5,
                                    "airflow": 1455.78,
                                    "percentCapacity": 62.88457563859016,
                                    "timeInterval": 15,
                                    "percentPower": 88.90229191797346,
                                    "percentSystemCapacity": 7.9777396209631855,
                                    "percentSystemPower": 12.348368071845051,
                                    "order": 1
                                },
                                {
                                    "power": 365.3,
                                    "airflow": 1417.75,
                                    "percentCapacity": 61.24176390328033,
                                    "timeInterval": 16,
                                    "percentPower": 88.13027744270205,
                                    "percentSystemCapacity": 7.769327237839432,
                                    "percentSystemPower": 12.24113665303934,
                                    "order": 1
                                },
                                {
                                    "power": 366.2,
                                    "airflow": 1428.32,
                                    "percentCapacity": 61.69828183217723,
                                    "timeInterval": 17,
                                    "percentPower": 88.34740651387213,
                                    "percentSystemCapacity": 7.827242571322351,
                                    "percentSystemPower": 12.271295489578447,
                                    "order": 1
                                },
                                {
                                    "power": 365.3,
                                    "airflow": 1417.75,
                                    "percentCapacity": 61.24176390328033,
                                    "timeInterval": 18,
                                    "percentPower": 88.13027744270205,
                                    "percentSystemCapacity": 7.769327237839432,
                                    "percentSystemPower": 12.24113665303934,
                                    "order": 1
                                },
                                {
                                    "power": 363.7,
                                    "airflow": 1399.2,
                                    "percentCapacity": 60.44057823180928,
                                    "timeInterval": 19,
                                    "percentPower": 87.74427020506634,
                                    "percentSystemCapacity": 7.667686245431746,
                                    "percentSystemPower": 12.187520943636486,
                                    "order": 1
                                },
                                {
                                    "power": 368.3,
                                    "airflow": 1453.36,
                                    "percentCapacity": 62.78028095356581,
                                    "timeInterval": 20,
                                    "percentPower": 88.854041013269,
                                    "percentSystemCapacity": 7.964508461612496,
                                    "percentSystemPower": 12.341666108169695,
                                    "order": 1
                                },
                                {
                                    "power": 373.7,
                                    "airflow": 1520.39,
                                    "percentCapacity": 65.67551253512214,
                                    "timeInterval": 21,
                                    "percentPower": 90.1568154402895,
                                    "percentSystemCapacity": 8.331806856576488,
                                    "percentSystemPower": 12.52261912740433,
                                    "order": 1
                                },
                                {
                                    "power": 368.6,
                                    "airflow": 1456.99,
                                    "percentCapacity": 62.93680536772497,
                                    "timeInterval": 22,
                                    "percentPower": 88.9264173703257,
                                    "percentSystemCapacity": 7.984365652470589,
                                    "percentSystemPower": 12.35171905368273,
                                    "order": 1
                                },
                                {
                                    "power": 372.5,
                                    "airflow": 1505.16,
                                    "percentCapacity": 65.01758933162742,
                                    "timeInterval": 23,
                                    "percentPower": 89.86731001206273,
                                    "percentSystemCapacity": 8.248340601858697,
                                    "percentSystemPower": 12.48240734535219,
                                    "order": 1
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "h5eh597rg",
                            "avgPower": 379.10416666666674,
                            "avgAirflow": 1599.9479166666667,
                            "avgPrecentPower": 91.46059509449134,
                            "avgPercentCapacity": 69.11221743240483,
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 394.2,
                                    "airflow": 1814.88,
                                    "percentCapacity": 78.39656163823054,
                                    "timeInterval": 0,
                                    "percentPower": 95.10253317249699,
                                    "percentSystemCapacity": 9.945640080693979,
                                    "percentSystemPower": 13.20957040412841,
                                    "order": 1
                                },
                                {
                                    "power": 381.2,
                                    "airflow": 1620.26,
                                    "percentCapacity": 69.9894233766404,
                                    "timeInterval": 1,
                                    "percentPower": 91.96622436670687,
                                    "percentSystemCapacity": 8.879083467608645,
                                    "percentSystemPower": 12.773942765230212,
                                    "order": 1
                                },
                                {
                                    "power": 380.8,
                                    "airflow": 1614.72,
                                    "percentCapacity": 69.75015677448182,
                                    "timeInterval": 2,
                                    "percentPower": 91.86972255729795,
                                    "percentSystemCapacity": 8.848729336525944,
                                    "percentSystemPower": 12.760538837879501,
                                    "order": 1
                                },
                                {
                                    "power": 373.2,
                                    "airflow": 1514.02,
                                    "percentCapacity": 65.4003413718952,
                                    "timeInterval": 3,
                                    "percentPower": 90.03618817852835,
                                    "percentSystemCapacity": 8.296897757339837,
                                    "percentSystemPower": 12.505864218215937,
                                    "order": 1
                                },
                                {
                                    "power": 379.3,
                                    "airflow": 1594.16,
                                    "percentCapacity": 68.86241238288946,
                                    "timeInterval": 4,
                                    "percentPower": 91.50784077201448,
                                    "percentSystemCapacity": 8.736107226347496,
                                    "percentSystemPower": 12.710274110314323,
                                    "order": 1
                                },
                                {
                                    "power": 385.7,
                                    "airflow": 1684.33,
                                    "percentCapacity": 72.7573345197575,
                                    "timeInterval": 5,
                                    "percentPower": 93.05186972255729,
                                    "percentSystemCapacity": 9.230229582049464,
                                    "percentSystemPower": 12.924736947925744,
                                    "order": 1
                                },
                                {
                                    "power": 400.6,
                                    "airflow": 1922.3,
                                    "percentCapacity": 83.03691285427365,
                                    "timeInterval": 6,
                                    "percentPower": 96.64656212303981,
                                    "percentSystemCapacity": 10.534329968086558,
                                    "percentSystemPower": 13.42403324173983,
                                    "order": 1
                                },
                                {
                                    "power": 390,
                                    "airflow": 1748.74,
                                    "percentCapacity": 75.53969086793906,
                                    "timeInterval": 7,
                                    "percentPower": 94.08926417370326,
                                    "percentSystemCapacity": 9.583208261687798,
                                    "percentSystemPower": 13.068829166945918,
                                    "order": 1
                                },
                                {
                                    "power": 401.2,
                                    "airflow": 1932.81,
                                    "percentCapacity": 83.49082766199842,
                                    "timeInterval": 8,
                                    "percentPower": 96.7913148371532,
                                    "percentSystemCapacity": 10.591915061241032,
                                    "percentSystemPower": 13.444139132765901,
                                    "order": 1
                                },
                                {
                                    "power": 402.2,
                                    "airflow": 1950.5,
                                    "percentCapacity": 84.25486286359086,
                                    "timeInterval": 9,
                                    "percentPower": 97.03256936067551,
                                    "percentSystemCapacity": 10.688843025493908,
                                    "percentSystemPower": 13.477648951142685,
                                    "order": 1
                                },
                                {
                                    "power": 412.9,
                                    "airflow": 2154.31,
                                    "percentCapacity": 93.05875396229393,
                                    "timeInterval": 10,
                                    "percentPower": 99.61399276236429,
                                    "percentSystemCapacity": 11.805732980201142,
                                    "percentSystemPower": 13.836204007774278,
                                    "order": 1
                                },
                                {
                                    "power": 408.6,
                                    "airflow": 2069.08,
                                    "percentCapacity": 89.37693520704872,
                                    "timeInterval": 11,
                                    "percentPower": 98.57659831121835,
                                    "percentSystemCapacity": 11.338645605234426,
                                    "percentSystemPower": 13.692111788754108,
                                    "order": 1
                                },
                                {
                                    "power": 397.1,
                                    "airflow": 1862.52,
                                    "percentCapacity": 80.45460111148302,
                                    "timeInterval": 12,
                                    "percentPower": 95.8021712907117,
                                    "percentSystemCapacity": 10.20672959080903,
                                    "percentSystemPower": 13.306748877421084,
                                    "order": 1
                                },
                                {
                                    "power": 390.8,
                                    "airflow": 1761.09,
                                    "percentCapacity": 76.07295325228085,
                                    "timeInterval": 13,
                                    "percentPower": 94.28226779252111,
                                    "percentSystemCapacity": 9.650859643743432,
                                    "percentSystemPower": 13.095637021647343,
                                    "order": 1
                                },
                                {
                                    "power": 386.6,
                                    "airflow": 1697.55,
                                    "percentCapacity": 73.32824316849234,
                                    "timeInterval": 14,
                                    "percentPower": 93.26899879372739,
                                    "percentSystemCapacity": 9.302656890347421,
                                    "percentSystemPower": 12.954895784464851,
                                    "order": 1
                                },
                                {
                                    "power": 383.2,
                                    "airflow": 1648.33,
                                    "percentCapacity": 71.20210934274196,
                                    "timeInterval": 15,
                                    "percentPower": 92.44873341375151,
                                    "percentSystemCapacity": 9.032928711554561,
                                    "percentSystemPower": 12.840962401983782,
                                    "order": 1
                                },
                                {
                                    "power": 382.1,
                                    "airflow": 1632.81,
                                    "percentCapacity": 70.53173533924513,
                                    "timeInterval": 16,
                                    "percentPower": 92.18335343787697,
                                    "percentSystemCapacity": 8.947882908283235,
                                    "percentSystemPower": 12.804101601769318,
                                    "order": 1
                                },
                                {
                                    "power": 381.8,
                                    "airflow": 1628.61,
                                    "percentCapacity": 70.3503518035987,
                                    "timeInterval": 17,
                                    "percentPower": 92.11097708082026,
                                    "percentSystemCapacity": 8.924872009279428,
                                    "percentSystemPower": 12.794048656256285,
                                    "order": 1
                                },
                                {
                                    "power": 385.5,
                                    "airflow": 1681.41,
                                    "percentCapacity": 72.63126872614451,
                                    "timeInterval": 18,
                                    "percentPower": 93.00361881785284,
                                    "percentSystemCapacity": 9.214236469806256,
                                    "percentSystemPower": 12.918034984250387,
                                    "order": 1
                                },
                                {
                                    "power": 387.1,
                                    "airflow": 1704.95,
                                    "percentCapacity": 73.64799139733798,
                                    "timeInterval": 19,
                                    "percentPower": 93.38962605548855,
                                    "percentSystemCapacity": 9.343221179572414,
                                    "percentSystemPower": 12.971650693653242,
                                    "order": 1
                                },
                                {
                                    "power": 386.7,
                                    "airflow": 1699.03,
                                    "percentCapacity": 73.39204476666117,
                                    "timeInterval": 20,
                                    "percentPower": 93.2931242460796,
                                    "percentSystemCapacity": 9.310750966397446,
                                    "percentSystemPower": 12.958246766302528,
                                    "order": 1
                                },
                                {
                                    "power": 404.7,
                                    "airflow": 1995.69,
                                    "percentCapacity": 86.206950635842,
                                    "timeInterval": 21,
                                    "percentPower": 97.6357056694813,
                                    "percentSystemCapacity": 10.936491161879342,
                                    "percentSystemPower": 13.561423497084647,
                                    "order": 1
                                },
                                {
                                    "power": 411.2,
                                    "airflow": 2120.05,
                                    "percentCapacity": 91.57891874317805,
                                    "timeInterval": 22,
                                    "percentPower": 99.20386007237636,
                                    "percentSystemCapacity": 11.617996322361748,
                                    "percentSystemPower": 13.779237316533747,
                                    "order": 1
                                },
                                {
                                    "power": 417.1000000000001,
                                    "airflow": 2242.24,
                                    "percentCapacity": 96.85702859033256,
                                    "timeInterval": 23,
                                    "percentPower": 100.62726176115804,
                                    "percentSystemCapacity": 12.28759432193226,
                                    "percentSystemPower": 13.976945244956775,
                                    "order": 1
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "h5eh597rg",
                            "avgPower": 392.6583333333335,
                            "avgAirflow": 1803.9329166666666,
                            "avgPrecentPower": 94.73059911540008,
                            "avgPercentCapacity": 77.92368376493242,
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 153.7,
                                    "airflow": 387.25,
                                    "percentCapacity": 20.853790620777545,
                                    "timeInterval": 0,
                                    "percentPower": 52.98173043778007,
                                    "percentSystemCapacity": 2.122177180117487,
                                    "percentSystemPower": 5.150459084511762,
                                    "order": 6
                                },
                                {
                                    "power": 154.2,
                                    "airflow": 389.74,
                                    "percentCapacity": 20.98747236379449,
                                    "timeInterval": 1,
                                    "percentPower": 53.154084798345394,
                                    "percentSystemCapacity": 2.1357812461402,
                                    "percentSystemPower": 5.1672139937001536,
                                    "order": 6
                                },
                                {
                                    "power": 155.5,
                                    "airflow": 396.23,
                                    "percentCapacity": 21.33700197532327,
                                    "timeInterval": 2,
                                    "percentPower": 53.60220613581524,
                                    "percentSystemCapacity": 2.171350979185407,
                                    "percentSystemPower": 5.210776757589974,
                                    "order": 6
                                },
                                {
                                    "power": 163.5,
                                    "airflow": 437.39,
                                    "percentCapacity": 23.553749540544448,
                                    "timeInterval": 3,
                                    "percentPower": 56.35987590486039,
                                    "percentSystemCapacity": 2.3969373573427797,
                                    "percentSystemPower": 5.47885530460425,
                                    "order": 6
                                },
                                {
                                    "power": 158.2,
                                    "airflow": 409.88,
                                    "percentCapacity": 22.072217399945817,
                                    "timeInterval": 4,
                                    "percentPower": 54.53291968286796,
                                    "percentSystemCapacity": 2.2461698658318383,
                                    "percentSystemPower": 5.301253267207292,
                                    "order": 6
                                },
                                {
                                    "power": 162.80000000000004,
                                    "airflow": 433.7,
                                    "percentCapacity": 23.355047608622094,
                                    "timeInterval": 5,
                                    "percentPower": 56.11857980006894,
                                    "percentSystemCapacity": 2.376716539303553,
                                    "percentSystemPower": 5.455398431740502,
                                    "order": 6
                                },
                                {
                                    "power": 168,
                                    "airflow": 461.54,
                                    "percentCapacity": 24.85428106126598,
                                    "timeInterval": 6,
                                    "percentPower": 57.91106514994829,
                                    "percentSystemCapacity": 2.529285397346061,
                                    "percentSystemPower": 5.62964948729978,
                                    "order": 6
                                },
                                {
                                    "power": 155.20000000000002,
                                    "airflow": 394.73,
                                    "percentCapacity": 21.256088204081923,
                                    "timeInterval": 7,
                                    "percentPower": 53.49879351947604,
                                    "percentSystemCapacity": 2.1631168234864164,
                                    "percentSystemPower": 5.200723812076939,
                                    "order": 6
                                },
                                {
                                    "power": 157.3,
                                    "airflow": 405.3,
                                    "percentCapacity": 21.825730648442224,
                                    "timeInterval": 8,
                                    "percentPower": 54.222681833850395,
                                    "percentSystemCapacity": 2.2210862458437752,
                                    "percentSystemPower": 5.271094430668186,
                                    "order": 6
                                },
                                {
                                    "power": 156.1,
                                    "airflow": 399.24,
                                    "percentCapacity": 21.499290075074132,
                                    "timeInterval": 9,
                                    "percentPower": 53.80903136849362,
                                    "percentSystemCapacity": 2.1878661589989403,
                                    "percentSystemPower": 5.230882648616045,
                                    "order": 6
                                },
                                {
                                    "power": 153.3,
                                    "airflow": 385.27,
                                    "percentCapacity": 20.747142479434707,
                                    "timeInterval": 10,
                                    "percentPower": 52.84384694932782,
                                    "percentSystemCapacity": 2.1113241771323024,
                                    "percentSystemPower": 5.137055157161049,
                                    "order": 6
                                },
                                {
                                    "power": 151.7,
                                    "airflow": 377.4,
                                    "percentCapacity": 20.323153570426605,
                                    "timeInterval": 11,
                                    "percentPower": 52.29231299551878,
                                    "percentSystemCapacity": 2.068177125179867,
                                    "percentSystemPower": 5.0834394477581935,
                                    "order": 6
                                },
                                {
                                    "power": 152.59999999999997,
                                    "airflow": 381.82,
                                    "percentCapacity": 20.56113807437829,
                                    "timeInterval": 12,
                                    "percentPower": 52.60255084453635,
                                    "percentSystemCapacity": 2.092395517542771,
                                    "percentSystemPower": 5.113598284297298,
                                    "order": 6
                                },
                                {
                                    "power": 152.3,
                                    "airflow": 380.34,
                                    "percentCapacity": 20.481665269885244,
                                    "timeInterval": 13,
                                    "percentPower": 52.499138228197175,
                                    "percentSystemCapacity": 2.0843080012153057,
                                    "percentSystemPower": 5.103545338784264,
                                    "order": 6
                                },
                                {
                                    "power": 154,
                                    "airflow": 388.74,
                                    "percentCapacity": 20.933949921302275,
                                    "timeInterval": 14,
                                    "percentPower": 53.085143054119264,
                                    "percentSystemCapacity": 2.1303345574231876,
                                    "percentSystemPower": 5.1605120300247975,
                                    "order": 6
                                },
                                {
                                    "power": 154.1,
                                    "airflow": 389.24,
                                    "percentCapacity": 20.96070283230756,
                                    "timeInterval": 15,
                                    "percentPower": 53.119613926232326,
                                    "percentSystemCapacity": 2.133057056093552,
                                    "percentSystemPower": 5.163863011862476,
                                    "order": 6
                                },
                                {
                                    "power": 155.3,
                                    "airflow": 395.23,
                                    "percentCapacity": 21.283042481429685,
                                    "timeInterval": 16,
                                    "percentPower": 53.53326439158911,
                                    "percentSystemCapacity": 2.1658598141174332,
                                    "percentSystemPower": 5.204074793914618,
                                    "order": 6
                                },
                                {
                                    "power": 154.3,
                                    "airflow": 390.23,
                                    "percentCapacity": 21.014258544821278,
                                    "timeInterval": 17,
                                    "percentPower": 53.188555670458456,
                                    "percentSystemCapacity": 2.1385071305202277,
                                    "percentSystemPower": 5.170564975537833,
                                    "order": 6
                                },
                                {
                                    "power": 154,
                                    "airflow": 388.74,
                                    "percentCapacity": 20.933949921302275,
                                    "timeInterval": 18,
                                    "percentPower": 53.085143054119264,
                                    "percentSystemCapacity": 2.1303345574231876,
                                    "percentSystemPower": 5.1605120300247975,
                                    "order": 6
                                },
                                {
                                    "power": 155.9,
                                    "airflow": 398.24,
                                    "percentCapacity": 21.445125538138086,
                                    "timeInterval": 19,
                                    "percentPower": 53.7400896242675,
                                    "percentSystemCapacity": 2.182354127812496,
                                    "percentSystemPower": 5.224180684940688,
                                    "order": 6
                                },
                                {
                                    "power": 155.4,
                                    "airflow": 395.73,
                                    "percentCapacity": 21.310013728774496,
                                    "timeInterval": 20,
                                    "percentPower": 53.56773526370217,
                                    "percentSystemCapacity": 2.1686045316930205,
                                    "percentSystemPower": 5.207425775752296,
                                    "order": 6
                                },
                                {
                                    "power": 155.1,
                                    "airflow": 394.23,
                                    "percentCapacity": 21.22915086753657,
                                    "timeInterval": 21,
                                    "percentPower": 53.46432264736297,
                                    "percentSystemCapacity": 2.16037555682899,
                                    "percentSystemPower": 5.19737283023926,
                                    "order": 6
                                },
                                {
                                    "power": 154.9,
                                    "airflow": 393.23,
                                    "percentCapacity": 21.175326900137232,
                                    "timeInterval": 22,
                                    "percentPower": 53.39538090313685,
                                    "percentSystemCapacity": 2.1548981835573677,
                                    "percentSystemPower": 5.190670866563904,
                                    "order": 6
                                },
                                {
                                    "power": 155.8,
                                    "airflow": 397.73,
                                    "percentCapacity": 21.418069002452118,
                                    "timeInterval": 23,
                                    "percentPower": 53.70561875215443,
                                    "percentSystemCapacity": 2.1796007309049528,
                                    "percentSystemPower": 5.22082970310301,
                                    "order": 6
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "gky2b0t53",
                            "avgPower": 155.9666666666667,
                            "avgAirflow": 398.79874999999987,
                            "avgPrecentPower": 53.76307020567619,
                            "avgPercentCapacity": 21.475473276258267,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 195.3,
                                    "airflow": 626.85,
                                    "percentCapacity": 33.756147239845625,
                                    "timeInterval": 0,
                                    "percentPower": 67.3216132368149,
                                    "percentSystemCapacity": 3.435180042985167,
                                    "percentSystemPower": 6.544467528985994,
                                    "order": 6
                                },
                                {
                                    "power": 194.79999999999998,
                                    "airflow": 623.49,
                                    "percentCapacity": 33.57502902873946,
                                    "timeInterval": 1,
                                    "percentPower": 67.14925887624956,
                                    "percentSystemCapacity": 3.416748624855829,
                                    "percentSystemPower": 6.5277126197976,
                                    "order": 6
                                },
                                {
                                    "power": 231.80000000000004,
                                    "airflow": 918.61,
                                    "percentCapacity": 49.46767890827795,
                                    "timeInterval": 2,
                                    "percentPower": 79.90348155808343,
                                    "percentSystemCapacity": 5.03405741630163,
                                    "percentSystemPower": 7.767575899738626,
                                    "order": 6
                                },
                                {
                                    "power": 234.9,
                                    "airflow": 948.59,
                                    "percentCapacity": 51.0818282056146,
                                    "timeInterval": 3,
                                    "percentPower": 80.97207859358842,
                                    "percentSystemCapacity": 5.198320636662994,
                                    "percentSystemPower": 7.871456336706656,
                                    "order": 6
                                },
                                {
                                    "power": 233.5,
                                    "airflow": 934.93,
                                    "percentCapacity": 50.346208288317214,
                                    "timeInterval": 4,
                                    "percentPower": 80.4894863840055,
                                    "percentSystemCapacity": 5.123460586990633,
                                    "percentSystemPower": 7.824542590979157,
                                    "order": 6
                                },
                                {
                                    "power": 231.80000000000004,
                                    "airflow": 918.61,
                                    "percentCapacity": 49.46767890827795,
                                    "timeInterval": 5,
                                    "percentPower": 79.90348155808343,
                                    "percentSystemCapacity": 5.03405741630163,
                                    "percentSystemPower": 7.767575899738626,
                                    "order": 6
                                },
                                {
                                    "power": 247.5,
                                    "airflow": 1081.62,
                                    "percentCapacity": 58.245502799371884,
                                    "timeInterval": 6,
                                    "percentPower": 85.31540847983453,
                                    "percentSystemCapacity": 5.927328951032091,
                                    "percentSystemPower": 8.293680048254139,
                                    "order": 6
                                },
                                {
                                    "power": 198.3,
                                    "airflow": 647.33,
                                    "percentCapacity": 34.85911099896188,
                                    "timeInterval": 7,
                                    "percentPower": 68.35573940020683,
                                    "percentSystemCapacity": 3.547422683311717,
                                    "percentSystemPower": 6.6449969841163465,
                                    "order": 6
                                },
                                {
                                    "power": 201.6,
                                    "airflow": 670.48,
                                    "percentCapacity": 36.10561313393327,
                                    "timeInterval": 8,
                                    "percentPower": 69.49327817993795,
                                    "percentSystemCapacity": 3.6742724457318103,
                                    "percentSystemPower": 6.755579384759734,
                                    "order": 6
                                },
                                {
                                    "power": 196,
                                    "airflow": 631.58,
                                    "percentCapacity": 34.01099900206375,
                                    "timeInterval": 9,
                                    "percentPower": 67.56290934160634,
                                    "percentSystemCapacity": 3.461114924749692,
                                    "percentSystemPower": 6.5679244018497425,
                                    "order": 6
                                },
                                {
                                    "power": 195.5,
                                    "airflow": 628.2,
                                    "percentCapacity": 33.82880839780952,
                                    "timeInterval": 10,
                                    "percentPower": 67.39055498104102,
                                    "percentSystemCapacity": 3.4425743749853286,
                                    "percentSystemPower": 6.551169492661351,
                                    "order": 6
                                },
                                {
                                    "power": 196.6,
                                    "airflow": 635.66,
                                    "percentCapacity": 34.230647923478244,
                                    "timeInterval": 11,
                                    "percentPower": 67.76973457428473,
                                    "percentSystemCapacity": 3.4834674043127514,
                                    "percentSystemPower": 6.588030292875812,
                                    "order": 6
                                },
                                {
                                    "power": 196.4,
                                    "airflow": 634.3,
                                    "percentCapacity": 34.157307430811024,
                                    "timeInterval": 12,
                                    "percentPower": 67.7007928300586,
                                    "percentSystemCapacity": 3.4760039401039053,
                                    "percentSystemPower": 6.581328329200456,
                                    "order": 6
                                },
                                {
                                    "power": 198.1,
                                    "airflow": 645.95,
                                    "percentCapacity": 34.78469956715019,
                                    "timeInterval": 13,
                                    "percentPower": 68.28679765598069,
                                    "percentSystemCapacity": 3.5398502354339048,
                                    "percentSystemPower": 6.638295020440989,
                                    "order": 6
                                },
                                {
                                    "power": 197.40000000000003,
                                    "airflow": 641.13,
                                    "percentCapacity": 34.5252599918708,
                                    "timeInterval": 14,
                                    "percentPower": 68.04550155118925,
                                    "percentSystemCapacity": 3.5134484768141205,
                                    "percentSystemPower": 6.614838147577242,
                                    "order": 6
                                },
                                {
                                    "power": 197.8,
                                    "airflow": 643.88,
                                    "percentCapacity": 34.67332107066062,
                                    "timeInterval": 15,
                                    "percentPower": 68.1833850396415,
                                    "percentSystemCapacity": 3.528515849858438,
                                    "percentSystemPower": 6.628242074927955,
                                    "order": 6
                                },
                                {
                                    "power": 200.3,
                                    "airflow": 661.28,
                                    "percentCapacity": 35.61030978227141,
                                    "timeInterval": 16,
                                    "percentPower": 69.04515684246812,
                                    "percentSystemCapacity": 3.6238681096930083,
                                    "percentSystemPower": 6.712016620869915,
                                    "order": 6
                                },
                                {
                                    "power": 198.4,
                                    "airflow": 648.03,
                                    "percentCapacity": 34.896364581392746,
                                    "timeInterval": 17,
                                    "percentPower": 68.39021027231989,
                                    "percentSystemCapacity": 3.5512137783672912,
                                    "percentSystemPower": 6.648347965954025,
                                    "order": 6
                                },
                                {
                                    "power": 197.8,
                                    "airflow": 643.88,
                                    "percentCapacity": 34.67332107066062,
                                    "timeInterval": 18,
                                    "percentPower": 68.1833850396415,
                                    "percentSystemCapacity": 3.528515849858438,
                                    "percentSystemPower": 6.628242074927955,
                                    "order": 6
                                },
                                {
                                    "power": 199,
                                    "airflow": 652.19,
                                    "percentCapacity": 35.12055908526016,
                                    "timeInterval": 19,
                                    "percentPower": 68.59703550499827,
                                    "percentSystemCapacity": 3.574028837205619,
                                    "percentSystemPower": 6.668453856980096,
                                    "order": 6
                                },
                                {
                                    "power": 201.30000000000004,
                                    "airflow": 668.35,
                                    "percentCapacity": 35.99081405316896,
                                    "timeInterval": 20,
                                    "percentPower": 69.38986556359876,
                                    "percentSystemCapacity": 3.6625899658447376,
                                    "percentSystemPower": 6.7455264392467,
                                    "order": 6
                                },
                                {
                                    "power": 200.20000000000002,
                                    "airflow": 660.58,
                                    "percentCapacity": 35.57244084035142,
                                    "timeInterval": 21,
                                    "percentPower": 69.01068597035504,
                                    "percentSystemCapacity": 3.620014392839357,
                                    "percentSystemPower": 6.708665639032238,
                                    "order": 6
                                },
                                {
                                    "power": 202.7,
                                    "airflow": 678.35,
                                    "percentCapacity": 36.529130898173946,
                                    "timeInterval": 22,
                                    "percentPower": 69.87245777318165,
                                    "percentSystemCapacity": 3.7173715518363117,
                                    "percentSystemPower": 6.792440184974198,
                                    "order": 6
                                },
                                {
                                    "power": 202.2,
                                    "airflow": 674.76,
                                    "percentCapacity": 36.33611650717336,
                                    "timeInterval": 23,
                                    "percentPower": 69.70010341261633,
                                    "percentSystemCapacity": 3.697729523992817,
                                    "percentSystemPower": 6.775685275785805,
                                    "order": 6
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "gky2b0t53",
                            "avgPower": 206.2166666666667,
                            "avgAirflow": 713.2762499999999,
                            "avgPrecentPower": 71.08468344249108,
                            "avgPercentCapacity": 38.410204071401516,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 213.59999999999997,
                                    "airflow": 760.62,
                                    "percentCapacity": 40.95951057252891,
                                    "timeInterval": 0,
                                    "percentPower": 73.62978283350567,
                                    "percentSystemCapacity": 4.168227265080348,
                                    "percentSystemPower": 7.1576972052811465,
                                    "order": 7
                                },
                                {
                                    "power": 212,
                                    "airflow": 748.02,
                                    "percentCapacity": 40.28117770426412,
                                    "timeInterval": 1,
                                    "percentPower": 73.07824887969664,
                                    "percentSystemCapacity": 4.099197007716926,
                                    "percentSystemPower": 7.104081495878292,
                                    "order": 7
                                },
                                {
                                    "power": 211,
                                    "airflow": 740.24,
                                    "percentCapacity": 39.86231997418118,
                                    "timeInterval": 2,
                                    "percentPower": 72.733540158566,
                                    "percentSystemCapacity": 4.056572128017013,
                                    "percentSystemPower": 7.070571677501508,
                                    "order": 7
                                },
                                {
                                    "power": 207.6,
                                    "airflow": 714.33,
                                    "percentCapacity": 38.46666420265902,
                                    "timeInterval": 3,
                                    "percentPower": 71.56153050672181,
                                    "percentSystemCapacity": 3.914543808874277,
                                    "percentSystemPower": 6.956638295020441,
                                    "order": 7
                                },
                                {
                                    "power": 218.8,
                                    "airflow": 802.9,
                                    "percentCapacity": 43.23635570216482,
                                    "timeInterval": 4,
                                    "percentPower": 75.42226818338503,
                                    "percentSystemCapacity": 4.399929446455506,
                                    "percentSystemPower": 7.331948260840428,
                                    "order": 7
                                },
                                {
                                    "power": 212.8,
                                    "airflow": 754.3,
                                    "percentCapacity": 40.619076976350485,
                                    "timeInterval": 5,
                                    "percentPower": 73.35401585660118,
                                    "percentSystemCapacity": 4.133583184189109,
                                    "percentSystemPower": 7.130889350579721,
                                    "order": 7
                                },
                                {
                                    "power": 222.2,
                                    "airflow": 831.72,
                                    "percentCapacity": 44.78816194161088,
                                    "timeInterval": 6,
                                    "percentPower": 76.59427783522922,
                                    "percentSystemCapacity": 4.557848351905492,
                                    "percentSystemPower": 7.445881643321493,
                                    "order": 7
                                },
                                {
                                    "power": 209.6,
                                    "airflow": 729.47,
                                    "percentCapacity": 39.28237622225458,
                                    "timeInterval": 7,
                                    "percentPower": 72.2509479489831,
                                    "percentSystemCapacity": 3.9975543974532415,
                                    "percentSystemPower": 7.023657931774011,
                                    "order": 7
                                },
                                {
                                    "power": 218.9,
                                    "airflow": 803.73,
                                    "percentCapacity": 43.28126452670609,
                                    "timeInterval": 8,
                                    "percentPower": 75.4567390554981,
                                    "percentSystemCapacity": 4.4044995739858175,
                                    "percentSystemPower": 7.335299242678104,
                                    "order": 7
                                },
                                {
                                    "power": 224.7,
                                    "airflow": 853.53,
                                    "percentCapacity": 45.963002398270206,
                                    "timeInterval": 9,
                                    "percentPower": 77.45604963805583,
                                    "percentSystemCapacity": 4.677405493949352,
                                    "percentSystemPower": 7.529656189263455,
                                    "order": 7
                                },
                                {
                                    "power": 224.3,
                                    "airflow": 850.01,
                                    "percentCapacity": 45.773043341793795,
                                    "timeInterval": 10,
                                    "percentPower": 77.31816614960358,
                                    "percentSystemCapacity": 4.6580743909311195,
                                    "percentSystemPower": 7.516252261912741,
                                    "order": 7
                                },
                                {
                                    "power": 230.8,
                                    "airflow": 909.15,
                                    "percentCapacity": 48.95825871132659,
                                    "timeInterval": 11,
                                    "percentPower": 79.55877283695277,
                                    "percentSystemCapacity": 4.982216485474216,
                                    "percentSystemPower": 7.73406608136184,
                                    "order": 7
                                },
                                {
                                    "power": 232.4,
                                    "airflow": 924.34,
                                    "percentCapacity": 49.77593149739461,
                                    "timeInterval": 12,
                                    "percentPower": 80.1103067907618,
                                    "percentSystemCapacity": 5.065426610623728,
                                    "percentSystemPower": 7.787681790764695,
                                    "order": 7
                                },
                                {
                                    "power": 237.2,
                                    "airflow": 971.49,
                                    "percentCapacity": 52.31490483808674,
                                    "timeInterval": 13,
                                    "percentPower": 81.7649086521889,
                                    "percentSystemCapacity": 5.323804158501046,
                                    "percentSystemPower": 7.948528918973259,
                                    "order": 7
                                },
                                {
                                    "power": 238.3,
                                    "airflow": 982.65,
                                    "percentCapacity": 52.91574798127563,
                                    "timeInterval": 14,
                                    "percentPower": 82.14408824543261,
                                    "percentSystemCapacity": 5.384948706774926,
                                    "percentSystemPower": 7.985389719187723,
                                    "order": 7
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 15,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 7
                                },
                                {
                                    "power": 239.7,
                                    "airflow": 997.04,
                                    "percentCapacity": 53.69116400802525,
                                    "timeInterval": 16,
                                    "percentPower": 82.6266804550155,
                                    "percentSystemCapacity": 5.463858590689549,
                                    "percentSystemPower": 8.03230346491522,
                                    "order": 7
                                },
                                {
                                    "power": 238.50000000000003,
                                    "airflow": 984.69,
                                    "percentCapacity": 53.02578167749572,
                                    "timeInterval": 17,
                                    "percentPower": 82.21302998965874,
                                    "percentSystemCapacity": 5.396146239319901,
                                    "percentSystemPower": 7.99209168286308,
                                    "order": 7
                                },
                                {
                                    "power": 239,
                                    "airflow": 989.82,
                                    "percentCapacity": 53.30194046803947,
                                    "timeInterval": 18,
                                    "percentPower": 82.38538435022406,
                                    "percentSystemCapacity": 5.424249421807831,
                                    "percentSystemPower": 8.008846592051471,
                                    "order": 7
                                },
                                {
                                    "power": 233,
                                    "airflow": 930.1,
                                    "percentCapacity": 50.08615994515806,
                                    "timeInterval": 19,
                                    "percentPower": 80.31713202344018,
                                    "percentSystemCapacity": 5.09699687736511,
                                    "percentSystemPower": 7.8077876817907645,
                                    "order": 7
                                },
                                {
                                    "power": 226.3,
                                    "airflow": 867.79,
                                    "percentCapacity": 46.73057505640279,
                                    "timeInterval": 20,
                                    "percentPower": 78.00758359186487,
                                    "percentSystemCapacity": 4.755517200774879,
                                    "percentSystemPower": 7.583271898666311,
                                    "order": 7
                                },
                                {
                                    "power": 233,
                                    "airflow": 930.1,
                                    "percentCapacity": 50.08615994515806,
                                    "timeInterval": 21,
                                    "percentPower": 80.31713202344018,
                                    "percentSystemCapacity": 5.09699687736511,
                                    "percentSystemPower": 7.8077876817907645,
                                    "order": 7
                                },
                                {
                                    "power": 210.9,
                                    "airflow": 739.47,
                                    "percentCapacity": 39.820646998872256,
                                    "timeInterval": 22,
                                    "percentPower": 72.69906928645294,
                                    "percentSystemCapacity": 4.052331295314872,
                                    "percentSystemPower": 7.0672206956638295,
                                    "order": 7
                                },
                                {
                                    "power": 197.5,
                                    "airflow": 641.82,
                                    "percentCapacity": 34.56222786994664,
                                    "timeInterval": 23,
                                    "percentPower": 68.07997242330231,
                                    "percentSystemCapacity": 3.517210497286875,
                                    "percentSystemPower": 6.618189129414918,
                                    "order": 7
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "wys7qh9g0",
                            "avgPower": 223.85000000000002,
                            "avgAirflow": 852.5258333333333,
                            "avgPrecentPower": 77.16304722509477,
                            "avgPercentCapacity": 45.90873663058179,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 241.5,
                                    "airflow": 1015.89,
                                    "percentCapacity": 54.706220793618684,
                                    "timeInterval": 0,
                                    "percentPower": 83.24715615305067,
                                    "percentSystemCapacity": 5.567155415045479,
                                    "percentSystemPower": 8.092621137993433,
                                    "order": 7
                                },
                                {
                                    "power": 241.5,
                                    "airflow": 1015.89,
                                    "percentCapacity": 54.706220793618684,
                                    "timeInterval": 1,
                                    "percentPower": 83.24715615305067,
                                    "percentSystemCapacity": 5.567155415045479,
                                    "percentSystemPower": 8.092621137993433,
                                    "order": 7
                                },
                                {
                                    "power": 240.8,
                                    "airflow": 1008.52,
                                    "percentCapacity": 54.30902017970474,
                                    "timeInterval": 2,
                                    "percentPower": 83.00586004825922,
                                    "percentSystemCapacity": 5.526734462610242,
                                    "percentSystemPower": 8.069164265129684,
                                    "order": 7
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 3,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 7
                                },
                                {
                                    "power": 241,
                                    "airflow": 1010.62,
                                    "percentCapacity": 54.422184489419756,
                                    "timeInterval": 4,
                                    "percentPower": 83.07480179248535,
                                    "percentSystemCapacity": 5.538250580713091,
                                    "percentSystemPower": 8.07586622880504,
                                    "order": 7
                                },
                                {
                                    "power": 240.1,
                                    "airflow": 1001.2,
                                    "percentCapacity": 53.91495351147111,
                                    "timeInterval": 5,
                                    "percentPower": 82.76456394346776,
                                    "percentSystemCapacity": 5.486632434831316,
                                    "percentSystemPower": 8.045707392265934,
                                    "order": 7
                                },
                                {
                                    "power": 234.9,
                                    "airflow": 948.59,
                                    "percentCapacity": 51.0818282056146,
                                    "timeInterval": 6,
                                    "percentPower": 80.97207859358842,
                                    "percentSystemCapacity": 5.198320636662994,
                                    "percentSystemPower": 7.871456336706656,
                                    "order": 7
                                },
                                {
                                    "power": 239.5,
                                    "airflow": 994.97,
                                    "percentCapacity": 53.57964570073679,
                                    "timeInterval": 7,
                                    "percentPower": 82.55773871078938,
                                    "percentSystemCapacity": 5.4525099773272805,
                                    "percentSystemPower": 8.025601501239864,
                                    "order": 7
                                },
                                {
                                    "power": 239.3,
                                    "airflow": 992.91,
                                    "percentCapacity": 53.46837711952131,
                                    "timeInterval": 8,
                                    "percentPower": 82.48879696656324,
                                    "percentSystemCapacity": 5.44118677723318,
                                    "percentSystemPower": 8.018899537564508,
                                    "order": 7
                                },
                                {
                                    "power": 237.7,
                                    "airflow": 976.54,
                                    "percentCapacity": 52.587108861529245,
                                    "timeInterval": 9,
                                    "percentPower": 81.93726301275422,
                                    "percentSystemCapacity": 5.351504885788021,
                                    "percentSystemPower": 7.965283828161651,
                                    "order": 7
                                },
                                {
                                    "power": 238.6,
                                    "airflow": 985.71,
                                    "percentCapacity": 53.08089040369188,
                                    "timeInterval": 10,
                                    "percentPower": 82.2475008617718,
                                    "percentSystemCapacity": 5.401754355526952,
                                    "percentSystemPower": 7.995442664700758,
                                    "order": 7
                                },
                                {
                                    "power": 239.2,
                                    "airflow": 991.88,
                                    "percentCapacity": 53.41283618784261,
                                    "timeInterval": 11,
                                    "percentPower": 82.45432609445018,
                                    "percentSystemCapacity": 5.435534677818047,
                                    "percentSystemPower": 8.015548555726829,
                                    "order": 7
                                },
                                {
                                    "power": 239.6,
                                    "airflow": 996.01,
                                    "percentCapacity": 53.635373580814985,
                                    "timeInterval": 12,
                                    "percentPower": 82.59220958290244,
                                    "percentSystemCapacity": 5.458181101467197,
                                    "percentSystemPower": 8.028952483077543,
                                    "order": 7
                                },
                                {
                                    "power": 239.99999999999997,
                                    "airflow": 1000.16,
                                    "percentCapacity": 53.85891173340009,
                                    "timeInterval": 13,
                                    "percentPower": 82.73009307135469,
                                    "percentSystemCapacity": 5.480929366994957,
                                    "percentSystemPower": 8.042356410428255,
                                    "order": 7
                                },
                                {
                                    "power": 239.3,
                                    "airflow": 992.91,
                                    "percentCapacity": 53.46837711952131,
                                    "timeInterval": 14,
                                    "percentPower": 82.48879696656324,
                                    "percentSystemCapacity": 5.44118677723318,
                                    "percentSystemPower": 8.018899537564508,
                                    "order": 7
                                },
                                {
                                    "power": 239.6,
                                    "airflow": 996.01,
                                    "percentCapacity": 53.635373580814985,
                                    "timeInterval": 15,
                                    "percentPower": 82.59220958290244,
                                    "percentSystemCapacity": 5.458181101467197,
                                    "percentSystemPower": 8.028952483077543,
                                    "order": 7
                                },
                                {
                                    "power": 240.19999999999996,
                                    "airflow": 1002.24,
                                    "percentCapacity": 53.97105841922265,
                                    "timeInterval": 16,
                                    "percentPower": 82.79903481558082,
                                    "percentSystemCapacity": 5.492341927032906,
                                    "percentSystemPower": 8.04905837410361,
                                    "order": 7
                                },
                                {
                                    "power": 240.4,
                                    "airflow": 1004.33,
                                    "percentCapacity": 54.083458093414016,
                                    "timeInterval": 17,
                                    "percentPower": 82.86797655980695,
                                    "percentSystemCapacity": 5.503780232325177,
                                    "percentSystemPower": 8.055760337778969,
                                    "order": 7
                                },
                                {
                                    "power": 239.99999999999997,
                                    "airflow": 1000.16,
                                    "percentCapacity": 53.85891173340009,
                                    "timeInterval": 18,
                                    "percentPower": 82.73009307135469,
                                    "percentSystemCapacity": 5.480929366994957,
                                    "percentSystemPower": 8.042356410428255,
                                    "order": 7
                                },
                                {
                                    "power": 240.6,
                                    "airflow": 1006.42,
                                    "percentCapacity": 54.19611169805525,
                                    "timeInterval": 19,
                                    "percentPower": 82.93691830403309,
                                    "percentSystemCapacity": 5.515244378742251,
                                    "percentSystemPower": 8.062462301454326,
                                    "order": 7
                                },
                                {
                                    "power": 243.7,
                                    "airflow": 1039.46,
                                    "percentCapacity": 55.97543230584003,
                                    "timeInterval": 20,
                                    "percentPower": 84.00551533953808,
                                    "percentSystemCapacity": 5.696316187633984,
                                    "percentSystemPower": 8.166342738422358,
                                    "order": 7
                                },
                                {
                                    "power": 275.5,
                                    "airflow": 1463.3,
                                    "percentCapacity": 78.79900266551543,
                                    "timeInterval": 21,
                                    "percentPower": 94.96725267149259,
                                    "percentSystemCapacity": 8.018947169545273,
                                    "percentSystemPower": 9.231954962804103,
                                    "order": 7
                                },
                                {
                                    "power": 283.4,
                                    "airflow": 1600.53,
                                    "percentCapacity": 86.18916514306684,
                                    "timeInterval": 22,
                                    "percentPower": 97.69045156842466,
                                    "percentSystemCapacity": 8.771003927590701,
                                    "percentSystemPower": 9.496682527980699,
                                    "order": 7
                                },
                                {
                                    "power": 282.6,
                                    "airflow": 1585.89,
                                    "percentCapacity": 85.40083500952385,
                                    "timeInterval": 23,
                                    "percentPower": 97.41468459152016,
                                    "percentSystemCapacity": 8.690779845061693,
                                    "percentSystemPower": 9.469874673279271,
                                    "order": 7
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "wys7qh9g0",
                            "avgPower": 244.9708333333333,
                            "avgAirflow": 1068.0595833333332,
                            "avgPrecentPower": 84.4435826726416,
                            "avgPercentCapacity": 57.51535516263985,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 378,
                                    "airflow": 1091.53,
                                    "percentCapacity": 35.26745761316419,
                                    "timeInterval": 0,
                                    "percentPower": 75.99517490952957,
                                    "percentSystemCapacity": 5.981629839584786,
                                    "percentSystemPower": 12.666711346424503,
                                    "order": 8
                                },
                                {
                                    "power": 372.2,
                                    "airflow": 1048.05,
                                    "percentCapacity": 33.862558651153975,
                                    "timeInterval": 1,
                                    "percentPower": 74.82911137917169,
                                    "percentSystemCapacity": 5.743348258730904,
                                    "percentSystemPower": 12.472354399839153,
                                    "order": 8
                                },
                                {
                                    "power": 380.9,
                                    "airflow": 1114.01,
                                    "percentCapacity": 35.99395232063216,
                                    "timeInterval": 2,
                                    "percentPower": 76.57820667470848,
                                    "percentSystemCapacity": 6.104848883842423,
                                    "percentSystemPower": 12.763889819717178,
                                    "order": 8
                                },
                                {
                                    "power": 393.9,
                                    "airflow": 1221.51,
                                    "percentCapacity": 39.46735471452128,
                                    "timeInterval": 3,
                                    "percentPower": 79.19179734620025,
                                    "percentSystemCapacity": 6.6939644257695825,
                                    "percentSystemPower": 13.199517458615375,
                                    "order": 8
                                },
                                {
                                    "power": 390.2,
                                    "airflow": 1189.74,
                                    "percentCapacity": 38.44070518099008,
                                    "timeInterval": 4,
                                    "percentPower": 78.44792923200643,
                                    "percentSystemCapacity": 6.5198368333606025,
                                    "percentSystemPower": 13.075531130621274,
                                    "order": 8
                                },
                                {
                                    "power": 391.1,
                                    "airflow": 1197.38,
                                    "percentCapacity": 38.68751424364771,
                                    "timeInterval": 5,
                                    "percentPower": 78.62887012464817,
                                    "percentSystemCapacity": 6.561697533104432,
                                    "percentSystemPower": 13.10568996716038,
                                    "order": 8
                                },
                                {
                                    "power": 384.2,
                                    "airflow": 1140.23,
                                    "percentCapacity": 36.84118596979311,
                                    "timeInterval": 6,
                                    "percentPower": 77.24165661439486,
                                    "percentSystemCapacity": 6.248546173635997,
                                    "percentSystemPower": 12.874472220360566,
                                    "order": 8
                                },
                                {
                                    "power": 384.9,
                                    "airflow": 1145.89,
                                    "percentCapacity": 37.02379802292746,
                                    "timeInterval": 7,
                                    "percentPower": 77.38238841978287,
                                    "percentSystemCapacity": 6.279518570854916,
                                    "percentSystemPower": 12.897929093224313,
                                    "order": 8
                                },
                                {
                                    "power": 388.6,
                                    "airflow": 1176.3,
                                    "percentCapacity": 38.0064532332856,
                                    "timeInterval": 8,
                                    "percentPower": 78.12625653397669,
                                    "percentSystemCapacity": 6.446184390454785,
                                    "percentSystemPower": 13.021915421218418,
                                    "order": 8
                                },
                                {
                                    "power": 371.4,
                                    "airflow": 1042.2,
                                    "percentCapacity": 33.673611768739555,
                                    "timeInterval": 9,
                                    "percentPower": 74.66827503015682,
                                    "percentSystemCapacity": 5.711301426142531,
                                    "percentSystemPower": 12.445546545137725,
                                    "order": 8
                                },
                                {
                                    "power": 368.2,
                                    "airflow": 1019.15,
                                    "percentCapacity": 32.92906614086988,
                                    "timeInterval": 10,
                                    "percentPower": 74.0249296340973,
                                    "percentSystemCapacity": 5.585020808088134,
                                    "percentSystemPower": 12.338315126332015,
                                    "order": 8
                                },
                                {
                                    "power": 345.9,
                                    "airflow": 872.51,
                                    "percentCapacity": 28.190810667212208,
                                    "timeInterval": 11,
                                    "percentPower": 69.5416164053076,
                                    "percentSystemCapacity": 4.781376535237932,
                                    "percentSystemPower": 11.591046176529723,
                                    "order": 8
                                },
                                {
                                    "power": 355.6,
                                    "airflow": 933.48,
                                    "percentCapacity": 30.16096057838913,
                                    "timeInterval": 12,
                                    "percentPower": 71.491757137113,
                                    "percentSystemCapacity": 5.1155289889365605,
                                    "percentSystemPower": 11.916091414784534,
                                    "order": 8
                                },
                                {
                                    "power": 356.5,
                                    "airflow": 939.35,
                                    "percentCapacity": 30.350533154327806,
                                    "timeInterval": 13,
                                    "percentPower": 71.67269802975473,
                                    "percentSystemCapacity": 5.147681943919583,
                                    "percentSystemPower": 11.946250251323638,
                                    "order": 8
                                },
                                {
                                    "power": 356,
                                    "airflow": 936.08,
                                    "percentCapacity": 30.245067554337446,
                                    "timeInterval": 14,
                                    "percentPower": 71.57217531162044,
                                    "percentSystemCapacity": 5.129794173645024,
                                    "percentSystemPower": 11.929495342135246,
                                    "order": 8
                                },
                                {
                                    "power": 353.5,
                                    "airflow": 919.93,
                                    "percentCapacity": 29.7232268653284,
                                    "timeInterval": 15,
                                    "percentPower": 71.06956172094894,
                                    "percentSystemCapacity": 5.041286012066605,
                                    "percentSystemPower": 11.845720796193286,
                                    "order": 8
                                },
                                {
                                    "power": 357.1,
                                    "airflow": 943.28,
                                    "percentCapacity": 30.477581442691594,
                                    "timeInterval": 16,
                                    "percentPower": 71.79332529151588,
                                    "percentSystemCapacity": 5.169230302780057,
                                    "percentSystemPower": 11.96635614234971,
                                    "order": 8
                                },
                                {
                                    "power": 362.4,
                                    "airflow": 978.75,
                                    "percentCapacity": 31.623621992262162,
                                    "timeInterval": 17,
                                    "percentPower": 72.85886610373944,
                                    "percentSystemCapacity": 5.36360752225183,
                                    "percentSystemPower": 12.143958179746665,
                                    "order": 8
                                },
                                {
                                    "power": 357.9,
                                    "airflow": 948.55,
                                    "percentCapacity": 30.647816046472798,
                                    "timeInterval": 18,
                                    "percentPower": 71.95416164053076,
                                    "percentSystemCapacity": 5.198103390170612,
                                    "percentSystemPower": 11.993163997051136,
                                    "order": 8
                                },
                                {
                                    "power": 367.1,
                                    "airflow": 1011.36,
                                    "percentCapacity": 32.67719614713831,
                                    "timeInterval": 19,
                                    "percentPower": 73.80377965420186,
                                    "percentSystemCapacity": 5.542301735828204,
                                    "percentSystemPower": 12.301454326117554,
                                    "order": 8
                                },
                                {
                                    "power": 381.8,
                                    "airflow": 1121.1,
                                    "percentCapacity": 36.222812364789725,
                                    "timeInterval": 20,
                                    "percentPower": 76.75914756735023,
                                    "percentSystemCapacity": 6.143665293129341,
                                    "percentSystemPower": 12.794048656256285,
                                    "order": 8
                                },
                                {
                                    "power": 383,
                                    "airflow": 1130.62,
                                    "percentCapacity": 36.530516500998324,
                                    "timeInterval": 21,
                                    "percentPower": 77.00040209087254,
                                    "percentSystemCapacity": 6.195854261869235,
                                    "percentSystemPower": 12.834260438308426,
                                    "order": 8
                                },
                                {
                                    "power": 387.9,
                                    "airflow": 1170.48,
                                    "percentCapacity": 37.81826121140575,
                                    "timeInterval": 22,
                                    "percentPower": 77.98552472858866,
                                    "percentSystemCapacity": 6.414265587971328,
                                    "percentSystemPower": 12.99845854835467,
                                    "order": 8
                                },
                                {
                                    "power": 392.3,
                                    "airflow": 1207.65,
                                    "percentCapacity": 39.01948831567488,
                                    "timeInterval": 23,
                                    "percentPower": 78.87012464817049,
                                    "percentSystemCapacity": 6.618002868095887,
                                    "percentSystemPower": 13.145901749212522,
                                    "order": 8
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ci82gloj4",
                            "avgPower": 373.35833333333335,
                            "avgAirflow": 1062.46375,
                            "avgPrecentPower": 75.06198900951617,
                            "avgPercentCapacity": 34.32839794586473,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 431.00000000000006,
                                    "airflow": 1605.93,
                                    "percentCapacity": 51.887820311910374,
                                    "timeInterval": 0,
                                    "percentPower": 86.6505830317652,
                                    "percentSystemCapacity": 8.800570137295189,
                                    "percentSystemPower": 14.442731720394079,
                                    "order": 8
                                },
                                {
                                    "power": 432,
                                    "airflow": 1618.31,
                                    "percentCapacity": 52.28775939397501,
                                    "timeInterval": 1,
                                    "percentPower": 86.85162846803378,
                                    "percentSystemCapacity": 8.868402856441946,
                                    "percentSystemPower": 14.476241538770863,
                                    "order": 8
                                },
                                {
                                    "power": 427.40000000000003,
                                    "airflow": 1562.39,
                                    "percentCapacity": 50.481024456284196,
                                    "timeInterval": 2,
                                    "percentPower": 85.92681946119825,
                                    "percentSystemCapacity": 8.561966828814093,
                                    "percentSystemPower": 14.322096374237653,
                                    "order": 8
                                },
                                {
                                    "power": 442.6000000000001,
                                    "airflow": 1757.68,
                                    "percentCapacity": 56.790791835748955,
                                    "timeInterval": 3,
                                    "percentPower": 88.98271009248091,
                                    "percentSystemCapacity": 9.632151508748521,
                                    "percentSystemPower": 14.831445613564778,
                                    "order": 8
                                },
                                {
                                    "power": 432.2,
                                    "airflow": 1620.8,
                                    "percentCapacity": 52.36823638019672,
                                    "timeInterval": 4,
                                    "percentPower": 86.8918375552875,
                                    "percentSystemCapacity": 8.88205236720237,
                                    "percentSystemPower": 14.482943502446217,
                                    "order": 8
                                },
                                {
                                    "power": 438.9,
                                    "airflow": 1707.27,
                                    "percentCapacity": 55.1621213364351,
                                    "timeInterval": 5,
                                    "percentPower": 88.2388419782871,
                                    "percentSystemCapacity": 9.355916568186466,
                                    "percentSystemPower": 14.707459285570673,
                                    "order": 8
                                },
                                {
                                    "power": 429.49999999999994,
                                    "airflow": 1587.59,
                                    "percentCapacity": 51.29545640542696,
                                    "timeInterval": 6,
                                    "percentPower": 86.34901487736228,
                                    "percentSystemCapacity": 8.700100700065565,
                                    "percentSystemPower": 14.392466992828897,
                                    "order": 8
                                },
                                {
                                    "power": 412.9,
                                    "airflow": 1401.8,
                                    "percentCapacity": 45.29239173132229,
                                    "timeInterval": 7,
                                    "percentPower": 83.01166063530357,
                                    "percentSystemCapacity": 7.681935138559978,
                                    "percentSystemPower": 13.836204007774278,
                                    "order": 8
                                },
                                {
                                    "power": 415.6,
                                    "airflow": 1430.04,
                                    "percentCapacity": 46.204722639340325,
                                    "timeInterval": 8,
                                    "percentPower": 83.5544833132288,
                                    "percentSystemCapacity": 7.836673420032787,
                                    "percentSystemPower": 13.926680517391599,
                                    "order": 8
                                },
                                {
                                    "power": 410,
                                    "airflow": 1372.25,
                                    "percentCapacity": 44.33771177345247,
                                    "timeInterval": 9,
                                    "percentPower": 82.42862887012465,
                                    "percentSystemCapacity": 7.520014135183876,
                                    "percentSystemPower": 13.739025534481602,
                                    "order": 8
                                },
                                {
                                    "power": 410.4,
                                    "airflow": 1376.28,
                                    "percentCapacity": 44.46787611966578,
                                    "timeInterval": 10,
                                    "percentPower": 82.50904704463208,
                                    "percentSystemCapacity": 7.542091001225646,
                                    "percentSystemPower": 13.752429461832316,
                                    "order": 8
                                },
                                {
                                    "power": 391.4,
                                    "airflow": 1199.94,
                                    "percentCapacity": 38.77019586457613,
                                    "timeInterval": 11,
                                    "percentPower": 78.68918375552875,
                                    "percentSystemCapacity": 6.575720966728579,
                                    "percentSystemPower": 13.115742912673415,
                                    "order": 8
                                },
                                {
                                    "power": 381.6,
                                    "airflow": 1119.52,
                                    "percentCapacity": 36.17181336715891,
                                    "timeInterval": 12,
                                    "percentPower": 76.71893848009651,
                                    "percentSystemCapacity": 6.135015474098906,
                                    "percentSystemPower": 12.787346692580929,
                                    "order": 8
                                },
                                {
                                    "power": 395.2,
                                    "airflow": 1232.92,
                                    "percentCapacity": 39.835733821609985,
                                    "timeInterval": 13,
                                    "percentPower": 79.45315641334942,
                                    "percentSystemCapacity": 6.756444332413575,
                                    "percentSystemPower": 13.243080222505194,
                                    "order": 8
                                },
                                {
                                    "power": 397.9,
                                    "airflow": 1257,
                                    "percentCapacity": 40.61401845296988,
                                    "timeInterval": 14,
                                    "percentPower": 79.99597909127462,
                                    "percentSystemCapacity": 6.888447342828901,
                                    "percentSystemPower": 13.333556732122512,
                                    "order": 8
                                },
                                {
                                    "power": 406.1,
                                    "airflow": 1333.74,
                                    "percentCapacity": 43.09322432329337,
                                    "timeInterval": 15,
                                    "percentPower": 81.64455166867714,
                                    "percentSystemCapacity": 7.308939570396371,
                                    "percentSystemPower": 13.608337242812146,
                                    "order": 8
                                },
                                {
                                    "power": 399,
                                    "airflow": 1266.98,
                                    "percentCapacity": 40.93632314189368,
                                    "timeInterval": 16,
                                    "percentPower": 80.21712907117009,
                                    "percentSystemCapacity": 6.943112676685716,
                                    "percentSystemPower": 13.370417532336976,
                                    "order": 8
                                },
                                {
                                    "power": 396.4,
                                    "airflow": 1243.55,
                                    "percentCapacity": 40.17941459130814,
                                    "timeInterval": 17,
                                    "percentPower": 79.69441093687173,
                                    "percentSystemCapacity": 6.814735212631449,
                                    "percentSystemPower": 13.283292004557335,
                                    "order": 8
                                },
                                {
                                    "power": 400.5,
                                    "airflow": 1280.74,
                                    "percentCapacity": 41.3808257152398,
                                    "timeInterval": 18,
                                    "percentPower": 80.51869722557299,
                                    "percentSystemCapacity": 7.018503703894519,
                                    "percentSystemPower": 13.420682259902152,
                                    "order": 8
                                },
                                {
                                    "power": 400.2,
                                    "airflow": 1277.97,
                                    "percentCapacity": 41.29145908962717,
                                    "timeInterval": 19,
                                    "percentPower": 80.4583835946924,
                                    "percentSystemCapacity": 7.003346442481154,
                                    "percentSystemPower": 13.410629314389116,
                                    "order": 8
                                },
                                {
                                    "power": 396.6,
                                    "airflow": 1245.34,
                                    "percentCapacity": 40.237038533754976,
                                    "timeInterval": 20,
                                    "percentPower": 79.73462002412546,
                                    "percentSystemCapacity": 6.824508672839307,
                                    "percentSystemPower": 13.289993968232693,
                                    "order": 8
                                },
                                {
                                    "power": 397,
                                    "airflow": 1248.91,
                                    "percentCapacity": 40.352583558532814,
                                    "timeInterval": 21,
                                    "percentPower": 79.81503819863289,
                                    "percentSystemCapacity": 6.8441059904460255,
                                    "percentSystemPower": 13.303397895583407,
                                    "order": 8
                                },
                                {
                                    "power": 401.7,
                                    "airflow": 1291.87,
                                    "percentCapacity": 41.74065213268654,
                                    "timeInterval": 22,
                                    "percentPower": 80.7599517490953,
                                    "percentSystemCapacity": 7.079533009133321,
                                    "percentSystemPower": 13.460894041954294,
                                    "order": 8
                                },
                                {
                                    "power": 404.6,
                                    "airflow": 1319.28,
                                    "percentCapacity": 42.62614453697977,
                                    "timeInterval": 23,
                                    "percentPower": 81.34298351427424,
                                    "percentSystemCapacity": 7.229719275644037,
                                    "percentSystemPower": 13.55807251524697,
                                    "order": 8
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ci82gloj4",
                            "avgPower": 410.4458333333334,
                            "avgAirflow": 1389.9208333333336,
                            "avgPrecentPower": 82.51826162712774,
                            "avgPercentCapacity": 44.90855581305791,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 357.8,
                                    "airflow": 1333.35,
                                    "percentCapacity": 57.59628638507497,
                                    "timeInterval": 0,
                                    "percentPower": 86.32086851628469,
                                    "percentSystemCapacity": 7.3068502291455815,
                                    "percentSystemPower": 11.989813015213459,
                                    "order": 2
                                },
                                {
                                    "power": 358,
                                    "airflow": 1335.52,
                                    "percentCapacity": 57.689974683197406,
                                    "timeInterval": 1,
                                    "percentPower": 86.36911942098915,
                                    "percentSystemCapacity": 7.3187358281237405,
                                    "percentSystemPower": 11.996514978888815,
                                    "order": 2
                                },
                                {
                                    "power": 357.8,
                                    "airflow": 1333.35,
                                    "percentCapacity": 57.59628638507497,
                                    "timeInterval": 2,
                                    "percentPower": 86.32086851628469,
                                    "percentSystemCapacity": 7.3068502291455815,
                                    "percentSystemPower": 11.989813015213459,
                                    "order": 2
                                },
                                {
                                    "power": 362.5,
                                    "airflow": 1385.49,
                                    "percentCapacity": 59.848256022848915,
                                    "timeInterval": 3,
                                    "percentPower": 87.45476477683957,
                                    "percentSystemCapacity": 7.5925423439771595,
                                    "percentSystemPower": 12.147309161584346,
                                    "order": 2
                                },
                                {
                                    "power": 365.6,
                                    "airflow": 1421.26,
                                    "percentCapacity": 61.393463712517615,
                                    "timeInterval": 4,
                                    "percentPower": 88.20265379975875,
                                    "percentSystemCapacity": 7.7885723637921025,
                                    "percentSystemPower": 12.251189598552378,
                                    "order": 2
                                },
                                {
                                    "power": 368.7,
                                    "airflow": 1458.2,
                                    "percentCapacity": 62.98909013933552,
                                    "timeInterval": 5,
                                    "percentPower": 88.95054282267793,
                                    "percentSystemCapacity": 7.990998666843583,
                                    "percentSystemPower": 12.355070035520408,
                                    "order": 2
                                },
                                {
                                    "power": 374.8,
                                    "airflow": 1534.52,
                                    "percentCapacity": 66.28616646619987,
                                    "timeInterval": 6,
                                    "percentPower": 90.42219541616406,
                                    "percentSystemCapacity": 8.409276379288288,
                                    "percentSystemPower": 12.559479927618794,
                                    "order": 2
                                },
                                {
                                    "power": 382.5,
                                    "airflow": 1638.43,
                                    "percentCapacity": 70.7745401997534,
                                    "timeInterval": 7,
                                    "percentPower": 92.2798552472859,
                                    "percentSystemCapacity": 8.978685914205894,
                                    "percentSystemPower": 12.817505529120032,
                                    "order": 2
                                },
                                {
                                    "power": 389.5,
                                    "airflow": 1741.09,
                                    "percentCapacity": 75.20894124717437,
                                    "timeInterval": 8,
                                    "percentPower": 93.9686369119421,
                                    "percentSystemCapacity": 9.54124830048272,
                                    "percentSystemPower": 13.052074257757523,
                                    "order": 2
                                },
                                {
                                    "power": 385.2,
                                    "airflow": 1677.05,
                                    "percentCapacity": 72.44271322711108,
                                    "timeInterval": 9,
                                    "percentPower": 92.93124246079614,
                                    "percentSystemCapacity": 9.190315712448607,
                                    "percentSystemPower": 12.90798203873735,
                                    "order": 2
                                },
                                {
                                    "power": 389.1,
                                    "airflow": 1734.99,
                                    "percentCapacity": 74.94573497374483,
                                    "timeInterval": 10,
                                    "percentPower": 93.87213510253318,
                                    "percentSystemCapacity": 9.507857105667432,
                                    "percentSystemPower": 13.03867033040681,
                                    "order": 2
                                },
                                {
                                    "power": 377.9,
                                    "airflow": 1575.29,
                                    "percentCapacity": 68.04715126071122,
                                    "timeInterval": 11,
                                    "percentPower": 91.17008443908323,
                                    "percentSystemCapacity": 8.632680576969886,
                                    "percentSystemPower": 12.663360364586824,
                                    "order": 2
                                },
                                {
                                    "power": 384.3,
                                    "airflow": 1664.04,
                                    "percentCapacity": 71.88092797777905,
                                    "timeInterval": 12,
                                    "percentPower": 92.71411338962606,
                                    "percentSystemCapacity": 9.119045827956954,
                                    "percentSystemPower": 12.877823202198247,
                                    "order": 2
                                },
                                {
                                    "power": 376.5,
                                    "airflow": 1556.71,
                                    "percentCapacity": 67.24443503728725,
                                    "timeInterval": 13,
                                    "percentPower": 90.83232810615199,
                                    "percentSystemCapacity": 8.530845413816309,
                                    "percentSystemPower": 12.616446618859326,
                                    "order": 2
                                },
                                {
                                    "power": 372.5,
                                    "airflow": 1505.16,
                                    "percentCapacity": 65.01758933162742,
                                    "timeInterval": 14,
                                    "percentPower": 89.86731001206273,
                                    "percentSystemCapacity": 8.248340601858697,
                                    "percentSystemPower": 12.48240734535219,
                                    "order": 2
                                },
                                {
                                    "power": 374.2,
                                    "airflow": 1526.79,
                                    "percentCapacity": 65.95217807764308,
                                    "timeInterval": 15,
                                    "percentPower": 90.27744270205066,
                                    "percentSystemCapacity": 8.366905537579118,
                                    "percentSystemPower": 12.53937403659272,
                                    "order": 2
                                },
                                {
                                    "power": 378.8,
                                    "airflow": 1587.39,
                                    "percentCapacity": 68.56978952613231,
                                    "timeInterval": 16,
                                    "percentPower": 91.38721351025332,
                                    "percentSystemCapacity": 8.698984149112029,
                                    "percentSystemPower": 12.69351920112593,
                                    "order": 2
                                },
                                {
                                    "power": 374.8,
                                    "airflow": 1534.52,
                                    "percentCapacity": 66.28616646619987,
                                    "timeInterval": 17,
                                    "percentPower": 90.42219541616406,
                                    "percentSystemCapacity": 8.409276379288288,
                                    "percentSystemPower": 12.559479927618794,
                                    "order": 2
                                },
                                {
                                    "power": 375,
                                    "airflow": 1537.11,
                                    "percentCapacity": 66.39798169564584,
                                    "timeInterval": 18,
                                    "percentPower": 90.47044632086852,
                                    "percentSystemCapacity": 8.423461619104565,
                                    "percentSystemPower": 12.566181891294152,
                                    "order": 2
                                },
                                {
                                    "power": 374.3,
                                    "airflow": 1528.08,
                                    "percentCapacity": 66.00769158162674,
                                    "timeInterval": 19,
                                    "percentPower": 90.3015681544029,
                                    "percentSystemCapacity": 8.373948159330661,
                                    "percentSystemPower": 12.542725018430401,
                                    "order": 2
                                },
                                {
                                    "power": 367.9,
                                    "airflow": 1448.55,
                                    "percentCapacity": 62.57234820605122,
                                    "timeInterval": 20,
                                    "percentPower": 88.75753920386006,
                                    "percentSystemCapacity": 7.938129444158734,
                                    "percentSystemPower": 12.32826218081898,
                                    "order": 2
                                },
                                {
                                    "power": 369.3,
                                    "airflow": 1465.49,
                                    "percentCapacity": 63.30395964169453,
                                    "timeInterval": 21,
                                    "percentPower": 89.09529553679133,
                                    "percentSystemCapacity": 8.030944025127292,
                                    "percentSystemPower": 12.37517592654648,
                                    "order": 2
                                },
                                {
                                    "power": 358.3,
                                    "airflow": 1338.78,
                                    "percentCapacity": 57.83085598844471,
                                    "timeInterval": 22,
                                    "percentPower": 86.44149577804583,
                                    "percentSystemCapacity": 7.336608483847518,
                                    "percentSystemPower": 12.006567924401851,
                                    "order": 2
                                },
                                {
                                    "power": 352.9,
                                    "airflow": 1281.52,
                                    "percentCapacity": 55.35743643729565,
                                    "timeInterval": 23,
                                    "percentPower": 85.13872135102532,
                                    "percentSystemCapacity": 7.022822520404397,
                                    "percentSystemPower": 11.825614905167214,
                                    "order": 2
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "tff9o23ah",
                            "avgPower": 372.00833333333327,
                            "avgAirflow": 1505.945,
                            "avgPrecentPower": 89.74869320466426,
                            "avgPercentCapacity": 65.05166519459048,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 404,
                                    "airflow": 1982.9,
                                    "percentCapacity": 85.65422576716557,
                                    "timeInterval": 0,
                                    "percentPower": 97.46682750301568,
                                    "percentSystemCapacity": 10.86637070643294,
                                    "percentSystemPower": 13.537966624220898,
                                    "order": 2
                                },
                                {
                                    "power": 402.9,
                                    "airflow": 1963.01,
                                    "percentCapacity": 84.79534365565496,
                                    "timeInterval": 1,
                                    "percentPower": 97.20144752714113,
                                    "percentSystemCapacity": 10.757410157981214,
                                    "percentSystemPower": 13.501105824006435,
                                    "order": 2
                                },
                                {
                                    "power": 399.7,
                                    "airflow": 1906.69,
                                    "percentCapacity": 82.36229214971988,
                                    "timeInterval": 2,
                                    "percentPower": 96.42943305186972,
                                    "percentSystemCapacity": 10.448745414653745,
                                    "percentSystemPower": 13.393874405200723,
                                    "order": 2
                                },
                                {
                                    "power": 397.6,
                                    "airflow": 1870.91,
                                    "percentCapacity": 80.81678653395308,
                                    "timeInterval": 3,
                                    "percentPower": 95.92279855247287,
                                    "percentSystemCapacity": 10.252677598975305,
                                    "percentSystemPower": 13.323503786609479,
                                    "order": 2
                                },
                                {
                                    "power": 395.1,
                                    "airflow": 1829.49,
                                    "percentCapacity": 79.02758560816983,
                                    "timeInterval": 4,
                                    "percentPower": 95.31966224366707,
                                    "percentSystemCapacity": 10.025693812084237,
                                    "percentSystemPower": 13.239729240667517,
                                    "order": 2
                                },
                                {
                                    "power": 397,
                                    "airflow": 1860.85,
                                    "percentCapacity": 80.38242744388846,
                                    "timeInterval": 5,
                                    "percentPower": 95.77804583835947,
                                    "percentSystemCapacity": 10.197573407091285,
                                    "percentSystemPower": 13.303397895583407,
                                    "order": 2
                                },
                                {
                                    "power": 397.7,
                                    "airflow": 1872.59,
                                    "percentCapacity": 80.88948804133284,
                                    "timeInterval": 6,
                                    "percentPower": 95.94692400482508,
                                    "percentSystemCapacity": 10.26190074614673,
                                    "percentSystemPower": 13.326854768447156,
                                    "order": 2
                                },
                                {
                                    "power": 410.5,
                                    "airflow": 2106.16,
                                    "percentCapacity": 90.97887933375776,
                                    "timeInterval": 7,
                                    "percentPower": 99.03498190591074,
                                    "percentSystemCapacity": 11.54187339202374,
                                    "percentSystemPower": 13.755780443669996,
                                    "order": 2
                                },
                                {
                                    "power": 414,
                                    "airflow": 2176.88,
                                    "percentCapacity": 94.03367646833391,
                                    "timeInterval": 8,
                                    "percentPower": 99.87937273823884,
                                    "percentSystemCapacity": 11.929414786507728,
                                    "percentSystemPower": 13.873064807988742,
                                    "order": 2
                                },
                                {
                                    "power": 414.8,
                                    "airflow": 2193.5,
                                    "percentCapacity": 94.75145618501735,
                                    "timeInterval": 9,
                                    "percentPower": 100.0723763570567,
                                    "percentSystemCapacity": 12.020474631100129,
                                    "percentSystemPower": 13.899872662690168,
                                    "order": 2
                                },
                                {
                                    "power": 413.8,
                                    "airflow": 2172.75,
                                    "percentCapacity": 93.8553877652451,
                                    "timeInterval": 10,
                                    "percentPower": 99.83112183353438,
                                    "percentSystemCapacity": 11.906796507921,
                                    "percentSystemPower": 13.866362844313384,
                                    "order": 2
                                },
                                {
                                    "power": 416.6,
                                    "airflow": 2231.52,
                                    "percentCapacity": 96.39392552968076,
                                    "timeInterval": 11,
                                    "percentPower": 100.50663449939688,
                                    "percentSystemCapacity": 12.228843577444705,
                                    "percentSystemPower": 13.960190335768383,
                                    "order": 2
                                },
                                {
                                    "power": 419.29999999999995,
                                    "airflow": 2290.25,
                                    "percentCapacity": 98.93098509386569,
                                    "timeInterval": 12,
                                    "percentPower": 101.15802171290711,
                                    "percentSystemCapacity": 12.55070311772792,
                                    "percentSystemPower": 14.050666845385699,
                                    "order": 2
                                },
                                {
                                    "power": 418.5,
                                    "airflow": 2272.63,
                                    "percentCapacity": 98.1699045661653,
                                    "timeInterval": 13,
                                    "percentPower": 100.96501809408926,
                                    "percentSystemCapacity": 12.454149992912795,
                                    "percentSystemPower": 14.023858990684271,
                                    "order": 2
                                },
                                {
                                    "power": 420.9,
                                    "airflow": 2326.05,
                                    "percentCapacity": 100.47733719082288,
                                    "timeInterval": 14,
                                    "percentPower": 101.54402895054282,
                                    "percentSystemCapacity": 12.746878320734053,
                                    "percentSystemPower": 14.104282554788552,
                                    "order": 2
                                },
                                {
                                    "power": 415.8999999999999,
                                    "airflow": 2216.63,
                                    "percentCapacity": 95.75062259218382,
                                    "timeInterval": 15,
                                    "percentPower": 100.33775633293122,
                                    "percentSystemCapacity": 12.14723209671775,
                                    "percentSystemPower": 13.93673346290463,
                                    "order": 2
                                },
                                {
                                    "power": 413.2,
                                    "airflow": 2160.43,
                                    "percentCapacity": 93.32327290856864,
                                    "timeInterval": 16,
                                    "percentPower": 99.68636911942099,
                                    "percentSystemCapacity": 11.839290704917603,
                                    "percentSystemPower": 13.846256953287314,
                                    "order": 2
                                },
                                {
                                    "power": 412.3,
                                    "airflow": 2142.13,
                                    "percentCapacity": 92.53276837747731,
                                    "timeInterval": 17,
                                    "percentPower": 99.46924004825091,
                                    "percentSystemCapacity": 11.739004756349187,
                                    "percentSystemPower": 13.816098116748208,
                                    "order": 2
                                },
                                {
                                    "power": 414.6,
                                    "airflow": 2189.33,
                                    "percentCapacity": 94.57131454368249,
                                    "timeInterval": 18,
                                    "percentPower": 100.02412545235224,
                                    "percentSystemCapacity": 11.997621282804962,
                                    "percentSystemPower": 13.893170699014812,
                                    "order": 2
                                },
                                {
                                    "power": 412.1,
                                    "airflow": 2138.1,
                                    "percentCapacity": 92.35833891278773,
                                    "timeInterval": 19,
                                    "percentPower": 99.42098914354645,
                                    "percentSystemCapacity": 11.71687607316438,
                                    "percentSystemPower": 13.809396153072854,
                                    "order": 2
                                },
                                {
                                    "power": 412.3,
                                    "airflow": 2142.13,
                                    "percentCapacity": 92.53276837747731,
                                    "timeInterval": 20,
                                    "percentPower": 99.46924004825091,
                                    "percentSystemCapacity": 11.739004756349187,
                                    "percentSystemPower": 13.816098116748208,
                                    "order": 2
                                },
                                {
                                    "power": 413.4,
                                    "airflow": 2164.53,
                                    "percentCapacity": 93.50018745837616,
                                    "timeInterval": 21,
                                    "percentPower": 99.73462002412545,
                                    "percentSystemCapacity": 11.861734653997194,
                                    "percentSystemPower": 13.85295891696267,
                                    "order": 2
                                },
                                {
                                    "power": 408,
                                    "airflow": 2057.55,
                                    "percentCapacity": 88.87903705178547,
                                    "timeInterval": 22,
                                    "percentPower": 98.43184559710495,
                                    "percentSystemCapacity": 11.275480643077783,
                                    "percentSystemPower": 13.672005897728035,
                                    "order": 2
                                },
                                {
                                    "power": 409.1,
                                    "airflow": 2078.75,
                                    "percentCapacity": 89.79475386292125,
                                    "timeInterval": 23,
                                    "percentPower": 98.69722557297949,
                                    "percentSystemCapacity": 11.39165142441159,
                                    "percentSystemPower": 13.708866697942499,
                                    "order": 2
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "tff9o23ah",
                            "avgPower": 409.7208333333333,
                            "avgAirflow": 2097.74,
                            "avgPrecentPower": 98.84700442299959,
                            "avgPercentCapacity": 90.61511522575142,
                            "automaticShutdownTimer": true
                        }
                    ]
                },
                "reduceRuntime": {
                    "runtimeData": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zh8wf6z6q",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        }
                    ],
                    "implementationCost": 0,
                    "order": 100
                },
                "addPrimaryReceiverVolume": {
                    "increasedVolume": 0,
                    "implementationCost": 0,
                    "order": 100
                }
            },
            {
                "name": "Scenario 2",
                "modificationId": "14hjlw1kc",
                "flowReallocation": {
                    "implementationCost": 0,
                },
                "reduceAirLeaks": {
                    "leakFlow": 2000,
                    "leakReduction": 15,
                    "implementationCost": 1000,
                    "order": 1
                },
                "improveEndUseEfficiency": {
                    "endUseEfficiencyItems": [
                        {
                            "reductionType": "Fixed",
                            "reductionData": [
                                {
                                    "dayTypeId": "hopx028cf",
                                    "dayTypeName": "Weekday",
                                    "data": [
                                        {
                                            "hourInterval": 0,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 1,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 2,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 3,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 4,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 5,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 6,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 7,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 8,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 9,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 10,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 11,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 12,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 13,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 14,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 15,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 16,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 17,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 18,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 19,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 20,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 21,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 22,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 23,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        }
                                    ]
                                },
                                {
                                    "dayTypeId": "mufcn7yvy",
                                    "dayTypeName": "Weekend",
                                    "data": [
                                        {
                                            "hourInterval": 0,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 1,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 2,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 3,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 4,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 5,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 6,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 7,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 8,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 9,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 10,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 11,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 12,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 13,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 14,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 15,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 16,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 17,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 18,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 19,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 20,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 21,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 22,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        },
                                        {
                                            "hourInterval": 23,
                                            "applyReduction": true,
                                            reductionAmount: undefined

                                        }
                                    ]
                                }
                            ],
                            "name": "New Nozzels ",
                            "substituteAuxiliaryEquipment": false,
                            "equipmentDemand": 0,
                            "collapsed": false,
                            "implementationCost": 500,
                            "airflowReduction": 200
                        }
                    ],
                    "order": 100
                },
                "reduceSystemAirPressure": {
                    "averageSystemPressureReduction": 2,
                    "implementationCost": 400,
                    "order": 2
                },
                "adjustCascadingSetPoints": {
                    "order": 100,
                    "setPointData": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 125,
                            "maxFullFlowDischargePressure": 135
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 100,
                            "maxFullFlowDischargePressure": 110
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "controlType": 4,
                            "compressorType": 2,
                            "fullLoadDischargePressure": 125,
                            "maxFullFlowDischargePressure": 135
                        }
                    ],
                    "implementationCost": 0
                },
                "useAutomaticSequencer": {
                    "order": 100,
                    "variance": undefined,
                    "targetPressure": undefined,
                    "implementationCost": 0,
                    "profileSummary": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 0,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 1,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 221.59999999999997,
                                    "airflow": 826.56,
                                    "percentCapacity": 44.510529108176875,
                                    "timeInterval": 2,
                                    "percentPower": 76.38745260255084,
                                    "percentSystemCapacity": 4.529595164066444,
                                    "percentSystemPower": 7.425775752295421,
                                    "order": 3
                                },
                                {
                                    "power": 220.5,
                                    "airflow": 817.19,
                                    "percentCapacity": 44.005787474713046,
                                    "timeInterval": 3,
                                    "percentPower": 76.00827300930713,
                                    "percentSystemCapacity": 4.478230345273023,
                                    "percentSystemPower": 7.3889149520809605,
                                    "order": 3
                                },
                                {
                                    "power": 219.8,
                                    "airflow": 811.28,
                                    "percentCapacity": 43.687415667047524,
                                    "timeInterval": 4,
                                    "percentPower": 75.76697690451569,
                                    "percentSystemCapacity": 4.445831372956337,
                                    "percentSystemPower": 7.365458079217212,
                                    "order": 3
                                },
                                {
                                    "power": 219.3,
                                    "airflow": 807.08,
                                    "percentCapacity": 43.46133679665374,
                                    "timeInterval": 5,
                                    "percentPower": 75.59462254395036,
                                    "percentSystemCapacity": 4.422824552355655,
                                    "percentSystemPower": 7.34870317002882,
                                    "order": 3
                                },
                                {
                                    "power": 219.6,
                                    "airflow": 809.59,
                                    "percentCapacity": 43.59685181315922,
                                    "timeInterval": 6,
                                    "percentPower": 75.69803516028955,
                                    "percentSystemCapacity": 4.436615180679344,
                                    "percentSystemPower": 7.358756115541853,
                                    "order": 3
                                },
                                {
                                    "power": 217.9,
                                    "airflow": 795.43,
                                    "percentCapacity": 42.83412784901619,
                                    "timeInterval": 7,
                                    "percentPower": 75.11203033436745,
                                    "percentSystemCapacity": 4.3589968991463754,
                                    "percentSystemPower": 7.301789424301321,
                                    "order": 3
                                },
                                {
                                    "power": 217.4,
                                    "airflow": 791.31,
                                    "percentCapacity": 42.61217361432519,
                                    "timeInterval": 8,
                                    "percentPower": 74.93967597380214,
                                    "percentSystemCapacity": 4.336409820353018,
                                    "percentSystemPower": 7.285034515112929,
                                    "order": 3
                                },
                                {
                                    "power": 217.9,
                                    "airflow": 795.43,
                                    "percentCapacity": 42.83412784901619,
                                    "timeInterval": 9,
                                    "percentPower": 75.11203033436745,
                                    "percentSystemCapacity": 4.3589968991463754,
                                    "percentSystemPower": 7.301789424301321,
                                    "order": 3
                                },
                                {
                                    "power": 219.8,
                                    "airflow": 811.28,
                                    "percentCapacity": 43.687415667047524,
                                    "timeInterval": 10,
                                    "percentPower": 75.76697690451569,
                                    "percentSystemCapacity": 4.445831372956337,
                                    "percentSystemPower": 7.365458079217212,
                                    "order": 3
                                },
                                {
                                    "power": 218.7,
                                    "airflow": 802.07,
                                    "percentCapacity": 43.19149043314234,
                                    "timeInterval": 11,
                                    "percentPower": 75.38779731127197,
                                    "percentSystemCapacity": 4.395363751334138,
                                    "percentSystemPower": 7.328597279002748,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 12,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 234.2,
                                    "airflow": 941.73,
                                    "percentCapacity": 50.71262960473022,
                                    "timeInterval": 13,
                                    "percentPower": 80.73078248879696,
                                    "percentSystemCapacity": 5.160749297237178,
                                    "percentSystemPower": 7.847999463842906,
                                    "order": 3
                                },
                                {
                                    "power": 244.09999999999997,
                                    "airflow": 1043.81,
                                    "percentCapacity": 56.209670514834585,
                                    "timeInterval": 14,
                                    "percentPower": 84.14339882799034,
                                    "percentSystemCapacity": 5.720153339875483,
                                    "percentSystemPower": 8.17974666577307,
                                    "order": 3
                                },
                                {
                                    "power": 233.6,
                                    "airflow": 935.9,
                                    "percentCapacity": 50.39838547189199,
                                    "timeInterval": 15,
                                    "percentPower": 80.52395725611858,
                                    "percentSystemCapacity": 5.128770376003038,
                                    "percentSystemPower": 7.827893572816835,
                                    "order": 3
                                },
                                {
                                    "power": 235.4,
                                    "airflow": 953.52,
                                    "percentCapacity": 51.347261357457775,
                                    "timeInterval": 16,
                                    "percentPower": 81.14443295415373,
                                    "percentSystemCapacity": 5.225332329066149,
                                    "percentSystemPower": 7.8882112458950475,
                                    "order": 3
                                },
                                {
                                    "power": 235.90000000000003,
                                    "airflow": 958.47,
                                    "percentCapacity": 51.61414247027303,
                                    "timeInterval": 17,
                                    "percentPower": 81.31678731471906,
                                    "percentSystemCapacity": 5.2524913726050535,
                                    "percentSystemPower": 7.904966155083441,
                                    "order": 3
                                },
                                {
                                    "power": 236.8,
                                    "airflow": 967.46,
                                    "percentCapacity": 52.09821949879083,
                                    "timeInterval": 18,
                                    "percentPower": 81.62702516373665,
                                    "percentSystemCapacity": 5.30175326661851,
                                    "percentSystemPower": 7.935124991622547,
                                    "order": 3
                                },
                                {
                                    "power": 237,
                                    "airflow": 969.47,
                                    "percentCapacity": 52.20644291424308,
                                    "timeInterval": 19,
                                    "percentPower": 81.69596690796277,
                                    "percentSystemCapacity": 5.312766576707003,
                                    "percentSystemPower": 7.941826955297902,
                                    "order": 3
                                },
                                {
                                    "power": 237.39999999999998,
                                    "airflow": 973.51,
                                    "percentCapacity": 52.423606143365454,
                                    "timeInterval": 20,
                                    "percentPower": 81.83385039641502,
                                    "percentSystemCapacity": 5.334866100845552,
                                    "percentSystemPower": 7.955230882648616,
                                    "order": 3
                                },
                                {
                                    "power": 236.4,
                                    "airflow": 963.46,
                                    "percentCapacity": 51.88248472163535,
                                    "timeInterval": 21,
                                    "percentPower": 81.48914167528439,
                                    "percentSystemCapacity": 5.27979910829005,
                                    "percentSystemPower": 7.921721064271832,
                                    "order": 3
                                },
                                {
                                    "power": 235.6,
                                    "airflow": 955.5,
                                    "percentCapacity": 51.45383931284695,
                                    "timeInterval": 22,
                                    "percentPower": 81.21337469837985,
                                    "percentSystemCapacity": 5.236178189607452,
                                    "percentSystemPower": 7.894913209570404,
                                    "order": 3
                                },
                                {
                                    "power": 236.8,
                                    "airflow": 967.46,
                                    "percentCapacity": 52.09821949879083,
                                    "timeInterval": 23,
                                    "percentPower": 81.62702516373665,
                                    "percentSystemCapacity": 5.30175326661851,
                                    "percentSystemPower": 7.935124991622547,
                                    "order": 3
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "xnkj5gkbf",
                            "avgPower": 228.0958333333333,
                            "avgAirflow": 887.8091666666666,
                            "avgPrecentPower": 78.62662300356196,
                            "avgPercentCapacity": 47.80876168491161,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zh8wf6z6q",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 240.5,
                                    "airflow": 1005.38,
                                    "percentCapacity": 54.13975309537386,
                                    "timeInterval": 0,
                                    "percentPower": 82.90244743192002,
                                    "percentSystemCapacity": 5.509509069383454,
                                    "percentSystemPower": 8.059111319616648,
                                    "order": 3
                                },
                                {
                                    "power": 239.80000000000004,
                                    "airflow": 998.08,
                                    "percentCapacity": 53.747017098325166,
                                    "timeInterval": 1,
                                    "percentPower": 82.66115132712858,
                                    "percentSystemCapacity": 5.4695424567947075,
                                    "percentSystemPower": 8.0356544467529,
                                    "order": 3
                                },
                                {
                                    "power": 239.80000000000004,
                                    "airflow": 998.08,
                                    "percentCapacity": 53.747017098325166,
                                    "timeInterval": 2,
                                    "percentPower": 82.66115132712858,
                                    "percentSystemCapacity": 5.4695424567947075,
                                    "percentSystemPower": 8.0356544467529,
                                    "order": 3
                                },
                                {
                                    "power": 237.7,
                                    "airflow": 976.54,
                                    "percentCapacity": 52.587108861529245,
                                    "timeInterval": 3,
                                    "percentPower": 81.93726301275422,
                                    "percentSystemCapacity": 5.351504885788021,
                                    "percentSystemPower": 7.965283828161651,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 4,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 234.2,
                                    "airflow": 941.73,
                                    "percentCapacity": 50.71262960473022,
                                    "timeInterval": 5,
                                    "percentPower": 80.73078248879696,
                                    "percentSystemCapacity": 5.160749297237178,
                                    "percentSystemPower": 7.847999463842906,
                                    "order": 3
                                },
                                {
                                    "power": 232.3,
                                    "airflow": 923.38,
                                    "percentCapacity": 49.72441942210099,
                                    "timeInterval": 6,
                                    "percentPower": 80.07583591864874,
                                    "percentSystemCapacity": 5.060184506074175,
                                    "percentSystemPower": 7.784330808927016,
                                    "order": 3
                                },
                                {
                                    "power": 230.9,
                                    "airflow": 910.1,
                                    "percentCapacity": 49.008959083462614,
                                    "timeInterval": 7,
                                    "percentPower": 79.59324370906583,
                                    "percentSystemCapacity": 4.9873759873953345,
                                    "percentSystemPower": 7.737417063199518,
                                    "order": 3
                                },
                                {
                                    "power": 230.1,
                                    "airflow": 902.59,
                                    "percentCapacity": 48.604844760665756,
                                    "timeInterval": 8,
                                    "percentPower": 79.31747673216132,
                                    "percentSystemCapacity": 4.946251464300542,
                                    "percentSystemPower": 7.71060920849809,
                                    "order": 3
                                },
                                {
                                    "power": 232.7,
                                    "airflow": 927.21,
                                    "percentCapacity": 49.93079741981514,
                                    "timeInterval": 9,
                                    "percentPower": 80.213719407101,
                                    "percentSystemCapacity": 5.081186475701267,
                                    "percentSystemPower": 7.79773473627773,
                                    "order": 3
                                },
                                {
                                    "power": 253,
                                    "airflow": 1146.12,
                                    "percentCapacity": 61.71900903391578,
                                    "timeInterval": 10,
                                    "percentPower": 87.21130644605309,
                                    "percentSystemCapacity": 6.28080884348869,
                                    "percentSystemPower": 8.477984049326453,
                                    "order": 3
                                },
                                {
                                    "power": 234.3,
                                    "airflow": 942.71,
                                    "percentCapacity": 50.76520140904777,
                                    "timeInterval": 11,
                                    "percentPower": 80.76525336091002,
                                    "percentSystemCapacity": 5.166099244662522,
                                    "percentSystemPower": 7.851350445680586,
                                    "order": 3
                                },
                                {
                                    "power": 274.9,
                                    "airflow": 1453.51,
                                    "percentCapacity": 78.27177875554571,
                                    "timeInterval": 12,
                                    "percentPower": 94.76042743881419,
                                    "percentSystemCapacity": 7.965294451394586,
                                    "percentSystemPower": 9.21184907177803,
                                    "order": 3
                                },
                                {
                                    "power": 255.6,
                                    "airflow": 1178.17,
                                    "percentCapacity": 63.44455831104607,
                                    "timeInterval": 13,
                                    "percentPower": 88.10754912099276,
                                    "percentSystemCapacity": 6.456408635664871,
                                    "percentSystemPower": 8.565109577106092,
                                    "order": 3
                                },
                                {
                                    "power": 244.8,
                                    "airflow": 1051.47,
                                    "percentCapacity": 56.62221217638903,
                                    "timeInterval": 14,
                                    "percentPower": 84.3846949327818,
                                    "percentSystemCapacity": 5.762135467533671,
                                    "percentSystemPower": 8.203203538636823,
                                    "order": 3
                                },
                                {
                                    "power": 258,
                                    "airflow": 1208.69,
                                    "percentCapacity": 65.08833556854556,
                                    "timeInterval": 15,
                                    "percentPower": 88.9348500517063,
                                    "percentSystemCapacity": 6.623686932857799,
                                    "percentSystemPower": 8.645533141210375,
                                    "order": 3
                                },
                                {
                                    "power": 235.2,
                                    "airflow": 951.54,
                                    "percentCapacity": 51.240915074072156,
                                    "timeInterval": 16,
                                    "percentPower": 81.07549120992759,
                                    "percentSystemCapacity": 5.214510044528277,
                                    "percentSystemPower": 7.8815092822196915,
                                    "order": 3
                                },
                                {
                                    "power": 236.09999999999997,
                                    "airflow": 960.46,
                                    "percentCapacity": 51.721303290950196,
                                    "timeInterval": 17,
                                    "percentPower": 81.38572905894517,
                                    "percentSystemCapacity": 5.263396548185802,
                                    "percentSystemPower": 7.911668118758795,
                                    "order": 3
                                },
                                {
                                    "power": 235.90000000000003,
                                    "airflow": 958.47,
                                    "percentCapacity": 51.61414247027303,
                                    "timeInterval": 18,
                                    "percentPower": 81.31678731471906,
                                    "percentSystemCapacity": 5.2524913726050535,
                                    "percentSystemPower": 7.904966155083441,
                                    "order": 3
                                },
                                {
                                    "power": 236.3,
                                    "airflow": 962.46,
                                    "percentCapacity": 51.82869874245269,
                                    "timeInterval": 19,
                                    "percentPower": 81.45467080317131,
                                    "percentSystemCapacity": 5.274325600873227,
                                    "percentSystemPower": 7.918370082434153,
                                    "order": 3
                                },
                                {
                                    "power": 237.6,
                                    "airflow": 975.53,
                                    "percentCapacity": 52.53254770729492,
                                    "timeInterval": 20,
                                    "percentPower": 81.90279214064114,
                                    "percentSystemCapacity": 5.34595249301001,
                                    "percentSystemPower": 7.961932846323973,
                                    "order": 3
                                },
                                {
                                    "power": 236.6,
                                    "airflow": 965.46,
                                    "percentCapacity": 51.990233722839974,
                                    "timeInterval": 21,
                                    "percentPower": 81.55808341951051,
                                    "percentSystemCapacity": 5.290764139813341,
                                    "percentSystemPower": 7.928423027947189,
                                    "order": 3
                                },
                                {
                                    "power": 245.3,
                                    "airflow": 1056.98,
                                    "percentCapacity": 56.91895088098984,
                                    "timeInterval": 22,
                                    "percentPower": 84.55704929334712,
                                    "percentSystemCapacity": 5.792332956269078,
                                    "percentSystemPower": 8.219958447825213,
                                    "order": 3
                                },
                                {
                                    "power": 272.2,
                                    "airflow": 1410.47,
                                    "percentCapacity": 75.95436940122183,
                                    "timeInterval": 23,
                                    "percentPower": 93.82971389176144,
                                    "percentSystemCapacity": 7.729464268855157,
                                    "percentSystemPower": 9.121372562160714,
                                    "order": 3
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "xnkj5gkbf",
                            "avgPower": 242.14166666666674,
                            "avgAirflow": 1032.5275,
                            "avgPrecentPower": 83.46834424910948,
                            "avgPercentCapacity": 55.60197294567532,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 266.9,
                                    "airflow": 1330.59,
                                    "percentCapacity": 71.65283688756729,
                                    "timeInterval": 0,
                                    "percentPower": 92.00275766976903,
                                    "percentSystemCapacity": 7.2917206324097155,
                                    "percentSystemPower": 8.943770524763755,
                                    "order": 4
                                },
                                {
                                    "power": 267.1,
                                    "airflow": 1333.5,
                                    "percentCapacity": 71.80951355352217,
                                    "timeInterval": 1,
                                    "percentPower": 92.07169941399518,
                                    "percentSystemCapacity": 7.307664767036972,
                                    "percentSystemPower": 8.950472488439114,
                                    "order": 4
                                },
                                {
                                    "power": 267.6,
                                    "airflow": 1340.81,
                                    "percentCapacity": 72.20308247338241,
                                    "timeInterval": 2,
                                    "percentPower": 92.2440537745605,
                                    "percentSystemCapacity": 7.347716141663259,
                                    "percentSystemPower": 8.967227397627505,
                                    "order": 4
                                },
                                {
                                    "power": 268.6,
                                    "airflow": 1355.58,
                                    "percentCapacity": 72.99835867669645,
                                    "timeInterval": 3,
                                    "percentPower": 92.58876249569114,
                                    "percentSystemCapacity": 7.428647088043913,
                                    "percentSystemPower": 9.00073721600429,
                                    "order": 4
                                },
                                {
                                    "power": 267.4,
                                    "airflow": 1337.88,
                                    "percentCapacity": 72.04533200341463,
                                    "timeInterval": 4,
                                    "percentPower": 92.17511203033435,
                                    "percentSystemCapacity": 7.331662731824911,
                                    "percentSystemPower": 8.960525433952148,
                                    "order": 4
                                },
                                {
                                    "power": 267,
                                    "airflow": 1332.05,
                                    "percentCapacity": 71.7311218015972,
                                    "timeInterval": 5,
                                    "percentPower": 92.0372285418821,
                                    "percentSystemCapacity": 7.299687263566747,
                                    "percentSystemPower": 8.947121506601436,
                                    "order": 4
                                },
                                {
                                    "power": 266.2,
                                    "airflow": 1320.47,
                                    "percentCapacity": 71.10781586707171,
                                    "timeInterval": 6,
                                    "percentPower": 91.76146156497758,
                                    "percentSystemCapacity": 7.236256798835607,
                                    "percentSystemPower": 8.920313651900006,
                                    "order": 4
                                },
                                {
                                    "power": 265.1,
                                    "airflow": 1304.76,
                                    "percentCapacity": 70.26173374702722,
                                    "timeInterval": 7,
                                    "percentPower": 91.38228197173387,
                                    "percentSystemCapacity": 7.150155609832834,
                                    "percentSystemPower": 8.883452851685545,
                                    "order": 4
                                },
                                {
                                    "power": 263.8,
                                    "airflow": 1286.49,
                                    "percentCapacity": 69.27783665336618,
                                    "timeInterval": 8,
                                    "percentPower": 90.93416063426403,
                                    "percentSystemCapacity": 7.050029738343981,
                                    "percentSystemPower": 8.839890087795725,
                                    "order": 4
                                },
                                {
                                    "power": 263.3,
                                    "airflow": 1279.55,
                                    "percentCapacity": 68.90394602683094,
                                    "timeInterval": 9,
                                    "percentPower": 90.76180627369872,
                                    "percentSystemCapacity": 7.011980916912816,
                                    "percentSystemPower": 8.823135178607334,
                                    "order": 4
                                },
                                {
                                    "power": 262.5,
                                    "airflow": 1268.53,
                                    "percentCapacity": 68.31086658292591,
                                    "timeInterval": 10,
                                    "percentPower": 90.4860392967942,
                                    "percentSystemCapacity": 6.951626438212045,
                                    "percentSystemPower": 8.796327323905905,
                                    "order": 4
                                },
                                {
                                    "power": 261.3,
                                    "airflow": 1252.23,
                                    "percentCapacity": 67.43292479012766,
                                    "timeInterval": 11,
                                    "percentPower": 90.07238883143744,
                                    "percentSystemCapacity": 6.862283063090041,
                                    "percentSystemPower": 8.756115541853763,
                                    "order": 4
                                },
                                {
                                    "power": 260.7,
                                    "airflow": 1244.17,
                                    "percentCapacity": 66.99911807866474,
                                    "timeInterval": 12,
                                    "percentPower": 89.86556359875904,
                                    "percentSystemCapacity": 6.818136906624312,
                                    "percentSystemPower": 8.736009650827693,
                                    "order": 4
                                },
                                {
                                    "power": 254.9,
                                    "airflow": 1169.44,
                                    "percentCapacity": 62.97445389261185,
                                    "timeInterval": 13,
                                    "percentPower": 87.8662530162013,
                                    "percentSystemCapacity": 6.408568658405316,
                                    "percentSystemPower": 8.541652704242344,
                                    "order": 4
                                },
                                {
                                    "power": 258.4,
                                    "airflow": 1213.87,
                                    "percentCapacity": 65.36722685823584,
                                    "timeInterval": 14,
                                    "percentPower": 89.07273354015855,
                                    "percentSystemCapacity": 6.652068186965364,
                                    "percentSystemPower": 8.65893706856109,
                                    "order": 4
                                },
                                {
                                    "power": 246.1,
                                    "airflow": 1065.87,
                                    "percentCapacity": 57.39735972211846,
                                    "timeInterval": 15,
                                    "percentPower": 84.83281627025163,
                                    "percentSystemCapacity": 5.841018029590858,
                                    "percentSystemPower": 8.246766302526641,
                                    "order": 4
                                },
                                {
                                    "power": 244.8,
                                    "airflow": 1051.47,
                                    "percentCapacity": 56.62221217638903,
                                    "timeInterval": 16,
                                    "percentPower": 84.3846949327818,
                                    "percentSystemCapacity": 5.762135467533671,
                                    "percentSystemPower": 8.203203538636823,
                                    "order": 4
                                },
                                {
                                    "power": 246.3,
                                    "airflow": 1068.1,
                                    "percentCapacity": 57.517666091521576,
                                    "timeInterval": 17,
                                    "percentPower": 84.90175801447776,
                                    "percentSystemCapacity": 5.853260956376347,
                                    "percentSystemPower": 8.253468266201997,
                                    "order": 4
                                },
                                {
                                    "power": 248.6,
                                    "airflow": 1094.18,
                                    "percentCapacity": 58.92186566214392,
                                    "timeInterval": 18,
                                    "percentPower": 85.69458807307824,
                                    "percentSystemCapacity": 5.996158731619972,
                                    "percentSystemPower": 8.330540848468601,
                                    "order": 4
                                },
                                {
                                    "power": 248.6,
                                    "airflow": 1094.18,
                                    "percentCapacity": 58.92186566214392,
                                    "timeInterval": 19,
                                    "percentPower": 85.69458807307824,
                                    "percentSystemCapacity": 5.996158731619972,
                                    "percentSystemPower": 8.330540848468601,
                                    "order": 4
                                },
                                {
                                    "power": 250.5,
                                    "airflow": 1116.27,
                                    "percentCapacity": 60.11137531961417,
                                    "timeInterval": 20,
                                    "percentPower": 86.34953464322646,
                                    "percentSystemCapacity": 6.117208678678404,
                                    "percentSystemPower": 8.394209503384491,
                                    "order": 4
                                },
                                {
                                    "power": 251.5,
                                    "airflow": 1128.1,
                                    "percentCapacity": 60.74852536346383,
                                    "timeInterval": 21,
                                    "percentPower": 86.69424336435712,
                                    "percentSystemCapacity": 6.182047983338027,
                                    "percentSystemPower": 8.427719321761277,
                                    "order": 4
                                },
                                {
                                    "power": 250.60000000000002,
                                    "airflow": 1117.44,
                                    "percentCapacity": 60.174741613705905,
                                    "timeInterval": 22,
                                    "percentPower": 86.38400551533954,
                                    "percentSystemCapacity": 6.123657122788901,
                                    "percentSystemPower": 8.397560485222172,
                                    "order": 4
                                },
                                {
                                    "power": 250.5,
                                    "airflow": 1116.27,
                                    "percentCapacity": 60.11137531961417,
                                    "timeInterval": 23,
                                    "percentPower": 86.34953464322646,
                                    "percentSystemCapacity": 6.117208678678404,
                                    "percentSystemPower": 8.394209503384491,
                                    "order": 4
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "il2g6xrsz",
                            "avgPower": 258.2625000000001,
                            "avgAirflow": 1217.5749999999998,
                            "avgPrecentPower": 89.0253360910031,
                            "avgPercentCapacity": 65.56679811765655,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 257,
                                    "airflow": 1195.86,
                                    "percentCapacity": 64.3973248342344,
                                    "timeInterval": 0,
                                    "percentPower": 88.59014133057566,
                                    "percentSystemCapacity": 6.553366517819666,
                                    "percentSystemPower": 8.612023322833592,
                                    "order": 4
                                },
                                {
                                    "power": 256.4,
                                    "airflow": 1188.24,
                                    "percentCapacity": 63.986925754595525,
                                    "timeInterval": 1,
                                    "percentPower": 88.38331609789726,
                                    "percentSystemCapacity": 6.511602429103676,
                                    "percentSystemPower": 8.59191743180752,
                                    "order": 4
                                },
                                {
                                    "power": 258.1,
                                    "airflow": 1209.98,
                                    "percentCapacity": 65.15792418627093,
                                    "timeInterval": 2,
                                    "percentPower": 88.96932092381937,
                                    "percentSystemCapacity": 6.630768589100455,
                                    "percentSystemPower": 8.648884123048054,
                                    "order": 4
                                },
                                {
                                    "power": 258.3,
                                    "airflow": 1212.57,
                                    "percentCapacity": 65.29736965295707,
                                    "timeInterval": 3,
                                    "percentPower": 89.0382626680455,
                                    "percentSystemCapacity": 6.644959198023963,
                                    "percentSystemPower": 8.65558608672341,
                                    "order": 4
                                },
                                {
                                    "power": 256.4,
                                    "airflow": 1188.24,
                                    "percentCapacity": 63.986925754595525,
                                    "timeInterval": 4,
                                    "percentPower": 88.38331609789726,
                                    "percentSystemCapacity": 6.511602429103676,
                                    "percentSystemPower": 8.59191743180752,
                                    "order": 4
                                },
                                {
                                    "power": 254.2,
                                    "airflow": 1160.78,
                                    "percentCapacity": 62.508458827265656,
                                    "timeInterval": 5,
                                    "percentPower": 87.62495691140984,
                                    "percentSystemCapacity": 6.361146867724261,
                                    "percentSystemPower": 8.518195831378595,
                                    "order": 4
                                },
                                {
                                    "power": 246.70000000000002,
                                    "airflow": 1072.59,
                                    "percentCapacity": 57.7591313815994,
                                    "timeInterval": 6,
                                    "percentPower": 85.03964150293002,
                                    "percentSystemCapacity": 5.877833569466796,
                                    "percentSystemPower": 8.266872193552711,
                                    "order": 4
                                },
                                {
                                    "power": 241.7,
                                    "airflow": 1018.01,
                                    "percentCapacity": 54.82028805653203,
                                    "timeInterval": 7,
                                    "percentPower": 83.31609789727679,
                                    "percentSystemCapacity": 5.578763421798552,
                                    "percentSystemPower": 8.099323101668789,
                                    "order": 4
                                },
                                {
                                    "power": 226.9,
                                    "airflow": 873.19,
                                    "percentCapacity": 47.02165345264044,
                                    "timeInterval": 8,
                                    "percentPower": 78.21440882454326,
                                    "percentSystemCapacity": 4.785138670624359,
                                    "percentSystemPower": 7.603377789692381,
                                    "order": 4
                                },
                                {
                                    "power": 228.2,
                                    "airflow": 885.02,
                                    "percentCapacity": 47.658505643248276,
                                    "timeInterval": 9,
                                    "percentPower": 78.66253016201308,
                                    "percentSystemCapacity": 4.849947664374838,
                                    "percentSystemPower": 7.6469405535822,
                                    "order": 4
                                },
                                {
                                    "power": 220.7,
                                    "airflow": 818.88,
                                    "percentCapacity": 44.097152773355845,
                                    "timeInterval": 10,
                                    "percentPower": 76.07721475353326,
                                    "percentSystemCapacity": 4.487528096236399,
                                    "percentSystemPower": 7.395616915756317,
                                    "order": 4
                                },
                                {
                                    "power": 188.8,
                                    "airflow": 584.2,
                                    "percentCapacity": 31.459363811133294,
                                    "timeInterval": 11,
                                    "percentPower": 65.0810065494657,
                                    "percentSystemCapacity": 3.2014488490395947,
                                    "percentSystemPower": 6.326653709536894,
                                    "order": 4
                                },
                                {
                                    "power": 220.4,
                                    "airflow": 816.34,
                                    "percentCapacity": 43.96017203258482,
                                    "timeInterval": 12,
                                    "percentPower": 75.97380213719407,
                                    "percentSystemCapacity": 4.473588309102916,
                                    "percentSystemPower": 7.3855639702432825,
                                    "order": 4
                                },
                                {
                                    "power": 219.3,
                                    "airflow": 807.08,
                                    "percentCapacity": 43.46133679665374,
                                    "timeInterval": 13,
                                    "percentPower": 75.59462254395036,
                                    "percentSystemCapacity": 4.422824552355655,
                                    "percentSystemPower": 7.34870317002882,
                                    "order": 4
                                },
                                {
                                    "power": 223.4,
                                    "airflow": 842.12,
                                    "percentCapacity": 45.348418229539014,
                                    "timeInterval": 14,
                                    "percentPower": 77.007928300586,
                                    "percentSystemCapacity": 4.614862596024437,
                                    "percentSystemPower": 7.486093425373635,
                                    "order": 4
                                },
                                {
                                    "power": 230.3,
                                    "airflow": 904.46,
                                    "percentCapacity": 48.70555527659653,
                                    "timeInterval": 15,
                                    "percentPower": 79.38641847638746,
                                    "percentSystemCapacity": 4.95650022734764,
                                    "percentSystemPower": 7.717311172173448,
                                    "order": 4
                                },
                                {
                                    "power": 235.3,
                                    "airflow": 952.53,
                                    "percentCapacity": 51.29405930912889,
                                    "timeInterval": 16,
                                    "percentPower": 81.10996208204068,
                                    "percentSystemCapacity": 5.219918245125623,
                                    "percentSystemPower": 7.8848602640573695,
                                    "order": 4
                                },
                                {
                                    "power": 238.6,
                                    "airflow": 985.71,
                                    "percentCapacity": 53.08089040369188,
                                    "timeInterval": 17,
                                    "percentPower": 82.2475008617718,
                                    "percentSystemCapacity": 5.401754355526952,
                                    "percentSystemPower": 7.995442664700758,
                                    "order": 4
                                },
                                {
                                    "power": 239.5,
                                    "airflow": 994.97,
                                    "percentCapacity": 53.57964570073679,
                                    "timeInterval": 18,
                                    "percentPower": 82.55773871078938,
                                    "percentSystemCapacity": 5.4525099773272805,
                                    "percentSystemPower": 8.025601501239864,
                                    "order": 4
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 19,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 4
                                },
                                {
                                    "power": 244.09999999999997,
                                    "airflow": 1043.81,
                                    "percentCapacity": 56.209670514834585,
                                    "timeInterval": 20,
                                    "percentPower": 84.14339882799034,
                                    "percentSystemCapacity": 5.720153339875483,
                                    "percentSystemPower": 8.17974666577307,
                                    "order": 4
                                },
                                {
                                    "power": 280.8,
                                    "airflow": 1553.59,
                                    "percentCapacity": 83.66120366492575,
                                    "timeInterval": 21,
                                    "percentPower": 96.794208893485,
                                    "percentSystemCapacity": 8.513746997247212,
                                    "percentSystemPower": 9.40955700020106,
                                    "order": 4
                                },
                                {
                                    "power": 272.3,
                                    "airflow": 1412.04,
                                    "percentCapacity": 76.03862615847086,
                                    "timeInterval": 22,
                                    "percentPower": 93.86418476387452,
                                    "percentSystemCapacity": 7.738038622110937,
                                    "percentSystemPower": 9.124723543998392,
                                    "order": 4
                                },
                                {
                                    "power": 281.6,
                                    "airflow": 1567.84,
                                    "percentCapacity": 84.42861319256832,
                                    "timeInterval": 23,
                                    "percentPower": 97.06997587038953,
                                    "percentSystemCapacity": 8.591842103167435,
                                    "percentSystemPower": 9.436364854902488,
                                    "order": 4
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "il2g6xrsz",
                            "avgPower": 242.47083333333342,
                            "avgAirflow": 1053.8058333333336,
                            "avgPrecentPower": 83.581810869815,
                            "avgPercentCapacity": 56.74776841592321,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 390.2,
                                    "airflow": 1189.74,
                                    "percentCapacity": 38.44070518099008,
                                    "timeInterval": 0,
                                    "percentPower": 78.44792923200643,
                                    "percentSystemCapacity": 6.5198368333606025,
                                    "percentSystemPower": 13.075531130621274,
                                    "order": 5
                                },
                                {
                                    "power": 387.4,
                                    "airflow": 1166.34,
                                    "percentCapacity": 37.684498272667845,
                                    "timeInterval": 1,
                                    "percentPower": 77.88500201045436,
                                    "percentSystemCapacity": 6.391578373186485,
                                    "percentSystemPower": 12.981703639166275,
                                    "order": 5
                                },
                                {
                                    "power": 383.9,
                                    "airflow": 1137.82,
                                    "percentCapacity": 36.763238029784695,
                                    "timeInterval": 2,
                                    "percentPower": 77.18134298351428,
                                    "percentSystemCapacity": 6.235325608405504,
                                    "percentSystemPower": 12.86441927484753,
                                    "order": 5
                                },
                                {
                                    "power": 382,
                                    "airflow": 1122.68,
                                    "percentCapacity": 36.273892442063584,
                                    "timeInterval": 3,
                                    "percentPower": 76.79935665460394,
                                    "percentSystemCapacity": 6.152328863885729,
                                    "percentSystemPower": 12.800750619931641,
                                    "order": 5
                                },
                                {
                                    "power": 380.3,
                                    "airflow": 1109.32,
                                    "percentCapacity": 35.84228161298175,
                                    "timeInterval": 4,
                                    "percentPower": 76.45757941294733,
                                    "percentSystemCapacity": 6.0791243748453825,
                                    "percentSystemPower": 12.743783928691107,
                                    "order": 5
                                },
                                {
                                    "power": 378.9,
                                    "airflow": 1098.45,
                                    "percentCapacity": 35.49115640525682,
                                    "timeInterval": 5,
                                    "percentPower": 76.17611580217128,
                                    "percentSystemCapacity": 6.019570861150255,
                                    "percentSystemPower": 12.696870182963607,
                                    "order": 5
                                },
                                {
                                    "power": 371.1,
                                    "airflow": 1040.01,
                                    "percentCapacity": 33.603050016740625,
                                    "timeInterval": 6,
                                    "percentPower": 74.60796139927625,
                                    "percentSystemCapacity": 5.699333614742011,
                                    "percentSystemPower": 12.435493599624692,
                                    "order": 5
                                },
                                {
                                    "power": 364,
                                    "airflow": 989.73,
                                    "percentCapacity": 31.978243278121287,
                                    "timeInterval": 7,
                                    "percentPower": 73.1805388017692,
                                    "percentSystemCapacity": 5.423753997467415,
                                    "percentSystemPower": 12.19757388914952,
                                    "order": 5
                                },
                                {
                                    "power": 381.2,
                                    "airflow": 1116.37,
                                    "percentCapacity": 36.070057762774965,
                                    "timeInterval": 8,
                                    "percentPower": 76.63852030558907,
                                    "percentSystemCapacity": 6.117756947379906,
                                    "percentSystemPower": 12.773942765230212,
                                    "order": 5
                                },
                                {
                                    "power": 386,
                                    "airflow": 1154.83,
                                    "percentCapacity": 37.31285401753128,
                                    "timeInterval": 9,
                                    "percentPower": 77.60353839967833,
                                    "percentSystemCapacity": 6.328544672526267,
                                    "percentSystemPower": 12.934789893438777,
                                    "order": 5
                                },
                                {
                                    "power": 389.6,
                                    "airflow": 1184.68,
                                    "percentCapacity": 38.27718731392365,
                                    "timeInterval": 10,
                                    "percentPower": 78.32730197024529,
                                    "percentSystemCapacity": 6.492102955753709,
                                    "percentSystemPower": 13.055425239595204,
                                    "order": 5
                                },
                                {
                                    "power": 380.7,
                                    "airflow": 1112.45,
                                    "percentCapacity": 35.94331556595818,
                                    "timeInterval": 11,
                                    "percentPower": 76.53799758745477,
                                    "percentSystemCapacity": 6.096260503980742,
                                    "percentSystemPower": 12.75718785604182,
                                    "order": 5
                                },
                                {
                                    "power": 386.1,
                                    "airflow": 1155.65,
                                    "percentCapacity": 37.33925982807915,
                                    "timeInterval": 12,
                                    "percentPower": 77.6236429433052,
                                    "percentSystemCapacity": 6.333023299424869,
                                    "percentSystemPower": 12.938140875276458,
                                    "order": 5
                                },
                                {
                                    "power": 395.8,
                                    "airflow": 1238.22,
                                    "percentCapacity": 40.00713377964704,
                                    "timeInterval": 13,
                                    "percentPower": 79.57378367511058,
                                    "percentSystemCapacity": 6.785515072775515,
                                    "percentSystemPower": 13.263186113531267,
                                    "order": 5
                                },
                                {
                                    "power": 398.6,
                                    "airflow": 1263.34,
                                    "percentCapacity": 40.8187658805955,
                                    "timeInterval": 14,
                                    "percentPower": 80.13671089666265,
                                    "percentSystemCapacity": 6.923174068415337,
                                    "percentSystemPower": 13.357013604986262,
                                    "order": 5
                                },
                                {
                                    "power": 406.7,
                                    "airflow": 1339.57,
                                    "percentCapacity": 43.28182799815914,
                                    "timeInterval": 15,
                                    "percentPower": 81.76517893043828,
                                    "percentSystemCapacity": 7.340928192366427,
                                    "percentSystemPower": 13.628443133838214,
                                    "order": 5
                                },
                                {
                                    "power": 400.1,
                                    "airflow": 1277.05,
                                    "percentCapacity": 41.26172226860882,
                                    "timeInterval": 16,
                                    "percentPower": 80.43827905106555,
                                    "percentSystemCapacity": 6.998302850797035,
                                    "percentSystemPower": 13.407278332551439,
                                    "order": 5
                                },
                                {
                                    "power": 393.4,
                                    "airflow": 1217.16,
                                    "percentCapacity": 39.32674712720683,
                                    "timeInterval": 17,
                                    "percentPower": 79.09127462806595,
                                    "percentSystemCapacity": 6.670116306373583,
                                    "percentSystemPower": 13.182762549426982,
                                    "order": 5
                                },
                                {
                                    "power": 393.4,
                                    "airflow": 1217.16,
                                    "percentCapacity": 39.32674712720683,
                                    "timeInterval": 18,
                                    "percentPower": 79.09127462806595,
                                    "percentSystemCapacity": 6.670116306373583,
                                    "percentSystemPower": 13.182762549426982,
                                    "order": 5
                                },
                                {
                                    "power": 388.9,
                                    "airflow": 1178.81,
                                    "percentCapacity": 38.087439145957624,
                                    "timeInterval": 19,
                                    "percentPower": 78.18657016485726,
                                    "percentSystemCapacity": 6.459920219023392,
                                    "percentSystemPower": 13.031968366731453,
                                    "order": 5
                                },
                                {
                                    "power": 384.1,
                                    "airflow": 1139.43,
                                    "percentCapacity": 36.81518243913984,
                                    "timeInterval": 20,
                                    "percentPower": 77.22155207076801,
                                    "percentSystemCapacity": 6.244135776476205,
                                    "percentSystemPower": 12.871121238522889,
                                    "order": 5
                                },
                                {
                                    "power": 384.7,
                                    "airflow": 1144.27,
                                    "percentCapacity": 36.971517990591664,
                                    "timeInterval": 21,
                                    "percentPower": 77.34217933252914,
                                    "percentSystemCapacity": 6.270651478566483,
                                    "percentSystemPower": 12.891227129548957,
                                    "order": 5
                                },
                                {
                                    "power": 379.9,
                                    "airflow": 1106.2,
                                    "percentCapacity": 35.741565683899566,
                                    "timeInterval": 22,
                                    "percentPower": 76.37716123843988,
                                    "percentSystemCapacity": 6.062042184988446,
                                    "percentSystemPower": 12.730380001340395,
                                    "order": 5
                                },
                                {
                                    "power": 375.6,
                                    "airflow": 1073.3,
                                    "percentCapacity": 34.67851867513079,
                                    "timeInterval": 23,
                                    "percentPower": 75.51266586248492,
                                    "percentSystemCapacity": 5.881741303130742,
                                    "percentSystemPower": 12.586287782320221,
                                    "order": 5
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ndidf48pq",
                            "avgPower": 385.94166666666666,
                            "avgAirflow": 1157.1908333333333,
                            "avgPrecentPower": 77.59181074922934,
                            "avgPercentCapacity": 37.389037826792396,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 319.4,
                                    "airflow": 724.44,
                                    "percentCapacity": 23.406891228915903,
                                    "timeInterval": 0,
                                    "percentPower": 64.21391234418978,
                                    "percentSystemCapacity": 3.969987305649645,
                                    "percentSystemPower": 10.703035989544937,
                                    "order": 5
                                },
                                {
                                    "power": 334.4,
                                    "airflow": 805.16,
                                    "percentCapacity": 26.014905544381527,
                                    "timeInterval": 1,
                                    "percentPower": 67.22959388821873,
                                    "percentSystemCapacity": 4.412326428094083,
                                    "percentSystemPower": 11.205683265196702,
                                    "order": 5
                                },
                                {
                                    "power": 332,
                                    "airflow": 791.73,
                                    "percentCapacity": 25.58092290569234,
                                    "timeInterval": 2,
                                    "percentPower": 66.74708484117411,
                                    "percentSystemCapacity": 4.33871966205161,
                                    "percentSystemPower": 11.12525970109242,
                                    "order": 5
                                },
                                {
                                    "power": 334.8,
                                    "airflow": 807.42,
                                    "percentCapacity": 26.08788612948154,
                                    "timeInterval": 3,
                                    "percentPower": 67.31001206272617,
                                    "percentSystemCapacity": 4.42470449203997,
                                    "percentSystemPower": 11.219087192547418,
                                    "order": 5
                                },
                                {
                                    "power": 338.6,
                                    "airflow": 829.17,
                                    "percentCapacity": 26.790674358462653,
                                    "timeInterval": 4,
                                    "percentPower": 68.07398472054686,
                                    "percentSystemCapacity": 4.543902736707689,
                                    "percentSystemPower": 11.346424502379199,
                                    "order": 5
                                },
                                {
                                    "power": 338,
                                    "airflow": 825.7,
                                    "percentCapacity": 26.67855423542711,
                                    "timeInterval": 5,
                                    "percentPower": 67.95335745878569,
                                    "percentSystemCapacity": 4.5248863085624125,
                                    "percentSystemPower": 11.326318611353127,
                                    "order": 5
                                },
                                {
                                    "power": 346,
                                    "airflow": 873.11,
                                    "percentCapacity": 28.210465832325337,
                                    "timeInterval": 6,
                                    "percentPower": 69.56172094893446,
                                    "percentSystemCapacity": 4.784710201175303,
                                    "percentSystemPower": 11.594397158367402,
                                    "order": 5
                                },
                                {
                                    "power": 344,
                                    "airflow": 861.02,
                                    "percentCapacity": 27.819849648330287,
                                    "timeInterval": 7,
                                    "percentPower": 69.15963007639728,
                                    "percentSystemCapacity": 4.718458716658387,
                                    "percentSystemPower": 11.527377521613834,
                                    "order": 5
                                },
                                {
                                    "power": 372.1,
                                    "airflow": 1047.31,
                                    "percentCapacity": 33.838877809286096,
                                    "timeInterval": 8,
                                    "percentPower": 74.80900683554485,
                                    "percentSystemCapacity": 5.739331807307127,
                                    "percentSystemPower": 12.469003418001476,
                                    "order": 5
                                },
                                {
                                    "power": 373.5,
                                    "airflow": 1057.62,
                                    "percentCapacity": 34.17204847717541,
                                    "timeInterval": 9,
                                    "percentPower": 75.09047044632086,
                                    "percentSystemCapacity": 5.795840094084716,
                                    "percentSystemPower": 12.515917163728973,
                                    "order": 5
                                },
                                {
                                    "power": 410.2,
                                    "airflow": 1374.26,
                                    "percentCapacity": 44.40273409297366,
                                    "timeInterval": 10,
                                    "percentPower": 82.46883795737837,
                                    "percentSystemCapacity": 7.53104241658009,
                                    "percentSystemPower": 13.74572749815696,
                                    "order": 5
                                },
                                {
                                    "power": 426.1,
                                    "airflow": 1547.05,
                                    "percentCapacity": 49.98534782780091,
                                    "timeInterval": 11,
                                    "percentPower": 85.66546039404906,
                                    "percentSystemCapacity": 8.477896291486399,
                                    "percentSystemPower": 14.278533610347832,
                                    "order": 5
                                },
                                {
                                    "power": 421.8,
                                    "airflow": 1497.68,
                                    "percentCapacity": 48.390408181052976,
                                    "timeInterval": 12,
                                    "percentPower": 84.8009650180941,
                                    "percentSystemCapacity": 8.207382360826337,
                                    "percentSystemPower": 14.134441391327659,
                                    "order": 5
                                },
                                {
                                    "power": 423.8,
                                    "airflow": 1520.38,
                                    "percentCapacity": 49.1238661032269,
                                    "timeInterval": 13,
                                    "percentPower": 85.20305589063129,
                                    "percentSystemCapacity": 8.331782419415127,
                                    "percentSystemPower": 14.20146102808123,
                                    "order": 5
                                },
                                {
                                    "power": 413.6,
                                    "airflow": 1409.05,
                                    "percentCapacity": 45.52670959859761,
                                    "timeInterval": 14,
                                    "percentPower": 83.1523924406916,
                                    "percentSystemCapacity": 7.721677236281215,
                                    "percentSystemPower": 13.859660880638028,
                                    "order": 5
                                },
                                {
                                    "power": 406.6,
                                    "airflow": 1338.6,
                                    "percentCapacity": 43.25032308254393,
                                    "timeInterval": 15,
                                    "percentPower": 81.74507438681142,
                                    "percentSystemCapacity": 7.3355847183512415,
                                    "percentSystemPower": 13.625092152000537,
                                    "order": 5
                                },
                                {
                                    "power": 385,
                                    "airflow": 1146.7,
                                    "percentCapacity": 37.04996969877627,
                                    "timeInterval": 16,
                                    "percentPower": 77.40249296340973,
                                    "percentSystemCapacity": 6.283957486722522,
                                    "percentSystemPower": 12.901280075061994,
                                    "order": 5
                                },
                                {
                                    "power": 378.3,
                                    "airflow": 1093.83,
                                    "percentCapacity": 35.341849344906784,
                                    "timeInterval": 17,
                                    "percentPower": 76.05548854041014,
                                    "percentSystemCapacity": 5.994247244765809,
                                    "percentSystemPower": 12.67676429193754,
                                    "order": 5
                                },
                                {
                                    "power": 392.4,
                                    "airflow": 1208.51,
                                    "percentCapacity": 39.04730367627715,
                                    "timeInterval": 18,
                                    "percentPower": 78.89022919179735,
                                    "percentSystemCapacity": 6.622720565436091,
                                    "percentSystemPower": 13.149252731050199,
                                    "order": 5
                                },
                                {
                                    "power": 413,
                                    "airflow": 1402.83,
                                    "percentCapacity": 45.325772064026594,
                                    "timeInterval": 19,
                                    "percentPower": 83.03176517893044,
                                    "percentSystemCapacity": 7.6875966976195915,
                                    "percentSystemPower": 13.839554989611958,
                                    "order": 5
                                },
                                {
                                    "power": 410,
                                    "airflow": 1372.25,
                                    "percentCapacity": 44.33771177345247,
                                    "timeInterval": 20,
                                    "percentPower": 82.42862887012465,
                                    "percentSystemCapacity": 7.520014135183876,
                                    "percentSystemPower": 13.739025534481602,
                                    "order": 5
                                },
                                {
                                    "power": 397.4,
                                    "airflow": 1252.5,
                                    "percentCapacity": 40.46852659520401,
                                    "timeInterval": 21,
                                    "percentPower": 79.89545637314033,
                                    "percentSystemCapacity": 6.863770813905985,
                                    "percentSystemPower": 13.316801822934119,
                                    "order": 5
                                },
                                {
                                    "power": 406.8,
                                    "airflow": 1340.55,
                                    "percentCapacity": 43.31336139517226,
                                    "timeInterval": 22,
                                    "percentPower": 81.78528347406514,
                                    "percentSystemCapacity": 7.346276497043958,
                                    "percentSystemPower": 13.631794115675893,
                                    "order": 5
                                },
                                {
                                    "power": 385.8,
                                    "airflow": 1153.2,
                                    "percentCapacity": 37.26010664844939,
                                    "timeInterval": 23,
                                    "percentPower": 77.56332931242461,
                                    "percentSystemCapacity": 6.319598316360743,
                                    "percentSystemPower": 12.928087929763421,
                                    "order": 5
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ndidf48pq",
                            "avgPower": 379.3166666666666,
                            "avgAirflow": 1136.669583333333,
                            "avgPrecentPower": 76.25988473394987,
                            "avgPercentCapacity": 36.72604442716413,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 383.6,
                                    "airflow": 1654.02,
                                    "percentCapacity": 71.44796741410823,
                                    "timeInterval": 0,
                                    "percentPower": 92.54523522316043,
                                    "percentSystemCapacity": 9.064119057631553,
                                    "percentSystemPower": 12.854366329334496,
                                    "order": 1
                                },
                                {
                                    "power": 386.8,
                                    "airflow": 1700.5,
                                    "percentCapacity": 73.45592026743235,
                                    "timeInterval": 1,
                                    "percentPower": 93.31724969843185,
                                    "percentSystemCapacity": 9.318854417969415,
                                    "percentSystemPower": 12.961597748140205,
                                    "order": 1
                                },
                                {
                                    "power": 391.3,
                                    "airflow": 1768.86,
                                    "percentCapacity": 76.40880668240486,
                                    "timeInterval": 2,
                                    "percentPower": 94.40289505428227,
                                    "percentSystemCapacity": 9.693467090627315,
                                    "percentSystemPower": 13.112391930835738,
                                    "order": 1
                                },
                                {
                                    "power": 391.6,
                                    "airflow": 1773.55,
                                    "percentCapacity": 76.6112739093221,
                                    "timeInterval": 3,
                                    "percentPower": 94.47527141133897,
                                    "percentSystemCapacity": 9.719152734550672,
                                    "percentSystemPower": 13.122444876348771,
                                    "order": 1
                                },
                                {
                                    "power": 389,
                                    "airflow": 1733.47,
                                    "percentCapacity": 74.88012588232786,
                                    "timeInterval": 4,
                                    "percentPower": 93.84800965018094,
                                    "percentSystemCapacity": 9.49953372520764,
                                    "percentSystemPower": 13.035319348569132,
                                    "order": 1
                                },
                                {
                                    "power": 388.4,
                                    "airflow": 1724.4,
                                    "percentCapacity": 74.48807846412339,
                                    "timeInterval": 5,
                                    "percentPower": 93.70325693606755,
                                    "percentSystemCapacity": 9.449797328169973,
                                    "percentSystemPower": 13.015213457543059,
                                    "order": 1
                                },
                                {
                                    "power": 392.5,
                                    "airflow": 1787.71,
                                    "percentCapacity": 77.22301393211018,
                                    "timeInterval": 6,
                                    "percentPower": 94.69240048250904,
                                    "percentSystemCapacity": 9.796760042351767,
                                    "percentSystemPower": 13.152603712887878,
                                    "order": 1
                                },
                                {
                                    "power": 388.5,
                                    "airflow": 1725.91,
                                    "percentCapacity": 74.5532290011993,
                                    "timeInterval": 7,
                                    "percentPower": 93.72738238841978,
                                    "percentSystemCapacity": 9.45806253495048,
                                    "percentSystemPower": 13.01856443938074,
                                    "order": 1
                                },
                                {
                                    "power": 393.6,
                                    "airflow": 1805.23,
                                    "percentCapacity": 77.97964526961624,
                                    "timeInterval": 8,
                                    "percentPower": 94.9577804583836,
                                    "percentSystemCapacity": 9.892748728581852,
                                    "percentSystemPower": 13.189464513102342,
                                    "order": 1
                                },
                                {
                                    "power": 390,
                                    "airflow": 1748.74,
                                    "percentCapacity": 75.53969086793906,
                                    "timeInterval": 9,
                                    "percentPower": 94.08926417370326,
                                    "percentSystemCapacity": 9.583208261687798,
                                    "percentSystemPower": 13.068829166945918,
                                    "order": 1
                                },
                                {
                                    "power": 390.3,
                                    "airflow": 1753.36,
                                    "percentCapacity": 75.73907569285635,
                                    "timeInterval": 10,
                                    "percentPower": 94.16164053075995,
                                    "percentSystemCapacity": 9.60850286217462,
                                    "percentSystemPower": 13.07888211245895,
                                    "order": 1
                                },
                                {
                                    "power": 384,
                                    "airflow": 1659.74,
                                    "percentCapacity": 71.69494943416738,
                                    "timeInterval": 11,
                                    "percentPower": 92.64173703256937,
                                    "percentSystemCapacity": 9.095451991456462,
                                    "percentSystemPower": 12.86777025668521,
                                    "order": 1
                                },
                                {
                                    "power": 376.3,
                                    "airflow": 1554.08,
                                    "percentCapacity": 67.13076878526056,
                                    "timeInterval": 12,
                                    "percentPower": 90.78407720144753,
                                    "percentSystemCapacity": 8.51642534731906,
                                    "percentSystemPower": 12.609744655183968,
                                    "order": 1
                                },
                                {
                                    "power": 371.6,
                                    "airflow": 1493.86,
                                    "percentCapacity": 64.52969591255764,
                                    "timeInterval": 13,
                                    "percentPower": 89.65018094089264,
                                    "percentSystemCapacity": 8.186444872729666,
                                    "percentSystemPower": 12.452248508813083,
                                    "order": 1
                                },
                                {
                                    "power": 368.9,
                                    "airflow": 1460.62,
                                    "percentCapacity": 63.09382516511306,
                                    "timeInterval": 14,
                                    "percentPower": 88.99879372738239,
                                    "percentSystemCapacity": 8.00428568923919,
                                    "percentSystemPower": 12.361771999195764,
                                    "order": 1
                                },
                                {
                                    "power": 368.5,
                                    "airflow": 1455.78,
                                    "percentCapacity": 62.88457563859016,
                                    "timeInterval": 15,
                                    "percentPower": 88.90229191797346,
                                    "percentSystemCapacity": 7.9777396209631855,
                                    "percentSystemPower": 12.348368071845051,
                                    "order": 1
                                },
                                {
                                    "power": 365.3,
                                    "airflow": 1417.75,
                                    "percentCapacity": 61.24176390328033,
                                    "timeInterval": 16,
                                    "percentPower": 88.13027744270205,
                                    "percentSystemCapacity": 7.769327237839432,
                                    "percentSystemPower": 12.24113665303934,
                                    "order": 1
                                },
                                {
                                    "power": 366.2,
                                    "airflow": 1428.32,
                                    "percentCapacity": 61.69828183217723,
                                    "timeInterval": 17,
                                    "percentPower": 88.34740651387213,
                                    "percentSystemCapacity": 7.827242571322351,
                                    "percentSystemPower": 12.271295489578447,
                                    "order": 1
                                },
                                {
                                    "power": 365.3,
                                    "airflow": 1417.75,
                                    "percentCapacity": 61.24176390328033,
                                    "timeInterval": 18,
                                    "percentPower": 88.13027744270205,
                                    "percentSystemCapacity": 7.769327237839432,
                                    "percentSystemPower": 12.24113665303934,
                                    "order": 1
                                },
                                {
                                    "power": 363.7,
                                    "airflow": 1399.2,
                                    "percentCapacity": 60.44057823180928,
                                    "timeInterval": 19,
                                    "percentPower": 87.74427020506634,
                                    "percentSystemCapacity": 7.667686245431746,
                                    "percentSystemPower": 12.187520943636486,
                                    "order": 1
                                },
                                {
                                    "power": 368.3,
                                    "airflow": 1453.36,
                                    "percentCapacity": 62.78028095356581,
                                    "timeInterval": 20,
                                    "percentPower": 88.854041013269,
                                    "percentSystemCapacity": 7.964508461612496,
                                    "percentSystemPower": 12.341666108169695,
                                    "order": 1
                                },
                                {
                                    "power": 373.7,
                                    "airflow": 1520.39,
                                    "percentCapacity": 65.67551253512214,
                                    "timeInterval": 21,
                                    "percentPower": 90.1568154402895,
                                    "percentSystemCapacity": 8.331806856576488,
                                    "percentSystemPower": 12.52261912740433,
                                    "order": 1
                                },
                                {
                                    "power": 368.6,
                                    "airflow": 1456.99,
                                    "percentCapacity": 62.93680536772497,
                                    "timeInterval": 22,
                                    "percentPower": 88.9264173703257,
                                    "percentSystemCapacity": 7.984365652470589,
                                    "percentSystemPower": 12.35171905368273,
                                    "order": 1
                                },
                                {
                                    "power": 372.5,
                                    "airflow": 1505.16,
                                    "percentCapacity": 65.01758933162742,
                                    "timeInterval": 23,
                                    "percentPower": 89.86731001206273,
                                    "percentSystemCapacity": 8.248340601858697,
                                    "percentSystemPower": 12.48240734535219,
                                    "order": 1
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "h5eh597rg",
                            "avgPower": 379.10416666666674,
                            "avgAirflow": 1599.9479166666667,
                            "avgPrecentPower": 91.46059509449134,
                            "avgPercentCapacity": 69.11221743240483,
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 394.2,
                                    "airflow": 1814.88,
                                    "percentCapacity": 78.39656163823054,
                                    "timeInterval": 0,
                                    "percentPower": 95.10253317249699,
                                    "percentSystemCapacity": 9.945640080693979,
                                    "percentSystemPower": 13.20957040412841,
                                    "order": 1
                                },
                                {
                                    "power": 381.2,
                                    "airflow": 1620.26,
                                    "percentCapacity": 69.9894233766404,
                                    "timeInterval": 1,
                                    "percentPower": 91.96622436670687,
                                    "percentSystemCapacity": 8.879083467608645,
                                    "percentSystemPower": 12.773942765230212,
                                    "order": 1
                                },
                                {
                                    "power": 380.8,
                                    "airflow": 1614.72,
                                    "percentCapacity": 69.75015677448182,
                                    "timeInterval": 2,
                                    "percentPower": 91.86972255729795,
                                    "percentSystemCapacity": 8.848729336525944,
                                    "percentSystemPower": 12.760538837879501,
                                    "order": 1
                                },
                                {
                                    "power": 373.2,
                                    "airflow": 1514.02,
                                    "percentCapacity": 65.4003413718952,
                                    "timeInterval": 3,
                                    "percentPower": 90.03618817852835,
                                    "percentSystemCapacity": 8.296897757339837,
                                    "percentSystemPower": 12.505864218215937,
                                    "order": 1
                                },
                                {
                                    "power": 379.3,
                                    "airflow": 1594.16,
                                    "percentCapacity": 68.86241238288946,
                                    "timeInterval": 4,
                                    "percentPower": 91.50784077201448,
                                    "percentSystemCapacity": 8.736107226347496,
                                    "percentSystemPower": 12.710274110314323,
                                    "order": 1
                                },
                                {
                                    "power": 385.7,
                                    "airflow": 1684.33,
                                    "percentCapacity": 72.7573345197575,
                                    "timeInterval": 5,
                                    "percentPower": 93.05186972255729,
                                    "percentSystemCapacity": 9.230229582049464,
                                    "percentSystemPower": 12.924736947925744,
                                    "order": 1
                                },
                                {
                                    "power": 400.6,
                                    "airflow": 1922.3,
                                    "percentCapacity": 83.03691285427365,
                                    "timeInterval": 6,
                                    "percentPower": 96.64656212303981,
                                    "percentSystemCapacity": 10.534329968086558,
                                    "percentSystemPower": 13.42403324173983,
                                    "order": 1
                                },
                                {
                                    "power": 390,
                                    "airflow": 1748.74,
                                    "percentCapacity": 75.53969086793906,
                                    "timeInterval": 7,
                                    "percentPower": 94.08926417370326,
                                    "percentSystemCapacity": 9.583208261687798,
                                    "percentSystemPower": 13.068829166945918,
                                    "order": 1
                                },
                                {
                                    "power": 401.2,
                                    "airflow": 1932.81,
                                    "percentCapacity": 83.49082766199842,
                                    "timeInterval": 8,
                                    "percentPower": 96.7913148371532,
                                    "percentSystemCapacity": 10.591915061241032,
                                    "percentSystemPower": 13.444139132765901,
                                    "order": 1
                                },
                                {
                                    "power": 402.2,
                                    "airflow": 1950.5,
                                    "percentCapacity": 84.25486286359086,
                                    "timeInterval": 9,
                                    "percentPower": 97.03256936067551,
                                    "percentSystemCapacity": 10.688843025493908,
                                    "percentSystemPower": 13.477648951142685,
                                    "order": 1
                                },
                                {
                                    "power": 412.9,
                                    "airflow": 2154.31,
                                    "percentCapacity": 93.05875396229393,
                                    "timeInterval": 10,
                                    "percentPower": 99.61399276236429,
                                    "percentSystemCapacity": 11.805732980201142,
                                    "percentSystemPower": 13.836204007774278,
                                    "order": 1
                                },
                                {
                                    "power": 408.6,
                                    "airflow": 2069.08,
                                    "percentCapacity": 89.37693520704872,
                                    "timeInterval": 11,
                                    "percentPower": 98.57659831121835,
                                    "percentSystemCapacity": 11.338645605234426,
                                    "percentSystemPower": 13.692111788754108,
                                    "order": 1
                                },
                                {
                                    "power": 397.1,
                                    "airflow": 1862.52,
                                    "percentCapacity": 80.45460111148302,
                                    "timeInterval": 12,
                                    "percentPower": 95.8021712907117,
                                    "percentSystemCapacity": 10.20672959080903,
                                    "percentSystemPower": 13.306748877421084,
                                    "order": 1
                                },
                                {
                                    "power": 390.8,
                                    "airflow": 1761.09,
                                    "percentCapacity": 76.07295325228085,
                                    "timeInterval": 13,
                                    "percentPower": 94.28226779252111,
                                    "percentSystemCapacity": 9.650859643743432,
                                    "percentSystemPower": 13.095637021647343,
                                    "order": 1
                                },
                                {
                                    "power": 386.6,
                                    "airflow": 1697.55,
                                    "percentCapacity": 73.32824316849234,
                                    "timeInterval": 14,
                                    "percentPower": 93.26899879372739,
                                    "percentSystemCapacity": 9.302656890347421,
                                    "percentSystemPower": 12.954895784464851,
                                    "order": 1
                                },
                                {
                                    "power": 383.2,
                                    "airflow": 1648.33,
                                    "percentCapacity": 71.20210934274196,
                                    "timeInterval": 15,
                                    "percentPower": 92.44873341375151,
                                    "percentSystemCapacity": 9.032928711554561,
                                    "percentSystemPower": 12.840962401983782,
                                    "order": 1
                                },
                                {
                                    "power": 382.1,
                                    "airflow": 1632.81,
                                    "percentCapacity": 70.53173533924513,
                                    "timeInterval": 16,
                                    "percentPower": 92.18335343787697,
                                    "percentSystemCapacity": 8.947882908283235,
                                    "percentSystemPower": 12.804101601769318,
                                    "order": 1
                                },
                                {
                                    "power": 381.8,
                                    "airflow": 1628.61,
                                    "percentCapacity": 70.3503518035987,
                                    "timeInterval": 17,
                                    "percentPower": 92.11097708082026,
                                    "percentSystemCapacity": 8.924872009279428,
                                    "percentSystemPower": 12.794048656256285,
                                    "order": 1
                                },
                                {
                                    "power": 385.5,
                                    "airflow": 1681.41,
                                    "percentCapacity": 72.63126872614451,
                                    "timeInterval": 18,
                                    "percentPower": 93.00361881785284,
                                    "percentSystemCapacity": 9.214236469806256,
                                    "percentSystemPower": 12.918034984250387,
                                    "order": 1
                                },
                                {
                                    "power": 387.1,
                                    "airflow": 1704.95,
                                    "percentCapacity": 73.64799139733798,
                                    "timeInterval": 19,
                                    "percentPower": 93.38962605548855,
                                    "percentSystemCapacity": 9.343221179572414,
                                    "percentSystemPower": 12.971650693653242,
                                    "order": 1
                                },
                                {
                                    "power": 386.7,
                                    "airflow": 1699.03,
                                    "percentCapacity": 73.39204476666117,
                                    "timeInterval": 20,
                                    "percentPower": 93.2931242460796,
                                    "percentSystemCapacity": 9.310750966397446,
                                    "percentSystemPower": 12.958246766302528,
                                    "order": 1
                                },
                                {
                                    "power": 404.7,
                                    "airflow": 1995.69,
                                    "percentCapacity": 86.206950635842,
                                    "timeInterval": 21,
                                    "percentPower": 97.6357056694813,
                                    "percentSystemCapacity": 10.936491161879342,
                                    "percentSystemPower": 13.561423497084647,
                                    "order": 1
                                },
                                {
                                    "power": 411.2,
                                    "airflow": 2120.05,
                                    "percentCapacity": 91.57891874317805,
                                    "timeInterval": 22,
                                    "percentPower": 99.20386007237636,
                                    "percentSystemCapacity": 11.617996322361748,
                                    "percentSystemPower": 13.779237316533747,
                                    "order": 1
                                },
                                {
                                    "power": 417.1000000000001,
                                    "airflow": 2242.24,
                                    "percentCapacity": 96.85702859033256,
                                    "timeInterval": 23,
                                    "percentPower": 100.62726176115804,
                                    "percentSystemCapacity": 12.28759432193226,
                                    "percentSystemPower": 13.976945244956775,
                                    "order": 1
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "h5eh597rg",
                            "avgPower": 392.6583333333335,
                            "avgAirflow": 1803.9329166666666,
                            "avgPrecentPower": 94.73059911540008,
                            "avgPercentCapacity": 77.92368376493242,
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 153.7,
                                    "airflow": 387.25,
                                    "percentCapacity": 20.853790620777545,
                                    "timeInterval": 0,
                                    "percentPower": 52.98173043778007,
                                    "percentSystemCapacity": 2.122177180117487,
                                    "percentSystemPower": 5.150459084511762,
                                    "order": 6
                                },
                                {
                                    "power": 154.2,
                                    "airflow": 389.74,
                                    "percentCapacity": 20.98747236379449,
                                    "timeInterval": 1,
                                    "percentPower": 53.154084798345394,
                                    "percentSystemCapacity": 2.1357812461402,
                                    "percentSystemPower": 5.1672139937001536,
                                    "order": 6
                                },
                                {
                                    "power": 155.5,
                                    "airflow": 396.23,
                                    "percentCapacity": 21.33700197532327,
                                    "timeInterval": 2,
                                    "percentPower": 53.60220613581524,
                                    "percentSystemCapacity": 2.171350979185407,
                                    "percentSystemPower": 5.210776757589974,
                                    "order": 6
                                },
                                {
                                    "power": 163.5,
                                    "airflow": 437.39,
                                    "percentCapacity": 23.553749540544448,
                                    "timeInterval": 3,
                                    "percentPower": 56.35987590486039,
                                    "percentSystemCapacity": 2.3969373573427797,
                                    "percentSystemPower": 5.47885530460425,
                                    "order": 6
                                },
                                {
                                    "power": 158.2,
                                    "airflow": 409.88,
                                    "percentCapacity": 22.072217399945817,
                                    "timeInterval": 4,
                                    "percentPower": 54.53291968286796,
                                    "percentSystemCapacity": 2.2461698658318383,
                                    "percentSystemPower": 5.301253267207292,
                                    "order": 6
                                },
                                {
                                    "power": 162.80000000000004,
                                    "airflow": 433.7,
                                    "percentCapacity": 23.355047608622094,
                                    "timeInterval": 5,
                                    "percentPower": 56.11857980006894,
                                    "percentSystemCapacity": 2.376716539303553,
                                    "percentSystemPower": 5.455398431740502,
                                    "order": 6
                                },
                                {
                                    "power": 168,
                                    "airflow": 461.54,
                                    "percentCapacity": 24.85428106126598,
                                    "timeInterval": 6,
                                    "percentPower": 57.91106514994829,
                                    "percentSystemCapacity": 2.529285397346061,
                                    "percentSystemPower": 5.62964948729978,
                                    "order": 6
                                },
                                {
                                    "power": 155.20000000000002,
                                    "airflow": 394.73,
                                    "percentCapacity": 21.256088204081923,
                                    "timeInterval": 7,
                                    "percentPower": 53.49879351947604,
                                    "percentSystemCapacity": 2.1631168234864164,
                                    "percentSystemPower": 5.200723812076939,
                                    "order": 6
                                },
                                {
                                    "power": 157.3,
                                    "airflow": 405.3,
                                    "percentCapacity": 21.825730648442224,
                                    "timeInterval": 8,
                                    "percentPower": 54.222681833850395,
                                    "percentSystemCapacity": 2.2210862458437752,
                                    "percentSystemPower": 5.271094430668186,
                                    "order": 6
                                },
                                {
                                    "power": 156.1,
                                    "airflow": 399.24,
                                    "percentCapacity": 21.499290075074132,
                                    "timeInterval": 9,
                                    "percentPower": 53.80903136849362,
                                    "percentSystemCapacity": 2.1878661589989403,
                                    "percentSystemPower": 5.230882648616045,
                                    "order": 6
                                },
                                {
                                    "power": 153.3,
                                    "airflow": 385.27,
                                    "percentCapacity": 20.747142479434707,
                                    "timeInterval": 10,
                                    "percentPower": 52.84384694932782,
                                    "percentSystemCapacity": 2.1113241771323024,
                                    "percentSystemPower": 5.137055157161049,
                                    "order": 6
                                },
                                {
                                    "power": 151.7,
                                    "airflow": 377.4,
                                    "percentCapacity": 20.323153570426605,
                                    "timeInterval": 11,
                                    "percentPower": 52.29231299551878,
                                    "percentSystemCapacity": 2.068177125179867,
                                    "percentSystemPower": 5.0834394477581935,
                                    "order": 6
                                },
                                {
                                    "power": 152.59999999999997,
                                    "airflow": 381.82,
                                    "percentCapacity": 20.56113807437829,
                                    "timeInterval": 12,
                                    "percentPower": 52.60255084453635,
                                    "percentSystemCapacity": 2.092395517542771,
                                    "percentSystemPower": 5.113598284297298,
                                    "order": 6
                                },
                                {
                                    "power": 152.3,
                                    "airflow": 380.34,
                                    "percentCapacity": 20.481665269885244,
                                    "timeInterval": 13,
                                    "percentPower": 52.499138228197175,
                                    "percentSystemCapacity": 2.0843080012153057,
                                    "percentSystemPower": 5.103545338784264,
                                    "order": 6
                                },
                                {
                                    "power": 154,
                                    "airflow": 388.74,
                                    "percentCapacity": 20.933949921302275,
                                    "timeInterval": 14,
                                    "percentPower": 53.085143054119264,
                                    "percentSystemCapacity": 2.1303345574231876,
                                    "percentSystemPower": 5.1605120300247975,
                                    "order": 6
                                },
                                {
                                    "power": 154.1,
                                    "airflow": 389.24,
                                    "percentCapacity": 20.96070283230756,
                                    "timeInterval": 15,
                                    "percentPower": 53.119613926232326,
                                    "percentSystemCapacity": 2.133057056093552,
                                    "percentSystemPower": 5.163863011862476,
                                    "order": 6
                                },
                                {
                                    "power": 155.3,
                                    "airflow": 395.23,
                                    "percentCapacity": 21.283042481429685,
                                    "timeInterval": 16,
                                    "percentPower": 53.53326439158911,
                                    "percentSystemCapacity": 2.1658598141174332,
                                    "percentSystemPower": 5.204074793914618,
                                    "order": 6
                                },
                                {
                                    "power": 154.3,
                                    "airflow": 390.23,
                                    "percentCapacity": 21.014258544821278,
                                    "timeInterval": 17,
                                    "percentPower": 53.188555670458456,
                                    "percentSystemCapacity": 2.1385071305202277,
                                    "percentSystemPower": 5.170564975537833,
                                    "order": 6
                                },
                                {
                                    "power": 154,
                                    "airflow": 388.74,
                                    "percentCapacity": 20.933949921302275,
                                    "timeInterval": 18,
                                    "percentPower": 53.085143054119264,
                                    "percentSystemCapacity": 2.1303345574231876,
                                    "percentSystemPower": 5.1605120300247975,
                                    "order": 6
                                },
                                {
                                    "power": 155.9,
                                    "airflow": 398.24,
                                    "percentCapacity": 21.445125538138086,
                                    "timeInterval": 19,
                                    "percentPower": 53.7400896242675,
                                    "percentSystemCapacity": 2.182354127812496,
                                    "percentSystemPower": 5.224180684940688,
                                    "order": 6
                                },
                                {
                                    "power": 155.4,
                                    "airflow": 395.73,
                                    "percentCapacity": 21.310013728774496,
                                    "timeInterval": 20,
                                    "percentPower": 53.56773526370217,
                                    "percentSystemCapacity": 2.1686045316930205,
                                    "percentSystemPower": 5.207425775752296,
                                    "order": 6
                                },
                                {
                                    "power": 155.1,
                                    "airflow": 394.23,
                                    "percentCapacity": 21.22915086753657,
                                    "timeInterval": 21,
                                    "percentPower": 53.46432264736297,
                                    "percentSystemCapacity": 2.16037555682899,
                                    "percentSystemPower": 5.19737283023926,
                                    "order": 6
                                },
                                {
                                    "power": 154.9,
                                    "airflow": 393.23,
                                    "percentCapacity": 21.175326900137232,
                                    "timeInterval": 22,
                                    "percentPower": 53.39538090313685,
                                    "percentSystemCapacity": 2.1548981835573677,
                                    "percentSystemPower": 5.190670866563904,
                                    "order": 6
                                },
                                {
                                    "power": 155.8,
                                    "airflow": 397.73,
                                    "percentCapacity": 21.418069002452118,
                                    "timeInterval": 23,
                                    "percentPower": 53.70561875215443,
                                    "percentSystemCapacity": 2.1796007309049528,
                                    "percentSystemPower": 5.22082970310301,
                                    "order": 6
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "gky2b0t53",
                            "avgPower": 155.9666666666667,
                            "avgAirflow": 398.79874999999987,
                            "avgPrecentPower": 53.76307020567619,
                            "avgPercentCapacity": 21.475473276258267,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 195.3,
                                    "airflow": 626.85,
                                    "percentCapacity": 33.756147239845625,
                                    "timeInterval": 0,
                                    "percentPower": 67.3216132368149,
                                    "percentSystemCapacity": 3.435180042985167,
                                    "percentSystemPower": 6.544467528985994,
                                    "order": 6
                                },
                                {
                                    "power": 194.79999999999998,
                                    "airflow": 623.49,
                                    "percentCapacity": 33.57502902873946,
                                    "timeInterval": 1,
                                    "percentPower": 67.14925887624956,
                                    "percentSystemCapacity": 3.416748624855829,
                                    "percentSystemPower": 6.5277126197976,
                                    "order": 6
                                },
                                {
                                    "power": 231.80000000000004,
                                    "airflow": 918.61,
                                    "percentCapacity": 49.46767890827795,
                                    "timeInterval": 2,
                                    "percentPower": 79.90348155808343,
                                    "percentSystemCapacity": 5.03405741630163,
                                    "percentSystemPower": 7.767575899738626,
                                    "order": 6
                                },
                                {
                                    "power": 234.9,
                                    "airflow": 948.59,
                                    "percentCapacity": 51.0818282056146,
                                    "timeInterval": 3,
                                    "percentPower": 80.97207859358842,
                                    "percentSystemCapacity": 5.198320636662994,
                                    "percentSystemPower": 7.871456336706656,
                                    "order": 6
                                },
                                {
                                    "power": 233.5,
                                    "airflow": 934.93,
                                    "percentCapacity": 50.346208288317214,
                                    "timeInterval": 4,
                                    "percentPower": 80.4894863840055,
                                    "percentSystemCapacity": 5.123460586990633,
                                    "percentSystemPower": 7.824542590979157,
                                    "order": 6
                                },
                                {
                                    "power": 231.80000000000004,
                                    "airflow": 918.61,
                                    "percentCapacity": 49.46767890827795,
                                    "timeInterval": 5,
                                    "percentPower": 79.90348155808343,
                                    "percentSystemCapacity": 5.03405741630163,
                                    "percentSystemPower": 7.767575899738626,
                                    "order": 6
                                },
                                {
                                    "power": 247.5,
                                    "airflow": 1081.62,
                                    "percentCapacity": 58.245502799371884,
                                    "timeInterval": 6,
                                    "percentPower": 85.31540847983453,
                                    "percentSystemCapacity": 5.927328951032091,
                                    "percentSystemPower": 8.293680048254139,
                                    "order": 6
                                },
                                {
                                    "power": 198.3,
                                    "airflow": 647.33,
                                    "percentCapacity": 34.85911099896188,
                                    "timeInterval": 7,
                                    "percentPower": 68.35573940020683,
                                    "percentSystemCapacity": 3.547422683311717,
                                    "percentSystemPower": 6.6449969841163465,
                                    "order": 6
                                },
                                {
                                    "power": 201.6,
                                    "airflow": 670.48,
                                    "percentCapacity": 36.10561313393327,
                                    "timeInterval": 8,
                                    "percentPower": 69.49327817993795,
                                    "percentSystemCapacity": 3.6742724457318103,
                                    "percentSystemPower": 6.755579384759734,
                                    "order": 6
                                },
                                {
                                    "power": 196,
                                    "airflow": 631.58,
                                    "percentCapacity": 34.01099900206375,
                                    "timeInterval": 9,
                                    "percentPower": 67.56290934160634,
                                    "percentSystemCapacity": 3.461114924749692,
                                    "percentSystemPower": 6.5679244018497425,
                                    "order": 6
                                },
                                {
                                    "power": 195.5,
                                    "airflow": 628.2,
                                    "percentCapacity": 33.82880839780952,
                                    "timeInterval": 10,
                                    "percentPower": 67.39055498104102,
                                    "percentSystemCapacity": 3.4425743749853286,
                                    "percentSystemPower": 6.551169492661351,
                                    "order": 6
                                },
                                {
                                    "power": 196.6,
                                    "airflow": 635.66,
                                    "percentCapacity": 34.230647923478244,
                                    "timeInterval": 11,
                                    "percentPower": 67.76973457428473,
                                    "percentSystemCapacity": 3.4834674043127514,
                                    "percentSystemPower": 6.588030292875812,
                                    "order": 6
                                },
                                {
                                    "power": 196.4,
                                    "airflow": 634.3,
                                    "percentCapacity": 34.157307430811024,
                                    "timeInterval": 12,
                                    "percentPower": 67.7007928300586,
                                    "percentSystemCapacity": 3.4760039401039053,
                                    "percentSystemPower": 6.581328329200456,
                                    "order": 6
                                },
                                {
                                    "power": 198.1,
                                    "airflow": 645.95,
                                    "percentCapacity": 34.78469956715019,
                                    "timeInterval": 13,
                                    "percentPower": 68.28679765598069,
                                    "percentSystemCapacity": 3.5398502354339048,
                                    "percentSystemPower": 6.638295020440989,
                                    "order": 6
                                },
                                {
                                    "power": 197.40000000000003,
                                    "airflow": 641.13,
                                    "percentCapacity": 34.5252599918708,
                                    "timeInterval": 14,
                                    "percentPower": 68.04550155118925,
                                    "percentSystemCapacity": 3.5134484768141205,
                                    "percentSystemPower": 6.614838147577242,
                                    "order": 6
                                },
                                {
                                    "power": 197.8,
                                    "airflow": 643.88,
                                    "percentCapacity": 34.67332107066062,
                                    "timeInterval": 15,
                                    "percentPower": 68.1833850396415,
                                    "percentSystemCapacity": 3.528515849858438,
                                    "percentSystemPower": 6.628242074927955,
                                    "order": 6
                                },
                                {
                                    "power": 200.3,
                                    "airflow": 661.28,
                                    "percentCapacity": 35.61030978227141,
                                    "timeInterval": 16,
                                    "percentPower": 69.04515684246812,
                                    "percentSystemCapacity": 3.6238681096930083,
                                    "percentSystemPower": 6.712016620869915,
                                    "order": 6
                                },
                                {
                                    "power": 198.4,
                                    "airflow": 648.03,
                                    "percentCapacity": 34.896364581392746,
                                    "timeInterval": 17,
                                    "percentPower": 68.39021027231989,
                                    "percentSystemCapacity": 3.5512137783672912,
                                    "percentSystemPower": 6.648347965954025,
                                    "order": 6
                                },
                                {
                                    "power": 197.8,
                                    "airflow": 643.88,
                                    "percentCapacity": 34.67332107066062,
                                    "timeInterval": 18,
                                    "percentPower": 68.1833850396415,
                                    "percentSystemCapacity": 3.528515849858438,
                                    "percentSystemPower": 6.628242074927955,
                                    "order": 6
                                },
                                {
                                    "power": 199,
                                    "airflow": 652.19,
                                    "percentCapacity": 35.12055908526016,
                                    "timeInterval": 19,
                                    "percentPower": 68.59703550499827,
                                    "percentSystemCapacity": 3.574028837205619,
                                    "percentSystemPower": 6.668453856980096,
                                    "order": 6
                                },
                                {
                                    "power": 201.30000000000004,
                                    "airflow": 668.35,
                                    "percentCapacity": 35.99081405316896,
                                    "timeInterval": 20,
                                    "percentPower": 69.38986556359876,
                                    "percentSystemCapacity": 3.6625899658447376,
                                    "percentSystemPower": 6.7455264392467,
                                    "order": 6
                                },
                                {
                                    "power": 200.20000000000002,
                                    "airflow": 660.58,
                                    "percentCapacity": 35.57244084035142,
                                    "timeInterval": 21,
                                    "percentPower": 69.01068597035504,
                                    "percentSystemCapacity": 3.620014392839357,
                                    "percentSystemPower": 6.708665639032238,
                                    "order": 6
                                },
                                {
                                    "power": 202.7,
                                    "airflow": 678.35,
                                    "percentCapacity": 36.529130898173946,
                                    "timeInterval": 22,
                                    "percentPower": 69.87245777318165,
                                    "percentSystemCapacity": 3.7173715518363117,
                                    "percentSystemPower": 6.792440184974198,
                                    "order": 6
                                },
                                {
                                    "power": 202.2,
                                    "airflow": 674.76,
                                    "percentCapacity": 36.33611650717336,
                                    "timeInterval": 23,
                                    "percentPower": 69.70010341261633,
                                    "percentSystemCapacity": 3.697729523992817,
                                    "percentSystemPower": 6.775685275785805,
                                    "order": 6
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "gky2b0t53",
                            "avgPower": 206.2166666666667,
                            "avgAirflow": 713.2762499999999,
                            "avgPrecentPower": 71.08468344249108,
                            "avgPercentCapacity": 38.410204071401516,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 213.59999999999997,
                                    "airflow": 760.62,
                                    "percentCapacity": 40.95951057252891,
                                    "timeInterval": 0,
                                    "percentPower": 73.62978283350567,
                                    "percentSystemCapacity": 4.168227265080348,
                                    "percentSystemPower": 7.1576972052811465,
                                    "order": 7
                                },
                                {
                                    "power": 212,
                                    "airflow": 748.02,
                                    "percentCapacity": 40.28117770426412,
                                    "timeInterval": 1,
                                    "percentPower": 73.07824887969664,
                                    "percentSystemCapacity": 4.099197007716926,
                                    "percentSystemPower": 7.104081495878292,
                                    "order": 7
                                },
                                {
                                    "power": 211,
                                    "airflow": 740.24,
                                    "percentCapacity": 39.86231997418118,
                                    "timeInterval": 2,
                                    "percentPower": 72.733540158566,
                                    "percentSystemCapacity": 4.056572128017013,
                                    "percentSystemPower": 7.070571677501508,
                                    "order": 7
                                },
                                {
                                    "power": 207.6,
                                    "airflow": 714.33,
                                    "percentCapacity": 38.46666420265902,
                                    "timeInterval": 3,
                                    "percentPower": 71.56153050672181,
                                    "percentSystemCapacity": 3.914543808874277,
                                    "percentSystemPower": 6.956638295020441,
                                    "order": 7
                                },
                                {
                                    "power": 218.8,
                                    "airflow": 802.9,
                                    "percentCapacity": 43.23635570216482,
                                    "timeInterval": 4,
                                    "percentPower": 75.42226818338503,
                                    "percentSystemCapacity": 4.399929446455506,
                                    "percentSystemPower": 7.331948260840428,
                                    "order": 7
                                },
                                {
                                    "power": 212.8,
                                    "airflow": 754.3,
                                    "percentCapacity": 40.619076976350485,
                                    "timeInterval": 5,
                                    "percentPower": 73.35401585660118,
                                    "percentSystemCapacity": 4.133583184189109,
                                    "percentSystemPower": 7.130889350579721,
                                    "order": 7
                                },
                                {
                                    "power": 222.2,
                                    "airflow": 831.72,
                                    "percentCapacity": 44.78816194161088,
                                    "timeInterval": 6,
                                    "percentPower": 76.59427783522922,
                                    "percentSystemCapacity": 4.557848351905492,
                                    "percentSystemPower": 7.445881643321493,
                                    "order": 7
                                },
                                {
                                    "power": 209.6,
                                    "airflow": 729.47,
                                    "percentCapacity": 39.28237622225458,
                                    "timeInterval": 7,
                                    "percentPower": 72.2509479489831,
                                    "percentSystemCapacity": 3.9975543974532415,
                                    "percentSystemPower": 7.023657931774011,
                                    "order": 7
                                },
                                {
                                    "power": 218.9,
                                    "airflow": 803.73,
                                    "percentCapacity": 43.28126452670609,
                                    "timeInterval": 8,
                                    "percentPower": 75.4567390554981,
                                    "percentSystemCapacity": 4.4044995739858175,
                                    "percentSystemPower": 7.335299242678104,
                                    "order": 7
                                },
                                {
                                    "power": 224.7,
                                    "airflow": 853.53,
                                    "percentCapacity": 45.963002398270206,
                                    "timeInterval": 9,
                                    "percentPower": 77.45604963805583,
                                    "percentSystemCapacity": 4.677405493949352,
                                    "percentSystemPower": 7.529656189263455,
                                    "order": 7
                                },
                                {
                                    "power": 224.3,
                                    "airflow": 850.01,
                                    "percentCapacity": 45.773043341793795,
                                    "timeInterval": 10,
                                    "percentPower": 77.31816614960358,
                                    "percentSystemCapacity": 4.6580743909311195,
                                    "percentSystemPower": 7.516252261912741,
                                    "order": 7
                                },
                                {
                                    "power": 230.8,
                                    "airflow": 909.15,
                                    "percentCapacity": 48.95825871132659,
                                    "timeInterval": 11,
                                    "percentPower": 79.55877283695277,
                                    "percentSystemCapacity": 4.982216485474216,
                                    "percentSystemPower": 7.73406608136184,
                                    "order": 7
                                },
                                {
                                    "power": 232.4,
                                    "airflow": 924.34,
                                    "percentCapacity": 49.77593149739461,
                                    "timeInterval": 12,
                                    "percentPower": 80.1103067907618,
                                    "percentSystemCapacity": 5.065426610623728,
                                    "percentSystemPower": 7.787681790764695,
                                    "order": 7
                                },
                                {
                                    "power": 237.2,
                                    "airflow": 971.49,
                                    "percentCapacity": 52.31490483808674,
                                    "timeInterval": 13,
                                    "percentPower": 81.7649086521889,
                                    "percentSystemCapacity": 5.323804158501046,
                                    "percentSystemPower": 7.948528918973259,
                                    "order": 7
                                },
                                {
                                    "power": 238.3,
                                    "airflow": 982.65,
                                    "percentCapacity": 52.91574798127563,
                                    "timeInterval": 14,
                                    "percentPower": 82.14408824543261,
                                    "percentSystemCapacity": 5.384948706774926,
                                    "percentSystemPower": 7.985389719187723,
                                    "order": 7
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 15,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 7
                                },
                                {
                                    "power": 239.7,
                                    "airflow": 997.04,
                                    "percentCapacity": 53.69116400802525,
                                    "timeInterval": 16,
                                    "percentPower": 82.6266804550155,
                                    "percentSystemCapacity": 5.463858590689549,
                                    "percentSystemPower": 8.03230346491522,
                                    "order": 7
                                },
                                {
                                    "power": 238.50000000000003,
                                    "airflow": 984.69,
                                    "percentCapacity": 53.02578167749572,
                                    "timeInterval": 17,
                                    "percentPower": 82.21302998965874,
                                    "percentSystemCapacity": 5.396146239319901,
                                    "percentSystemPower": 7.99209168286308,
                                    "order": 7
                                },
                                {
                                    "power": 239,
                                    "airflow": 989.82,
                                    "percentCapacity": 53.30194046803947,
                                    "timeInterval": 18,
                                    "percentPower": 82.38538435022406,
                                    "percentSystemCapacity": 5.424249421807831,
                                    "percentSystemPower": 8.008846592051471,
                                    "order": 7
                                },
                                {
                                    "power": 233,
                                    "airflow": 930.1,
                                    "percentCapacity": 50.08615994515806,
                                    "timeInterval": 19,
                                    "percentPower": 80.31713202344018,
                                    "percentSystemCapacity": 5.09699687736511,
                                    "percentSystemPower": 7.8077876817907645,
                                    "order": 7
                                },
                                {
                                    "power": 226.3,
                                    "airflow": 867.79,
                                    "percentCapacity": 46.73057505640279,
                                    "timeInterval": 20,
                                    "percentPower": 78.00758359186487,
                                    "percentSystemCapacity": 4.755517200774879,
                                    "percentSystemPower": 7.583271898666311,
                                    "order": 7
                                },
                                {
                                    "power": 233,
                                    "airflow": 930.1,
                                    "percentCapacity": 50.08615994515806,
                                    "timeInterval": 21,
                                    "percentPower": 80.31713202344018,
                                    "percentSystemCapacity": 5.09699687736511,
                                    "percentSystemPower": 7.8077876817907645,
                                    "order": 7
                                },
                                {
                                    "power": 210.9,
                                    "airflow": 739.47,
                                    "percentCapacity": 39.820646998872256,
                                    "timeInterval": 22,
                                    "percentPower": 72.69906928645294,
                                    "percentSystemCapacity": 4.052331295314872,
                                    "percentSystemPower": 7.0672206956638295,
                                    "order": 7
                                },
                                {
                                    "power": 197.5,
                                    "airflow": 641.82,
                                    "percentCapacity": 34.56222786994664,
                                    "timeInterval": 23,
                                    "percentPower": 68.07997242330231,
                                    "percentSystemCapacity": 3.517210497286875,
                                    "percentSystemPower": 6.618189129414918,
                                    "order": 7
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "wys7qh9g0",
                            "avgPower": 223.85000000000002,
                            "avgAirflow": 852.5258333333333,
                            "avgPrecentPower": 77.16304722509477,
                            "avgPercentCapacity": 45.90873663058179,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 241.5,
                                    "airflow": 1015.89,
                                    "percentCapacity": 54.706220793618684,
                                    "timeInterval": 0,
                                    "percentPower": 83.24715615305067,
                                    "percentSystemCapacity": 5.567155415045479,
                                    "percentSystemPower": 8.092621137993433,
                                    "order": 7
                                },
                                {
                                    "power": 241.5,
                                    "airflow": 1015.89,
                                    "percentCapacity": 54.706220793618684,
                                    "timeInterval": 1,
                                    "percentPower": 83.24715615305067,
                                    "percentSystemCapacity": 5.567155415045479,
                                    "percentSystemPower": 8.092621137993433,
                                    "order": 7
                                },
                                {
                                    "power": 240.8,
                                    "airflow": 1008.52,
                                    "percentCapacity": 54.30902017970474,
                                    "timeInterval": 2,
                                    "percentPower": 83.00586004825922,
                                    "percentSystemCapacity": 5.526734462610242,
                                    "percentSystemPower": 8.069164265129684,
                                    "order": 7
                                },
                                {
                                    "power": 240.3,
                                    "airflow": 1003.29,
                                    "percentCapacity": 54.0272265739973,
                                    "timeInterval": 3,
                                    "percentPower": 82.8335056876939,
                                    "percentSystemCapacity": 5.498057855541045,
                                    "percentSystemPower": 8.052409355941291,
                                    "order": 7
                                },
                                {
                                    "power": 241,
                                    "airflow": 1010.62,
                                    "percentCapacity": 54.422184489419756,
                                    "timeInterval": 4,
                                    "percentPower": 83.07480179248535,
                                    "percentSystemCapacity": 5.538250580713091,
                                    "percentSystemPower": 8.07586622880504,
                                    "order": 7
                                },
                                {
                                    "power": 240.1,
                                    "airflow": 1001.2,
                                    "percentCapacity": 53.91495351147111,
                                    "timeInterval": 5,
                                    "percentPower": 82.76456394346776,
                                    "percentSystemCapacity": 5.486632434831316,
                                    "percentSystemPower": 8.045707392265934,
                                    "order": 7
                                },
                                {
                                    "power": 234.9,
                                    "airflow": 948.59,
                                    "percentCapacity": 51.0818282056146,
                                    "timeInterval": 6,
                                    "percentPower": 80.97207859358842,
                                    "percentSystemCapacity": 5.198320636662994,
                                    "percentSystemPower": 7.871456336706656,
                                    "order": 7
                                },
                                {
                                    "power": 239.5,
                                    "airflow": 994.97,
                                    "percentCapacity": 53.57964570073679,
                                    "timeInterval": 7,
                                    "percentPower": 82.55773871078938,
                                    "percentSystemCapacity": 5.4525099773272805,
                                    "percentSystemPower": 8.025601501239864,
                                    "order": 7
                                },
                                {
                                    "power": 239.3,
                                    "airflow": 992.91,
                                    "percentCapacity": 53.46837711952131,
                                    "timeInterval": 8,
                                    "percentPower": 82.48879696656324,
                                    "percentSystemCapacity": 5.44118677723318,
                                    "percentSystemPower": 8.018899537564508,
                                    "order": 7
                                },
                                {
                                    "power": 237.7,
                                    "airflow": 976.54,
                                    "percentCapacity": 52.587108861529245,
                                    "timeInterval": 9,
                                    "percentPower": 81.93726301275422,
                                    "percentSystemCapacity": 5.351504885788021,
                                    "percentSystemPower": 7.965283828161651,
                                    "order": 7
                                },
                                {
                                    "power": 238.6,
                                    "airflow": 985.71,
                                    "percentCapacity": 53.08089040369188,
                                    "timeInterval": 10,
                                    "percentPower": 82.2475008617718,
                                    "percentSystemCapacity": 5.401754355526952,
                                    "percentSystemPower": 7.995442664700758,
                                    "order": 7
                                },
                                {
                                    "power": 239.2,
                                    "airflow": 991.88,
                                    "percentCapacity": 53.41283618784261,
                                    "timeInterval": 11,
                                    "percentPower": 82.45432609445018,
                                    "percentSystemCapacity": 5.435534677818047,
                                    "percentSystemPower": 8.015548555726829,
                                    "order": 7
                                },
                                {
                                    "power": 239.6,
                                    "airflow": 996.01,
                                    "percentCapacity": 53.635373580814985,
                                    "timeInterval": 12,
                                    "percentPower": 82.59220958290244,
                                    "percentSystemCapacity": 5.458181101467197,
                                    "percentSystemPower": 8.028952483077543,
                                    "order": 7
                                },
                                {
                                    "power": 239.99999999999997,
                                    "airflow": 1000.16,
                                    "percentCapacity": 53.85891173340009,
                                    "timeInterval": 13,
                                    "percentPower": 82.73009307135469,
                                    "percentSystemCapacity": 5.480929366994957,
                                    "percentSystemPower": 8.042356410428255,
                                    "order": 7
                                },
                                {
                                    "power": 239.3,
                                    "airflow": 992.91,
                                    "percentCapacity": 53.46837711952131,
                                    "timeInterval": 14,
                                    "percentPower": 82.48879696656324,
                                    "percentSystemCapacity": 5.44118677723318,
                                    "percentSystemPower": 8.018899537564508,
                                    "order": 7
                                },
                                {
                                    "power": 239.6,
                                    "airflow": 996.01,
                                    "percentCapacity": 53.635373580814985,
                                    "timeInterval": 15,
                                    "percentPower": 82.59220958290244,
                                    "percentSystemCapacity": 5.458181101467197,
                                    "percentSystemPower": 8.028952483077543,
                                    "order": 7
                                },
                                {
                                    "power": 240.19999999999996,
                                    "airflow": 1002.24,
                                    "percentCapacity": 53.97105841922265,
                                    "timeInterval": 16,
                                    "percentPower": 82.79903481558082,
                                    "percentSystemCapacity": 5.492341927032906,
                                    "percentSystemPower": 8.04905837410361,
                                    "order": 7
                                },
                                {
                                    "power": 240.4,
                                    "airflow": 1004.33,
                                    "percentCapacity": 54.083458093414016,
                                    "timeInterval": 17,
                                    "percentPower": 82.86797655980695,
                                    "percentSystemCapacity": 5.503780232325177,
                                    "percentSystemPower": 8.055760337778969,
                                    "order": 7
                                },
                                {
                                    "power": 239.99999999999997,
                                    "airflow": 1000.16,
                                    "percentCapacity": 53.85891173340009,
                                    "timeInterval": 18,
                                    "percentPower": 82.73009307135469,
                                    "percentSystemCapacity": 5.480929366994957,
                                    "percentSystemPower": 8.042356410428255,
                                    "order": 7
                                },
                                {
                                    "power": 240.6,
                                    "airflow": 1006.42,
                                    "percentCapacity": 54.19611169805525,
                                    "timeInterval": 19,
                                    "percentPower": 82.93691830403309,
                                    "percentSystemCapacity": 5.515244378742251,
                                    "percentSystemPower": 8.062462301454326,
                                    "order": 7
                                },
                                {
                                    "power": 243.7,
                                    "airflow": 1039.46,
                                    "percentCapacity": 55.97543230584003,
                                    "timeInterval": 20,
                                    "percentPower": 84.00551533953808,
                                    "percentSystemCapacity": 5.696316187633984,
                                    "percentSystemPower": 8.166342738422358,
                                    "order": 7
                                },
                                {
                                    "power": 275.5,
                                    "airflow": 1463.3,
                                    "percentCapacity": 78.79900266551543,
                                    "timeInterval": 21,
                                    "percentPower": 94.96725267149259,
                                    "percentSystemCapacity": 8.018947169545273,
                                    "percentSystemPower": 9.231954962804103,
                                    "order": 7
                                },
                                {
                                    "power": 283.4,
                                    "airflow": 1600.53,
                                    "percentCapacity": 86.18916514306684,
                                    "timeInterval": 22,
                                    "percentPower": 97.69045156842466,
                                    "percentSystemCapacity": 8.771003927590701,
                                    "percentSystemPower": 9.496682527980699,
                                    "order": 7
                                },
                                {
                                    "power": 282.6,
                                    "airflow": 1585.89,
                                    "percentCapacity": 85.40083500952385,
                                    "timeInterval": 23,
                                    "percentPower": 97.41468459152016,
                                    "percentSystemCapacity": 8.690779845061693,
                                    "percentSystemPower": 9.469874673279271,
                                    "order": 7
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 1857,
                            "logToolFieldId": "wys7qh9g0",
                            "avgPower": 244.9708333333333,
                            "avgAirflow": 1068.0595833333332,
                            "avgPrecentPower": 84.4435826726416,
                            "avgPercentCapacity": 57.51535516263985,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 378,
                                    "airflow": 1091.53,
                                    "percentCapacity": 35.26745761316419,
                                    "timeInterval": 0,
                                    "percentPower": 75.99517490952957,
                                    "percentSystemCapacity": 5.981629839584786,
                                    "percentSystemPower": 12.666711346424503,
                                    "order": 8
                                },
                                {
                                    "power": 372.2,
                                    "airflow": 1048.05,
                                    "percentCapacity": 33.862558651153975,
                                    "timeInterval": 1,
                                    "percentPower": 74.82911137917169,
                                    "percentSystemCapacity": 5.743348258730904,
                                    "percentSystemPower": 12.472354399839153,
                                    "order": 8
                                },
                                {
                                    "power": 380.9,
                                    "airflow": 1114.01,
                                    "percentCapacity": 35.99395232063216,
                                    "timeInterval": 2,
                                    "percentPower": 76.57820667470848,
                                    "percentSystemCapacity": 6.104848883842423,
                                    "percentSystemPower": 12.763889819717178,
                                    "order": 8
                                },
                                {
                                    "power": 393.9,
                                    "airflow": 1221.51,
                                    "percentCapacity": 39.46735471452128,
                                    "timeInterval": 3,
                                    "percentPower": 79.19179734620025,
                                    "percentSystemCapacity": 6.6939644257695825,
                                    "percentSystemPower": 13.199517458615375,
                                    "order": 8
                                },
                                {
                                    "power": 390.2,
                                    "airflow": 1189.74,
                                    "percentCapacity": 38.44070518099008,
                                    "timeInterval": 4,
                                    "percentPower": 78.44792923200643,
                                    "percentSystemCapacity": 6.5198368333606025,
                                    "percentSystemPower": 13.075531130621274,
                                    "order": 8
                                },
                                {
                                    "power": 391.1,
                                    "airflow": 1197.38,
                                    "percentCapacity": 38.68751424364771,
                                    "timeInterval": 5,
                                    "percentPower": 78.62887012464817,
                                    "percentSystemCapacity": 6.561697533104432,
                                    "percentSystemPower": 13.10568996716038,
                                    "order": 8
                                },
                                {
                                    "power": 384.2,
                                    "airflow": 1140.23,
                                    "percentCapacity": 36.84118596979311,
                                    "timeInterval": 6,
                                    "percentPower": 77.24165661439486,
                                    "percentSystemCapacity": 6.248546173635997,
                                    "percentSystemPower": 12.874472220360566,
                                    "order": 8
                                },
                                {
                                    "power": 384.9,
                                    "airflow": 1145.89,
                                    "percentCapacity": 37.02379802292746,
                                    "timeInterval": 7,
                                    "percentPower": 77.38238841978287,
                                    "percentSystemCapacity": 6.279518570854916,
                                    "percentSystemPower": 12.897929093224313,
                                    "order": 8
                                },
                                {
                                    "power": 388.6,
                                    "airflow": 1176.3,
                                    "percentCapacity": 38.0064532332856,
                                    "timeInterval": 8,
                                    "percentPower": 78.12625653397669,
                                    "percentSystemCapacity": 6.446184390454785,
                                    "percentSystemPower": 13.021915421218418,
                                    "order": 8
                                },
                                {
                                    "power": 371.4,
                                    "airflow": 1042.2,
                                    "percentCapacity": 33.673611768739555,
                                    "timeInterval": 9,
                                    "percentPower": 74.66827503015682,
                                    "percentSystemCapacity": 5.711301426142531,
                                    "percentSystemPower": 12.445546545137725,
                                    "order": 8
                                },
                                {
                                    "power": 368.2,
                                    "airflow": 1019.15,
                                    "percentCapacity": 32.92906614086988,
                                    "timeInterval": 10,
                                    "percentPower": 74.0249296340973,
                                    "percentSystemCapacity": 5.585020808088134,
                                    "percentSystemPower": 12.338315126332015,
                                    "order": 8
                                },
                                {
                                    "power": 345.9,
                                    "airflow": 872.51,
                                    "percentCapacity": 28.190810667212208,
                                    "timeInterval": 11,
                                    "percentPower": 69.5416164053076,
                                    "percentSystemCapacity": 4.781376535237932,
                                    "percentSystemPower": 11.591046176529723,
                                    "order": 8
                                },
                                {
                                    "power": 355.6,
                                    "airflow": 933.48,
                                    "percentCapacity": 30.16096057838913,
                                    "timeInterval": 12,
                                    "percentPower": 71.491757137113,
                                    "percentSystemCapacity": 5.1155289889365605,
                                    "percentSystemPower": 11.916091414784534,
                                    "order": 8
                                },
                                {
                                    "power": 356.5,
                                    "airflow": 939.35,
                                    "percentCapacity": 30.350533154327806,
                                    "timeInterval": 13,
                                    "percentPower": 71.67269802975473,
                                    "percentSystemCapacity": 5.147681943919583,
                                    "percentSystemPower": 11.946250251323638,
                                    "order": 8
                                },
                                {
                                    "power": 356,
                                    "airflow": 936.08,
                                    "percentCapacity": 30.245067554337446,
                                    "timeInterval": 14,
                                    "percentPower": 71.57217531162044,
                                    "percentSystemCapacity": 5.129794173645024,
                                    "percentSystemPower": 11.929495342135246,
                                    "order": 8
                                },
                                {
                                    "power": 353.5,
                                    "airflow": 919.93,
                                    "percentCapacity": 29.7232268653284,
                                    "timeInterval": 15,
                                    "percentPower": 71.06956172094894,
                                    "percentSystemCapacity": 5.041286012066605,
                                    "percentSystemPower": 11.845720796193286,
                                    "order": 8
                                },
                                {
                                    "power": 357.1,
                                    "airflow": 943.28,
                                    "percentCapacity": 30.477581442691594,
                                    "timeInterval": 16,
                                    "percentPower": 71.79332529151588,
                                    "percentSystemCapacity": 5.169230302780057,
                                    "percentSystemPower": 11.96635614234971,
                                    "order": 8
                                },
                                {
                                    "power": 362.4,
                                    "airflow": 978.75,
                                    "percentCapacity": 31.623621992262162,
                                    "timeInterval": 17,
                                    "percentPower": 72.85886610373944,
                                    "percentSystemCapacity": 5.36360752225183,
                                    "percentSystemPower": 12.143958179746665,
                                    "order": 8
                                },
                                {
                                    "power": 357.9,
                                    "airflow": 948.55,
                                    "percentCapacity": 30.647816046472798,
                                    "timeInterval": 18,
                                    "percentPower": 71.95416164053076,
                                    "percentSystemCapacity": 5.198103390170612,
                                    "percentSystemPower": 11.993163997051136,
                                    "order": 8
                                },
                                {
                                    "power": 367.1,
                                    "airflow": 1011.36,
                                    "percentCapacity": 32.67719614713831,
                                    "timeInterval": 19,
                                    "percentPower": 73.80377965420186,
                                    "percentSystemCapacity": 5.542301735828204,
                                    "percentSystemPower": 12.301454326117554,
                                    "order": 8
                                },
                                {
                                    "power": 381.8,
                                    "airflow": 1121.1,
                                    "percentCapacity": 36.222812364789725,
                                    "timeInterval": 20,
                                    "percentPower": 76.75914756735023,
                                    "percentSystemCapacity": 6.143665293129341,
                                    "percentSystemPower": 12.794048656256285,
                                    "order": 8
                                },
                                {
                                    "power": 383,
                                    "airflow": 1130.62,
                                    "percentCapacity": 36.530516500998324,
                                    "timeInterval": 21,
                                    "percentPower": 77.00040209087254,
                                    "percentSystemCapacity": 6.195854261869235,
                                    "percentSystemPower": 12.834260438308426,
                                    "order": 8
                                },
                                {
                                    "power": 387.9,
                                    "airflow": 1170.48,
                                    "percentCapacity": 37.81826121140575,
                                    "timeInterval": 22,
                                    "percentPower": 77.98552472858866,
                                    "percentSystemCapacity": 6.414265587971328,
                                    "percentSystemPower": 12.99845854835467,
                                    "order": 8
                                },
                                {
                                    "power": 392.3,
                                    "airflow": 1207.65,
                                    "percentCapacity": 39.01948831567488,
                                    "timeInterval": 23,
                                    "percentPower": 78.87012464817049,
                                    "percentSystemCapacity": 6.618002868095887,
                                    "percentSystemPower": 13.145901749212522,
                                    "order": 8
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ci82gloj4",
                            "avgPower": 373.35833333333335,
                            "avgAirflow": 1062.46375,
                            "avgPrecentPower": 75.06198900951617,
                            "avgPercentCapacity": 34.32839794586473,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 431.00000000000006,
                                    "airflow": 1605.93,
                                    "percentCapacity": 51.887820311910374,
                                    "timeInterval": 0,
                                    "percentPower": 86.6505830317652,
                                    "percentSystemCapacity": 8.800570137295189,
                                    "percentSystemPower": 14.442731720394079,
                                    "order": 8
                                },
                                {
                                    "power": 432,
                                    "airflow": 1618.31,
                                    "percentCapacity": 52.28775939397501,
                                    "timeInterval": 1,
                                    "percentPower": 86.85162846803378,
                                    "percentSystemCapacity": 8.868402856441946,
                                    "percentSystemPower": 14.476241538770863,
                                    "order": 8
                                },
                                {
                                    "power": 427.40000000000003,
                                    "airflow": 1562.39,
                                    "percentCapacity": 50.481024456284196,
                                    "timeInterval": 2,
                                    "percentPower": 85.92681946119825,
                                    "percentSystemCapacity": 8.561966828814093,
                                    "percentSystemPower": 14.322096374237653,
                                    "order": 8
                                },
                                {
                                    "power": 442.6000000000001,
                                    "airflow": 1757.68,
                                    "percentCapacity": 56.790791835748955,
                                    "timeInterval": 3,
                                    "percentPower": 88.98271009248091,
                                    "percentSystemCapacity": 9.632151508748521,
                                    "percentSystemPower": 14.831445613564778,
                                    "order": 8
                                },
                                {
                                    "power": 432.2,
                                    "airflow": 1620.8,
                                    "percentCapacity": 52.36823638019672,
                                    "timeInterval": 4,
                                    "percentPower": 86.8918375552875,
                                    "percentSystemCapacity": 8.88205236720237,
                                    "percentSystemPower": 14.482943502446217,
                                    "order": 8
                                },
                                {
                                    "power": 438.9,
                                    "airflow": 1707.27,
                                    "percentCapacity": 55.1621213364351,
                                    "timeInterval": 5,
                                    "percentPower": 88.2388419782871,
                                    "percentSystemCapacity": 9.355916568186466,
                                    "percentSystemPower": 14.707459285570673,
                                    "order": 8
                                },
                                {
                                    "power": 429.49999999999994,
                                    "airflow": 1587.59,
                                    "percentCapacity": 51.29545640542696,
                                    "timeInterval": 6,
                                    "percentPower": 86.34901487736228,
                                    "percentSystemCapacity": 8.700100700065565,
                                    "percentSystemPower": 14.392466992828897,
                                    "order": 8
                                },
                                {
                                    "power": 412.9,
                                    "airflow": 1401.8,
                                    "percentCapacity": 45.29239173132229,
                                    "timeInterval": 7,
                                    "percentPower": 83.01166063530357,
                                    "percentSystemCapacity": 7.681935138559978,
                                    "percentSystemPower": 13.836204007774278,
                                    "order": 8
                                },
                                {
                                    "power": 415.6,
                                    "airflow": 1430.04,
                                    "percentCapacity": 46.204722639340325,
                                    "timeInterval": 8,
                                    "percentPower": 83.5544833132288,
                                    "percentSystemCapacity": 7.836673420032787,
                                    "percentSystemPower": 13.926680517391599,
                                    "order": 8
                                },
                                {
                                    "power": 410,
                                    "airflow": 1372.25,
                                    "percentCapacity": 44.33771177345247,
                                    "timeInterval": 9,
                                    "percentPower": 82.42862887012465,
                                    "percentSystemCapacity": 7.520014135183876,
                                    "percentSystemPower": 13.739025534481602,
                                    "order": 8
                                },
                                {
                                    "power": 410.4,
                                    "airflow": 1376.28,
                                    "percentCapacity": 44.46787611966578,
                                    "timeInterval": 10,
                                    "percentPower": 82.50904704463208,
                                    "percentSystemCapacity": 7.542091001225646,
                                    "percentSystemPower": 13.752429461832316,
                                    "order": 8
                                },
                                {
                                    "power": 391.4,
                                    "airflow": 1199.94,
                                    "percentCapacity": 38.77019586457613,
                                    "timeInterval": 11,
                                    "percentPower": 78.68918375552875,
                                    "percentSystemCapacity": 6.575720966728579,
                                    "percentSystemPower": 13.115742912673415,
                                    "order": 8
                                },
                                {
                                    "power": 381.6,
                                    "airflow": 1119.52,
                                    "percentCapacity": 36.17181336715891,
                                    "timeInterval": 12,
                                    "percentPower": 76.71893848009651,
                                    "percentSystemCapacity": 6.135015474098906,
                                    "percentSystemPower": 12.787346692580929,
                                    "order": 8
                                },
                                {
                                    "power": 395.2,
                                    "airflow": 1232.92,
                                    "percentCapacity": 39.835733821609985,
                                    "timeInterval": 13,
                                    "percentPower": 79.45315641334942,
                                    "percentSystemCapacity": 6.756444332413575,
                                    "percentSystemPower": 13.243080222505194,
                                    "order": 8
                                },
                                {
                                    "power": 397.9,
                                    "airflow": 1257,
                                    "percentCapacity": 40.61401845296988,
                                    "timeInterval": 14,
                                    "percentPower": 79.99597909127462,
                                    "percentSystemCapacity": 6.888447342828901,
                                    "percentSystemPower": 13.333556732122512,
                                    "order": 8
                                },
                                {
                                    "power": 406.1,
                                    "airflow": 1333.74,
                                    "percentCapacity": 43.09322432329337,
                                    "timeInterval": 15,
                                    "percentPower": 81.64455166867714,
                                    "percentSystemCapacity": 7.308939570396371,
                                    "percentSystemPower": 13.608337242812146,
                                    "order": 8
                                },
                                {
                                    "power": 399,
                                    "airflow": 1266.98,
                                    "percentCapacity": 40.93632314189368,
                                    "timeInterval": 16,
                                    "percentPower": 80.21712907117009,
                                    "percentSystemCapacity": 6.943112676685716,
                                    "percentSystemPower": 13.370417532336976,
                                    "order": 8
                                },
                                {
                                    "power": 396.4,
                                    "airflow": 1243.55,
                                    "percentCapacity": 40.17941459130814,
                                    "timeInterval": 17,
                                    "percentPower": 79.69441093687173,
                                    "percentSystemCapacity": 6.814735212631449,
                                    "percentSystemPower": 13.283292004557335,
                                    "order": 8
                                },
                                {
                                    "power": 400.5,
                                    "airflow": 1280.74,
                                    "percentCapacity": 41.3808257152398,
                                    "timeInterval": 18,
                                    "percentPower": 80.51869722557299,
                                    "percentSystemCapacity": 7.018503703894519,
                                    "percentSystemPower": 13.420682259902152,
                                    "order": 8
                                },
                                {
                                    "power": 400.2,
                                    "airflow": 1277.97,
                                    "percentCapacity": 41.29145908962717,
                                    "timeInterval": 19,
                                    "percentPower": 80.4583835946924,
                                    "percentSystemCapacity": 7.003346442481154,
                                    "percentSystemPower": 13.410629314389116,
                                    "order": 8
                                },
                                {
                                    "power": 396.6,
                                    "airflow": 1245.34,
                                    "percentCapacity": 40.237038533754976,
                                    "timeInterval": 20,
                                    "percentPower": 79.73462002412546,
                                    "percentSystemCapacity": 6.824508672839307,
                                    "percentSystemPower": 13.289993968232693,
                                    "order": 8
                                },
                                {
                                    "power": 397,
                                    "airflow": 1248.91,
                                    "percentCapacity": 40.352583558532814,
                                    "timeInterval": 21,
                                    "percentPower": 79.81503819863289,
                                    "percentSystemCapacity": 6.8441059904460255,
                                    "percentSystemPower": 13.303397895583407,
                                    "order": 8
                                },
                                {
                                    "power": 401.7,
                                    "airflow": 1291.87,
                                    "percentCapacity": 41.74065213268654,
                                    "timeInterval": 22,
                                    "percentPower": 80.7599517490953,
                                    "percentSystemCapacity": 7.079533009133321,
                                    "percentSystemPower": 13.460894041954294,
                                    "order": 8
                                },
                                {
                                    "power": 404.6,
                                    "airflow": 1319.28,
                                    "percentCapacity": 42.62614453697977,
                                    "timeInterval": 23,
                                    "percentPower": 81.34298351427424,
                                    "percentSystemCapacity": 7.229719275644037,
                                    "percentSystemPower": 13.55807251524697,
                                    "order": 8
                                }
                            ],
                            "fullLoadPressure": 100,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "ci82gloj4",
                            "avgPower": 410.4458333333334,
                            "avgAirflow": 1389.9208333333336,
                            "avgPrecentPower": 82.51826162712774,
                            "avgPercentCapacity": 44.90855581305791,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "dayTypeId": "hopx028cf",
                            "profileSummaryData": [
                                {
                                    "power": 357.8,
                                    "airflow": 1333.35,
                                    "percentCapacity": 57.59628638507497,
                                    "timeInterval": 0,
                                    "percentPower": 86.32086851628469,
                                    "percentSystemCapacity": 7.3068502291455815,
                                    "percentSystemPower": 11.989813015213459,
                                    "order": 2
                                },
                                {
                                    "power": 358,
                                    "airflow": 1335.52,
                                    "percentCapacity": 57.689974683197406,
                                    "timeInterval": 1,
                                    "percentPower": 86.36911942098915,
                                    "percentSystemCapacity": 7.3187358281237405,
                                    "percentSystemPower": 11.996514978888815,
                                    "order": 2
                                },
                                {
                                    "power": 357.8,
                                    "airflow": 1333.35,
                                    "percentCapacity": 57.59628638507497,
                                    "timeInterval": 2,
                                    "percentPower": 86.32086851628469,
                                    "percentSystemCapacity": 7.3068502291455815,
                                    "percentSystemPower": 11.989813015213459,
                                    "order": 2
                                },
                                {
                                    "power": 362.5,
                                    "airflow": 1385.49,
                                    "percentCapacity": 59.848256022848915,
                                    "timeInterval": 3,
                                    "percentPower": 87.45476477683957,
                                    "percentSystemCapacity": 7.5925423439771595,
                                    "percentSystemPower": 12.147309161584346,
                                    "order": 2
                                },
                                {
                                    "power": 365.6,
                                    "airflow": 1421.26,
                                    "percentCapacity": 61.393463712517615,
                                    "timeInterval": 4,
                                    "percentPower": 88.20265379975875,
                                    "percentSystemCapacity": 7.7885723637921025,
                                    "percentSystemPower": 12.251189598552378,
                                    "order": 2
                                },
                                {
                                    "power": 368.7,
                                    "airflow": 1458.2,
                                    "percentCapacity": 62.98909013933552,
                                    "timeInterval": 5,
                                    "percentPower": 88.95054282267793,
                                    "percentSystemCapacity": 7.990998666843583,
                                    "percentSystemPower": 12.355070035520408,
                                    "order": 2
                                },
                                {
                                    "power": 374.8,
                                    "airflow": 1534.52,
                                    "percentCapacity": 66.28616646619987,
                                    "timeInterval": 6,
                                    "percentPower": 90.42219541616406,
                                    "percentSystemCapacity": 8.409276379288288,
                                    "percentSystemPower": 12.559479927618794,
                                    "order": 2
                                },
                                {
                                    "power": 382.5,
                                    "airflow": 1638.43,
                                    "percentCapacity": 70.7745401997534,
                                    "timeInterval": 7,
                                    "percentPower": 92.2798552472859,
                                    "percentSystemCapacity": 8.978685914205894,
                                    "percentSystemPower": 12.817505529120032,
                                    "order": 2
                                },
                                {
                                    "power": 389.5,
                                    "airflow": 1741.09,
                                    "percentCapacity": 75.20894124717437,
                                    "timeInterval": 8,
                                    "percentPower": 93.9686369119421,
                                    "percentSystemCapacity": 9.54124830048272,
                                    "percentSystemPower": 13.052074257757523,
                                    "order": 2
                                },
                                {
                                    "power": 385.2,
                                    "airflow": 1677.05,
                                    "percentCapacity": 72.44271322711108,
                                    "timeInterval": 9,
                                    "percentPower": 92.93124246079614,
                                    "percentSystemCapacity": 9.190315712448607,
                                    "percentSystemPower": 12.90798203873735,
                                    "order": 2
                                },
                                {
                                    "power": 389.1,
                                    "airflow": 1734.99,
                                    "percentCapacity": 74.94573497374483,
                                    "timeInterval": 10,
                                    "percentPower": 93.87213510253318,
                                    "percentSystemCapacity": 9.507857105667432,
                                    "percentSystemPower": 13.03867033040681,
                                    "order": 2
                                },
                                {
                                    "power": 377.9,
                                    "airflow": 1575.29,
                                    "percentCapacity": 68.04715126071122,
                                    "timeInterval": 11,
                                    "percentPower": 91.17008443908323,
                                    "percentSystemCapacity": 8.632680576969886,
                                    "percentSystemPower": 12.663360364586824,
                                    "order": 2
                                },
                                {
                                    "power": 384.3,
                                    "airflow": 1664.04,
                                    "percentCapacity": 71.88092797777905,
                                    "timeInterval": 12,
                                    "percentPower": 92.71411338962606,
                                    "percentSystemCapacity": 9.119045827956954,
                                    "percentSystemPower": 12.877823202198247,
                                    "order": 2
                                },
                                {
                                    "power": 376.5,
                                    "airflow": 1556.71,
                                    "percentCapacity": 67.24443503728725,
                                    "timeInterval": 13,
                                    "percentPower": 90.83232810615199,
                                    "percentSystemCapacity": 8.530845413816309,
                                    "percentSystemPower": 12.616446618859326,
                                    "order": 2
                                },
                                {
                                    "power": 372.5,
                                    "airflow": 1505.16,
                                    "percentCapacity": 65.01758933162742,
                                    "timeInterval": 14,
                                    "percentPower": 89.86731001206273,
                                    "percentSystemCapacity": 8.248340601858697,
                                    "percentSystemPower": 12.48240734535219,
                                    "order": 2
                                },
                                {
                                    "power": 374.2,
                                    "airflow": 1526.79,
                                    "percentCapacity": 65.95217807764308,
                                    "timeInterval": 15,
                                    "percentPower": 90.27744270205066,
                                    "percentSystemCapacity": 8.366905537579118,
                                    "percentSystemPower": 12.53937403659272,
                                    "order": 2
                                },
                                {
                                    "power": 378.8,
                                    "airflow": 1587.39,
                                    "percentCapacity": 68.56978952613231,
                                    "timeInterval": 16,
                                    "percentPower": 91.38721351025332,
                                    "percentSystemCapacity": 8.698984149112029,
                                    "percentSystemPower": 12.69351920112593,
                                    "order": 2
                                },
                                {
                                    "power": 374.8,
                                    "airflow": 1534.52,
                                    "percentCapacity": 66.28616646619987,
                                    "timeInterval": 17,
                                    "percentPower": 90.42219541616406,
                                    "percentSystemCapacity": 8.409276379288288,
                                    "percentSystemPower": 12.559479927618794,
                                    "order": 2
                                },
                                {
                                    "power": 375,
                                    "airflow": 1537.11,
                                    "percentCapacity": 66.39798169564584,
                                    "timeInterval": 18,
                                    "percentPower": 90.47044632086852,
                                    "percentSystemCapacity": 8.423461619104565,
                                    "percentSystemPower": 12.566181891294152,
                                    "order": 2
                                },
                                {
                                    "power": 374.3,
                                    "airflow": 1528.08,
                                    "percentCapacity": 66.00769158162674,
                                    "timeInterval": 19,
                                    "percentPower": 90.3015681544029,
                                    "percentSystemCapacity": 8.373948159330661,
                                    "percentSystemPower": 12.542725018430401,
                                    "order": 2
                                },
                                {
                                    "power": 367.9,
                                    "airflow": 1448.55,
                                    "percentCapacity": 62.57234820605122,
                                    "timeInterval": 20,
                                    "percentPower": 88.75753920386006,
                                    "percentSystemCapacity": 7.938129444158734,
                                    "percentSystemPower": 12.32826218081898,
                                    "order": 2
                                },
                                {
                                    "power": 369.3,
                                    "airflow": 1465.49,
                                    "percentCapacity": 63.30395964169453,
                                    "timeInterval": 21,
                                    "percentPower": 89.09529553679133,
                                    "percentSystemCapacity": 8.030944025127292,
                                    "percentSystemPower": 12.37517592654648,
                                    "order": 2
                                },
                                {
                                    "power": 358.3,
                                    "airflow": 1338.78,
                                    "percentCapacity": 57.83085598844471,
                                    "timeInterval": 22,
                                    "percentPower": 86.44149577804583,
                                    "percentSystemCapacity": 7.336608483847518,
                                    "percentSystemPower": 12.006567924401851,
                                    "order": 2
                                },
                                {
                                    "power": 352.9,
                                    "airflow": 1281.52,
                                    "percentCapacity": 55.35743643729565,
                                    "timeInterval": 23,
                                    "percentPower": 85.13872135102532,
                                    "percentSystemCapacity": 7.022822520404397,
                                    "percentSystemPower": 11.825614905167214,
                                    "order": 2
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "tff9o23ah",
                            "avgPower": 372.00833333333327,
                            "avgAirflow": 1505.945,
                            "avgPrecentPower": 89.74869320466426,
                            "avgPercentCapacity": 65.05166519459048,
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "dayTypeId": "mufcn7yvy",
                            "profileSummaryData": [
                                {
                                    "power": 404,
                                    "airflow": 1982.9,
                                    "percentCapacity": 85.65422576716557,
                                    "timeInterval": 0,
                                    "percentPower": 97.46682750301568,
                                    "percentSystemCapacity": 10.86637070643294,
                                    "percentSystemPower": 13.537966624220898,
                                    "order": 2
                                },
                                {
                                    "power": 402.9,
                                    "airflow": 1963.01,
                                    "percentCapacity": 84.79534365565496,
                                    "timeInterval": 1,
                                    "percentPower": 97.20144752714113,
                                    "percentSystemCapacity": 10.757410157981214,
                                    "percentSystemPower": 13.501105824006435,
                                    "order": 2
                                },
                                {
                                    "power": 399.7,
                                    "airflow": 1906.69,
                                    "percentCapacity": 82.36229214971988,
                                    "timeInterval": 2,
                                    "percentPower": 96.42943305186972,
                                    "percentSystemCapacity": 10.448745414653745,
                                    "percentSystemPower": 13.393874405200723,
                                    "order": 2
                                },
                                {
                                    "power": 397.6,
                                    "airflow": 1870.91,
                                    "percentCapacity": 80.81678653395308,
                                    "timeInterval": 3,
                                    "percentPower": 95.92279855247287,
                                    "percentSystemCapacity": 10.252677598975305,
                                    "percentSystemPower": 13.323503786609479,
                                    "order": 2
                                },
                                {
                                    "power": 395.1,
                                    "airflow": 1829.49,
                                    "percentCapacity": 79.02758560816983,
                                    "timeInterval": 4,
                                    "percentPower": 95.31966224366707,
                                    "percentSystemCapacity": 10.025693812084237,
                                    "percentSystemPower": 13.239729240667517,
                                    "order": 2
                                },
                                {
                                    "power": 397,
                                    "airflow": 1860.85,
                                    "percentCapacity": 80.38242744388846,
                                    "timeInterval": 5,
                                    "percentPower": 95.77804583835947,
                                    "percentSystemCapacity": 10.197573407091285,
                                    "percentSystemPower": 13.303397895583407,
                                    "order": 2
                                },
                                {
                                    "power": 397.7,
                                    "airflow": 1872.59,
                                    "percentCapacity": 80.88948804133284,
                                    "timeInterval": 6,
                                    "percentPower": 95.94692400482508,
                                    "percentSystemCapacity": 10.26190074614673,
                                    "percentSystemPower": 13.326854768447156,
                                    "order": 2
                                },
                                {
                                    "power": 410.5,
                                    "airflow": 2106.16,
                                    "percentCapacity": 90.97887933375776,
                                    "timeInterval": 7,
                                    "percentPower": 99.03498190591074,
                                    "percentSystemCapacity": 11.54187339202374,
                                    "percentSystemPower": 13.755780443669996,
                                    "order": 2
                                },
                                {
                                    "power": 414,
                                    "airflow": 2176.88,
                                    "percentCapacity": 94.03367646833391,
                                    "timeInterval": 8,
                                    "percentPower": 99.87937273823884,
                                    "percentSystemCapacity": 11.929414786507728,
                                    "percentSystemPower": 13.873064807988742,
                                    "order": 2
                                },
                                {
                                    "power": 414.8,
                                    "airflow": 2193.5,
                                    "percentCapacity": 94.75145618501735,
                                    "timeInterval": 9,
                                    "percentPower": 100.0723763570567,
                                    "percentSystemCapacity": 12.020474631100129,
                                    "percentSystemPower": 13.899872662690168,
                                    "order": 2
                                },
                                {
                                    "power": 413.8,
                                    "airflow": 2172.75,
                                    "percentCapacity": 93.8553877652451,
                                    "timeInterval": 10,
                                    "percentPower": 99.83112183353438,
                                    "percentSystemCapacity": 11.906796507921,
                                    "percentSystemPower": 13.866362844313384,
                                    "order": 2
                                },
                                {
                                    "power": 416.6,
                                    "airflow": 2231.52,
                                    "percentCapacity": 96.39392552968076,
                                    "timeInterval": 11,
                                    "percentPower": 100.50663449939688,
                                    "percentSystemCapacity": 12.228843577444705,
                                    "percentSystemPower": 13.960190335768383,
                                    "order": 2
                                },
                                {
                                    "power": 419.29999999999995,
                                    "airflow": 2290.25,
                                    "percentCapacity": 98.93098509386569,
                                    "timeInterval": 12,
                                    "percentPower": 101.15802171290711,
                                    "percentSystemCapacity": 12.55070311772792,
                                    "percentSystemPower": 14.050666845385699,
                                    "order": 2
                                },
                                {
                                    "power": 418.5,
                                    "airflow": 2272.63,
                                    "percentCapacity": 98.1699045661653,
                                    "timeInterval": 13,
                                    "percentPower": 100.96501809408926,
                                    "percentSystemCapacity": 12.454149992912795,
                                    "percentSystemPower": 14.023858990684271,
                                    "order": 2
                                },
                                {
                                    "power": 420.9,
                                    "airflow": 2326.05,
                                    "percentCapacity": 100.47733719082288,
                                    "timeInterval": 14,
                                    "percentPower": 101.54402895054282,
                                    "percentSystemCapacity": 12.746878320734053,
                                    "percentSystemPower": 14.104282554788552,
                                    "order": 2
                                },
                                {
                                    "power": 415.8999999999999,
                                    "airflow": 2216.63,
                                    "percentCapacity": 95.75062259218382,
                                    "timeInterval": 15,
                                    "percentPower": 100.33775633293122,
                                    "percentSystemCapacity": 12.14723209671775,
                                    "percentSystemPower": 13.93673346290463,
                                    "order": 2
                                },
                                {
                                    "power": 413.2,
                                    "airflow": 2160.43,
                                    "percentCapacity": 93.32327290856864,
                                    "timeInterval": 16,
                                    "percentPower": 99.68636911942099,
                                    "percentSystemCapacity": 11.839290704917603,
                                    "percentSystemPower": 13.846256953287314,
                                    "order": 2
                                },
                                {
                                    "power": 412.3,
                                    "airflow": 2142.13,
                                    "percentCapacity": 92.53276837747731,
                                    "timeInterval": 17,
                                    "percentPower": 99.46924004825091,
                                    "percentSystemCapacity": 11.739004756349187,
                                    "percentSystemPower": 13.816098116748208,
                                    "order": 2
                                },
                                {
                                    "power": 414.6,
                                    "airflow": 2189.33,
                                    "percentCapacity": 94.57131454368249,
                                    "timeInterval": 18,
                                    "percentPower": 100.02412545235224,
                                    "percentSystemCapacity": 11.997621282804962,
                                    "percentSystemPower": 13.893170699014812,
                                    "order": 2
                                },
                                {
                                    "power": 412.1,
                                    "airflow": 2138.1,
                                    "percentCapacity": 92.35833891278773,
                                    "timeInterval": 19,
                                    "percentPower": 99.42098914354645,
                                    "percentSystemCapacity": 11.71687607316438,
                                    "percentSystemPower": 13.809396153072854,
                                    "order": 2
                                },
                                {
                                    "power": 412.3,
                                    "airflow": 2142.13,
                                    "percentCapacity": 92.53276837747731,
                                    "timeInterval": 20,
                                    "percentPower": 99.46924004825091,
                                    "percentSystemCapacity": 11.739004756349187,
                                    "percentSystemPower": 13.816098116748208,
                                    "order": 2
                                },
                                {
                                    "power": 413.4,
                                    "airflow": 2164.53,
                                    "percentCapacity": 93.50018745837616,
                                    "timeInterval": 21,
                                    "percentPower": 99.73462002412545,
                                    "percentSystemCapacity": 11.861734653997194,
                                    "percentSystemPower": 13.85295891696267,
                                    "order": 2
                                },
                                {
                                    "power": 408,
                                    "airflow": 2057.55,
                                    "percentCapacity": 88.87903705178547,
                                    "timeInterval": 22,
                                    "percentPower": 98.43184559710495,
                                    "percentSystemCapacity": 11.275480643077783,
                                    "percentSystemPower": 13.672005897728035,
                                    "order": 2
                                },
                                {
                                    "power": 409.1,
                                    "airflow": 2078.75,
                                    "percentCapacity": 89.79475386292125,
                                    "timeInterval": 23,
                                    "percentPower": 98.69722557297949,
                                    "percentSystemCapacity": 11.39165142441159,
                                    "percentSystemPower": 13.708866697942499,
                                    "order": 2
                                }
                            ],
                            "fullLoadPressure": 125,
                            "fullLoadCapacity": 2315,
                            "logToolFieldId": "tff9o23ah",
                            "avgPower": 409.7208333333333,
                            "avgAirflow": 2097.74,
                            "avgPrecentPower": 98.84700442299959,
                            "avgPercentCapacity": 90.61511522575142,
                            "automaticShutdownTimer": true
                        }
                    ]
                },
                "reduceRuntime": {
                    "runtimeData": [
                        {
                            "compressorId": "zh8wf6z6q",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "hopx028cf",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zh8wf6z6q",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "1i1iaygyz",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ljepu4k8q",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "wj0olxdhb",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": false
                        },
                        {
                            "compressorId": "o105l9t3y",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "zsekn3poe",
                            "fullLoadCapacity": 1857,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ofeeuny8i",
                            "fullLoadCapacity": 3095,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        },
                        {
                            "compressorId": "ehg2shiz2",
                            "fullLoadCapacity": 2315,
                            "intervalData": [
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 0
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 1
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 2
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 3
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 4
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 5
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 6
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 7
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 8
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 9
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 10
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 11
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 12
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 13
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 14
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 15
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 16
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 17
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 18
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 19
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 20
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 21
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 22
                                },
                                {
                                    "isCompressorOn": true,
                                    "timeInterval": 23
                                }
                            ],
                            "dayTypeId": "mufcn7yvy",
                            "automaticShutdownTimer": true
                        }
                    ],
                    "implementationCost": 0,
                    "order": 100
                },
                "addPrimaryReceiverVolume": {
                    "increasedVolume": 2000,
                    "implementationCost": 14000,
                    "order": 3
                }
            }
        ],
        "setupDone": true,
        "systemBasics": {
            "utilityType": "Electricity",
            "electricityCost": 0.066,
            "demandCost": 5,
            "notes": undefined
        },
        "systemInformation": {
            "systemElevation": null,
            "totalAirStorage": 3000,
            "isSequencerUsed": false,
            "targetPressure": null,
            "variance": null,
            "atmosphericPressure": 14.7,
            "atmosphericPressureKnown": true,
            "co2SavingsData": {
                "energyType": "electricity",
                "totalEmissionOutputRate": 430.78,
                "electricityUse": 6309742.399999998,
                "energySource": "Natural Gas",
                "fuelType": "Natural Gas",
                "eGridRegion": "",
                "eGridSubregion": "SRTV",
                "totalEmissionOutput": 0,
                "totalFuelEmissionOutputRate": null,
                "userEnteredBaselineEmissions": false,
                "userEnteredModificationEmissions": false,
                "zipcode": "37830"
            },
            "plantMaxPressure": undefined,
            "multiCompressorSystemControls": "cascading",
            "trimSelections": [
                {
                    "dayTypeId": "hopx028cf",
                    "compressorId": undefined
                },
                {
                    "dayTypeId": "mufcn7yvy",
                    "compressorId": undefined
                }
            ]
        },
        "compressorInventoryItems": [
            {
                "itemId": "zh8wf6z6q",
                "name": "Compressor A1",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:48.099Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 350,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 1857,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 385,
                    "totalPackageInputPower": 290.1
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
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
                "isValid": true,
                "compressorLibId": 769
            },
            {
                "itemId": "1i1iaygyz",
                "name": "Compressor B1",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:44.507Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 350,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 1857,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 385,
                    "totalPackageInputPower": 290.1
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
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
                "isValid": true,
                "compressorLibId": 769
            },
            {
                "itemId": "ljepu4k8q",
                "name": "Compressor C1",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:40.187Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 600,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 3095,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 654,
                    "totalPackageInputPower": 497.3
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
                    "fullLoad": {
                        "dischargePressure": 100,
                        "isDefaultPower": true,
                        "airflow": 3095,
                        "isDefaultAirFlow": true,
                        "power": 497.4,
                        "isDefaultPressure": true
                    },
                    "maxFullFlow": {
                        "dischargePressure": 110,
                        "isDefaultPower": true,
                        "airflow": 3072,
                        "isDefaultAirFlow": true,
                        "power": 524.5,
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
                        "power": 101.9,
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
                "isValid": true,
                "compressorLibId": 849
            },
            {
                "itemId": "wj0olxdhb",
                "name": "Compressor D1",
                "description": null,
                "modifiedDate": new Date("2022-05-06T19:47:54.705Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 500,
                    "fullLoadOperatingPressure": 125,
                    "fullLoadRatedCapacity": 2315,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 545,
                    "totalPackageInputPower": 414.4
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": false,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 135
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
                    "fullLoad": {
                        "dischargePressure": 125,
                        "isDefaultPower": true,
                        "airflow": 2315,
                        "isDefaultAirFlow": true,
                        "power": 414.5,
                        "isDefaultPressure": true
                    },
                    "maxFullFlow": {
                        "dischargePressure": 135,
                        "isDefaultPower": true,
                        "airflow": 2298,
                        "isDefaultAirFlow": true,
                        "power": 432,
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
                        "power": 84.9,
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
                "isValid": true,
                "compressorLibId": 834
            },
            {
                "itemId": "o105l9t3y",
                "name": "Compressor A2",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:20.474Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 350,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 1857,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 385,
                    "totalPackageInputPower": 290.1
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
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
                "isValid": true,
                "compressorLibId": 769
            },
            {
                "itemId": "zsekn3poe",
                "name": "Compressor B2",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:18.108Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 350,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 1857,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 385,
                    "totalPackageInputPower": 290.1
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
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
                "isValid": true,
                "compressorLibId": 769
            },
            {
                "itemId": "ofeeuny8i",
                "name": "Compressor C2",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:10.779Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 600,
                    "fullLoadOperatingPressure": 100,
                    "fullLoadRatedCapacity": 3095,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 654,
                    "totalPackageInputPower": 497.3
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 110
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
                    "fullLoad": {
                        "dischargePressure": 100,
                        "isDefaultPower": true,
                        "airflow": 3095,
                        "isDefaultAirFlow": true,
                        "power": 497.4,
                        "isDefaultPressure": true
                    },
                    "maxFullFlow": {
                        "dischargePressure": 110,
                        "isDefaultPower": true,
                        "airflow": 3072,
                        "isDefaultAirFlow": true,
                        "power": 524.5,
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
                        "power": 101.9,
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
                "isValid": true,
                "compressorLibId": 849
            },
            {
                "itemId": "ehg2shiz2",
                "name": "Compressor D2",
                "description": null,
                "modifiedDate": new Date("2022-05-09T18:20:14.514Z"),
                "nameplateData": {
                    "compressorType": 2,
                    "motorPower": 500,
                    "fullLoadOperatingPressure": 125,
                    "fullLoadRatedCapacity": 2315,
                    "ploytropicCompressorExponent": 1.4,
                    "ratedLoadPower": undefined,
                    "fullLoadAmps": 545,
                    "totalPackageInputPower": 414.4
                },
                "compressorControls": {
                    "controlType": 4,
                    "unloadPointCapacity": 100,
                    "numberOfUnloadSteps": 2,
                    "automaticShutdown": true,
                    "unloadSumpPressure": 15
                },
                "designDetails": {
                    "blowdownTime": 40,
                    "modulatingPressureRange": null,
                    "inputPressure": 14.5,
                    "designEfficiency": 94.5,
                    "serviceFactor": 1.15,
                    "noLoadPowerFM": null,
                    "noLoadPowerUL": 20,
                    "maxFullFlowPressure": 135
                },
                "centrifugalSpecifics": {
                    "surgeAirflow": null,
                    "maxFullLoadPressure": null,
                    "maxFullLoadCapacity": null,
                    "minFullLoadPressure": null,
                    "minFullLoadCapacity": null
                },
                "performancePoints": {
                    "fullLoad": {
                        "dischargePressure": 125,
                        "isDefaultPower": true,
                        "airflow": 2315,
                        "isDefaultAirFlow": true,
                        "power": 414.5,
                        "isDefaultPressure": true
                    },
                    "maxFullFlow": {
                        "dischargePressure": 135,
                        "isDefaultPower": true,
                        "airflow": 2298,
                        "isDefaultAirFlow": true,
                        "power": 432,
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
                        "power": 84.9,
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
                "isValid": true,
                "compressorLibId": 834
            }
        ],
        "systemProfile": {
            "systemProfileSetup": {
                "dayTypeId": "hopx028cf",
                "numberOfHours": 24,
                "dataInterval": 1,
                "profileDataType": "power"
            },
            "profileSummary": [
                {
                    "compressorId": "zh8wf6z6q",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 220.5,
                            "airflow": 817.19,
                            "percentCapacity": 44.005787474713046,
                            "timeInterval": 0,
                            "percentPower": 76.00827300930713,
                            "percentSystemCapacity": 4.478230345273023,
                            "percentSystemPower": 7.3889149520809605,
                            "order": 3
                        },
                        {
                            "power": 220.5,
                            "airflow": 817.19,
                            "percentCapacity": 44.005787474713046,
                            "timeInterval": 1,
                            "percentPower": 76.00827300930713,
                            "percentSystemCapacity": 4.478230345273023,
                            "percentSystemPower": 7.3889149520809605,
                            "order": 3
                        },
                        {
                            "power": 221.59999999999997,
                            "airflow": 826.56,
                            "percentCapacity": 44.510529108176875,
                            "timeInterval": 2,
                            "percentPower": 76.38745260255084,
                            "percentSystemCapacity": 4.529595164066444,
                            "percentSystemPower": 7.425775752295421,
                            "order": 3
                        },
                        {
                            "power": 220.5,
                            "airflow": 817.19,
                            "percentCapacity": 44.005787474713046,
                            "timeInterval": 3,
                            "percentPower": 76.00827300930713,
                            "percentSystemCapacity": 4.478230345273023,
                            "percentSystemPower": 7.3889149520809605,
                            "order": 3
                        },
                        {
                            "power": 219.8,
                            "airflow": 811.28,
                            "percentCapacity": 43.687415667047524,
                            "timeInterval": 4,
                            "percentPower": 75.76697690451569,
                            "percentSystemCapacity": 4.445831372956337,
                            "percentSystemPower": 7.365458079217212,
                            "order": 3
                        },
                        {
                            "power": 219.3,
                            "airflow": 807.08,
                            "percentCapacity": 43.46133679665374,
                            "timeInterval": 5,
                            "percentPower": 75.59462254395036,
                            "percentSystemCapacity": 4.422824552355655,
                            "percentSystemPower": 7.34870317002882,
                            "order": 3
                        },
                        {
                            "power": 219.6,
                            "airflow": 809.59,
                            "percentCapacity": 43.59685181315922,
                            "timeInterval": 6,
                            "percentPower": 75.69803516028955,
                            "percentSystemCapacity": 4.436615180679344,
                            "percentSystemPower": 7.358756115541853,
                            "order": 3
                        },
                        {
                            "power": 217.9,
                            "airflow": 795.43,
                            "percentCapacity": 42.83412784901619,
                            "timeInterval": 7,
                            "percentPower": 75.11203033436745,
                            "percentSystemCapacity": 4.3589968991463754,
                            "percentSystemPower": 7.301789424301321,
                            "order": 3
                        },
                        {
                            "power": 217.4,
                            "airflow": 791.31,
                            "percentCapacity": 42.61217361432519,
                            "timeInterval": 8,
                            "percentPower": 74.93967597380214,
                            "percentSystemCapacity": 4.336409820353018,
                            "percentSystemPower": 7.285034515112929,
                            "order": 3
                        },
                        {
                            "power": 217.9,
                            "airflow": 795.43,
                            "percentCapacity": 42.83412784901619,
                            "timeInterval": 9,
                            "percentPower": 75.11203033436745,
                            "percentSystemCapacity": 4.3589968991463754,
                            "percentSystemPower": 7.301789424301321,
                            "order": 3
                        },
                        {
                            "power": 219.8,
                            "airflow": 811.28,
                            "percentCapacity": 43.687415667047524,
                            "timeInterval": 10,
                            "percentPower": 75.76697690451569,
                            "percentSystemCapacity": 4.445831372956337,
                            "percentSystemPower": 7.365458079217212,
                            "order": 3
                        },
                        {
                            "power": 218.7,
                            "airflow": 802.07,
                            "percentCapacity": 43.19149043314234,
                            "timeInterval": 11,
                            "percentPower": 75.38779731127197,
                            "percentSystemCapacity": 4.395363751334138,
                            "percentSystemPower": 7.328597279002748,
                            "order": 3
                        },
                        {
                            "power": 237.6,
                            "airflow": 975.53,
                            "percentCapacity": 52.53254770729492,
                            "timeInterval": 12,
                            "percentPower": 81.90279214064114,
                            "percentSystemCapacity": 5.34595249301001,
                            "percentSystemPower": 7.961932846323973,
                            "order": 3
                        },
                        {
                            "power": 234.2,
                            "airflow": 941.73,
                            "percentCapacity": 50.71262960473022,
                            "timeInterval": 13,
                            "percentPower": 80.73078248879696,
                            "percentSystemCapacity": 5.160749297237178,
                            "percentSystemPower": 7.847999463842906,
                            "order": 3
                        },
                        {
                            "power": 244.09999999999997,
                            "airflow": 1043.81,
                            "percentCapacity": 56.209670514834585,
                            "timeInterval": 14,
                            "percentPower": 84.14339882799034,
                            "percentSystemCapacity": 5.720153339875483,
                            "percentSystemPower": 8.17974666577307,
                            "order": 3
                        },
                        {
                            "power": 233.6,
                            "airflow": 935.9,
                            "percentCapacity": 50.39838547189199,
                            "timeInterval": 15,
                            "percentPower": 80.52395725611858,
                            "percentSystemCapacity": 5.128770376003038,
                            "percentSystemPower": 7.827893572816835,
                            "order": 3
                        },
                        {
                            "power": 235.4,
                            "airflow": 953.52,
                            "percentCapacity": 51.347261357457775,
                            "timeInterval": 16,
                            "percentPower": 81.14443295415373,
                            "percentSystemCapacity": 5.225332329066149,
                            "percentSystemPower": 7.8882112458950475,
                            "order": 3
                        },
                        {
                            "power": 235.90000000000003,
                            "airflow": 958.47,
                            "percentCapacity": 51.61414247027303,
                            "timeInterval": 17,
                            "percentPower": 81.31678731471906,
                            "percentSystemCapacity": 5.2524913726050535,
                            "percentSystemPower": 7.904966155083441,
                            "order": 3
                        },
                        {
                            "power": 236.8,
                            "airflow": 967.46,
                            "percentCapacity": 52.09821949879083,
                            "timeInterval": 18,
                            "percentPower": 81.62702516373665,
                            "percentSystemCapacity": 5.30175326661851,
                            "percentSystemPower": 7.935124991622547,
                            "order": 3
                        },
                        {
                            "power": 237,
                            "airflow": 969.47,
                            "percentCapacity": 52.20644291424308,
                            "timeInterval": 19,
                            "percentPower": 81.69596690796277,
                            "percentSystemCapacity": 5.312766576707003,
                            "percentSystemPower": 7.941826955297902,
                            "order": 3
                        },
                        {
                            "power": 237.39999999999998,
                            "airflow": 973.51,
                            "percentCapacity": 52.423606143365454,
                            "timeInterval": 20,
                            "percentPower": 81.83385039641502,
                            "percentSystemCapacity": 5.334866100845552,
                            "percentSystemPower": 7.955230882648616,
                            "order": 3
                        },
                        {
                            "power": 236.4,
                            "airflow": 963.46,
                            "percentCapacity": 51.88248472163535,
                            "timeInterval": 21,
                            "percentPower": 81.48914167528439,
                            "percentSystemCapacity": 5.27979910829005,
                            "percentSystemPower": 7.921721064271832,
                            "order": 3
                        },
                        {
                            "power": 235.6,
                            "airflow": 955.5,
                            "percentCapacity": 51.45383931284695,
                            "timeInterval": 22,
                            "percentPower": 81.21337469837985,
                            "percentSystemCapacity": 5.236178189607452,
                            "percentSystemPower": 7.894913209570404,
                            "order": 3
                        },
                        {
                            "power": 236.8,
                            "airflow": 967.46,
                            "percentCapacity": 52.09821949879083,
                            "timeInterval": 23,
                            "percentPower": 81.62702516373665,
                            "percentSystemCapacity": 5.30175326661851,
                            "percentSystemPower": 7.935124991622547,
                            "order": 3
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 228.0958333333333,
                    "avgAirflow": 887.8091666666666,
                    "avgPrecentPower": 78.62662300356196,
                    "avgPercentCapacity": 47.80876168491161
                },
                {
                    "compressorId": "zh8wf6z6q",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 240.5,
                            "airflow": 1005.38,
                            "percentCapacity": 54.13975309537386,
                            "timeInterval": 0,
                            "percentPower": 82.90244743192002,
                            "percentSystemCapacity": 5.509509069383454,
                            "percentSystemPower": 8.059111319616648,
                            "order": 3
                        },
                        {
                            "power": 239.80000000000004,
                            "airflow": 998.08,
                            "percentCapacity": 53.747017098325166,
                            "timeInterval": 1,
                            "percentPower": 82.66115132712858,
                            "percentSystemCapacity": 5.4695424567947075,
                            "percentSystemPower": 8.0356544467529,
                            "order": 3
                        },
                        {
                            "power": 239.80000000000004,
                            "airflow": 998.08,
                            "percentCapacity": 53.747017098325166,
                            "timeInterval": 2,
                            "percentPower": 82.66115132712858,
                            "percentSystemCapacity": 5.4695424567947075,
                            "percentSystemPower": 8.0356544467529,
                            "order": 3
                        },
                        {
                            "power": 237.7,
                            "airflow": 976.54,
                            "percentCapacity": 52.587108861529245,
                            "timeInterval": 3,
                            "percentPower": 81.93726301275422,
                            "percentSystemCapacity": 5.351504885788021,
                            "percentSystemPower": 7.965283828161651,
                            "order": 3
                        },
                        {
                            "power": 237.6,
                            "airflow": 975.53,
                            "percentCapacity": 52.53254770729492,
                            "timeInterval": 4,
                            "percentPower": 81.90279214064114,
                            "percentSystemCapacity": 5.34595249301001,
                            "percentSystemPower": 7.961932846323973,
                            "order": 3
                        },
                        {
                            "power": 234.2,
                            "airflow": 941.73,
                            "percentCapacity": 50.71262960473022,
                            "timeInterval": 5,
                            "percentPower": 80.73078248879696,
                            "percentSystemCapacity": 5.160749297237178,
                            "percentSystemPower": 7.847999463842906,
                            "order": 3
                        },
                        {
                            "power": 232.3,
                            "airflow": 923.38,
                            "percentCapacity": 49.72441942210099,
                            "timeInterval": 6,
                            "percentPower": 80.07583591864874,
                            "percentSystemCapacity": 5.060184506074175,
                            "percentSystemPower": 7.784330808927016,
                            "order": 3
                        },
                        {
                            "power": 230.9,
                            "airflow": 910.1,
                            "percentCapacity": 49.008959083462614,
                            "timeInterval": 7,
                            "percentPower": 79.59324370906583,
                            "percentSystemCapacity": 4.9873759873953345,
                            "percentSystemPower": 7.737417063199518,
                            "order": 3
                        },
                        {
                            "power": 230.1,
                            "airflow": 902.59,
                            "percentCapacity": 48.604844760665756,
                            "timeInterval": 8,
                            "percentPower": 79.31747673216132,
                            "percentSystemCapacity": 4.946251464300542,
                            "percentSystemPower": 7.71060920849809,
                            "order": 3
                        },
                        {
                            "power": 232.7,
                            "airflow": 927.21,
                            "percentCapacity": 49.93079741981514,
                            "timeInterval": 9,
                            "percentPower": 80.213719407101,
                            "percentSystemCapacity": 5.081186475701267,
                            "percentSystemPower": 7.79773473627773,
                            "order": 3
                        },
                        {
                            "power": 253,
                            "airflow": 1146.12,
                            "percentCapacity": 61.71900903391578,
                            "timeInterval": 10,
                            "percentPower": 87.21130644605309,
                            "percentSystemCapacity": 6.28080884348869,
                            "percentSystemPower": 8.477984049326453,
                            "order": 3
                        },
                        {
                            "power": 234.3,
                            "airflow": 942.71,
                            "percentCapacity": 50.76520140904777,
                            "timeInterval": 11,
                            "percentPower": 80.76525336091002,
                            "percentSystemCapacity": 5.166099244662522,
                            "percentSystemPower": 7.851350445680586,
                            "order": 3
                        },
                        {
                            "power": 274.9,
                            "airflow": 1453.51,
                            "percentCapacity": 78.27177875554571,
                            "timeInterval": 12,
                            "percentPower": 94.76042743881419,
                            "percentSystemCapacity": 7.965294451394586,
                            "percentSystemPower": 9.21184907177803,
                            "order": 3
                        },
                        {
                            "power": 255.6,
                            "airflow": 1178.17,
                            "percentCapacity": 63.44455831104607,
                            "timeInterval": 13,
                            "percentPower": 88.10754912099276,
                            "percentSystemCapacity": 6.456408635664871,
                            "percentSystemPower": 8.565109577106092,
                            "order": 3
                        },
                        {
                            "power": 244.8,
                            "airflow": 1051.47,
                            "percentCapacity": 56.62221217638903,
                            "timeInterval": 14,
                            "percentPower": 84.3846949327818,
                            "percentSystemCapacity": 5.762135467533671,
                            "percentSystemPower": 8.203203538636823,
                            "order": 3
                        },
                        {
                            "power": 258,
                            "airflow": 1208.69,
                            "percentCapacity": 65.08833556854556,
                            "timeInterval": 15,
                            "percentPower": 88.9348500517063,
                            "percentSystemCapacity": 6.623686932857799,
                            "percentSystemPower": 8.645533141210375,
                            "order": 3
                        },
                        {
                            "power": 235.2,
                            "airflow": 951.54,
                            "percentCapacity": 51.240915074072156,
                            "timeInterval": 16,
                            "percentPower": 81.07549120992759,
                            "percentSystemCapacity": 5.214510044528277,
                            "percentSystemPower": 7.8815092822196915,
                            "order": 3
                        },
                        {
                            "power": 236.09999999999997,
                            "airflow": 960.46,
                            "percentCapacity": 51.721303290950196,
                            "timeInterval": 17,
                            "percentPower": 81.38572905894517,
                            "percentSystemCapacity": 5.263396548185802,
                            "percentSystemPower": 7.911668118758795,
                            "order": 3
                        },
                        {
                            "power": 235.90000000000003,
                            "airflow": 958.47,
                            "percentCapacity": 51.61414247027303,
                            "timeInterval": 18,
                            "percentPower": 81.31678731471906,
                            "percentSystemCapacity": 5.2524913726050535,
                            "percentSystemPower": 7.904966155083441,
                            "order": 3
                        },
                        {
                            "power": 236.3,
                            "airflow": 962.46,
                            "percentCapacity": 51.82869874245269,
                            "timeInterval": 19,
                            "percentPower": 81.45467080317131,
                            "percentSystemCapacity": 5.274325600873227,
                            "percentSystemPower": 7.918370082434153,
                            "order": 3
                        },
                        {
                            "power": 237.6,
                            "airflow": 975.53,
                            "percentCapacity": 52.53254770729492,
                            "timeInterval": 20,
                            "percentPower": 81.90279214064114,
                            "percentSystemCapacity": 5.34595249301001,
                            "percentSystemPower": 7.961932846323973,
                            "order": 3
                        },
                        {
                            "power": 236.6,
                            "airflow": 965.46,
                            "percentCapacity": 51.990233722839974,
                            "timeInterval": 21,
                            "percentPower": 81.55808341951051,
                            "percentSystemCapacity": 5.290764139813341,
                            "percentSystemPower": 7.928423027947189,
                            "order": 3
                        },
                        {
                            "power": 245.3,
                            "airflow": 1056.98,
                            "percentCapacity": 56.91895088098984,
                            "timeInterval": 22,
                            "percentPower": 84.55704929334712,
                            "percentSystemCapacity": 5.792332956269078,
                            "percentSystemPower": 8.219958447825213,
                            "order": 3
                        },
                        {
                            "power": 272.2,
                            "airflow": 1410.47,
                            "percentCapacity": 75.95436940122183,
                            "timeInterval": 23,
                            "percentPower": 93.82971389176144,
                            "percentSystemCapacity": 7.729464268855157,
                            "percentSystemPower": 9.121372562160714,
                            "order": 3
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 242.14166666666674,
                    "avgAirflow": 1032.5275,
                    "avgPrecentPower": 83.46834424910948,
                    "avgPercentCapacity": 55.60197294567532
                },
                {
                    "compressorId": "1i1iaygyz",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 266.9,
                            "airflow": 1330.59,
                            "percentCapacity": 71.65283688756729,
                            "timeInterval": 0,
                            "percentPower": 92.00275766976903,
                            "percentSystemCapacity": 7.2917206324097155,
                            "percentSystemPower": 8.943770524763755,
                            "order": 4
                        },
                        {
                            "power": 267.1,
                            "airflow": 1333.5,
                            "percentCapacity": 71.80951355352217,
                            "timeInterval": 1,
                            "percentPower": 92.07169941399518,
                            "percentSystemCapacity": 7.307664767036972,
                            "percentSystemPower": 8.950472488439114,
                            "order": 4
                        },
                        {
                            "power": 267.6,
                            "airflow": 1340.81,
                            "percentCapacity": 72.20308247338241,
                            "timeInterval": 2,
                            "percentPower": 92.2440537745605,
                            "percentSystemCapacity": 7.347716141663259,
                            "percentSystemPower": 8.967227397627505,
                            "order": 4
                        },
                        {
                            "power": 268.6,
                            "airflow": 1355.58,
                            "percentCapacity": 72.99835867669645,
                            "timeInterval": 3,
                            "percentPower": 92.58876249569114,
                            "percentSystemCapacity": 7.428647088043913,
                            "percentSystemPower": 9.00073721600429,
                            "order": 4
                        },
                        {
                            "power": 267.4,
                            "airflow": 1337.88,
                            "percentCapacity": 72.04533200341463,
                            "timeInterval": 4,
                            "percentPower": 92.17511203033435,
                            "percentSystemCapacity": 7.331662731824911,
                            "percentSystemPower": 8.960525433952148,
                            "order": 4
                        },
                        {
                            "power": 267,
                            "airflow": 1332.05,
                            "percentCapacity": 71.7311218015972,
                            "timeInterval": 5,
                            "percentPower": 92.0372285418821,
                            "percentSystemCapacity": 7.299687263566747,
                            "percentSystemPower": 8.947121506601436,
                            "order": 4
                        },
                        {
                            "power": 266.2,
                            "airflow": 1320.47,
                            "percentCapacity": 71.10781586707171,
                            "timeInterval": 6,
                            "percentPower": 91.76146156497758,
                            "percentSystemCapacity": 7.236256798835607,
                            "percentSystemPower": 8.920313651900006,
                            "order": 4
                        },
                        {
                            "power": 265.1,
                            "airflow": 1304.76,
                            "percentCapacity": 70.26173374702722,
                            "timeInterval": 7,
                            "percentPower": 91.38228197173387,
                            "percentSystemCapacity": 7.150155609832834,
                            "percentSystemPower": 8.883452851685545,
                            "order": 4
                        },
                        {
                            "power": 263.8,
                            "airflow": 1286.49,
                            "percentCapacity": 69.27783665336618,
                            "timeInterval": 8,
                            "percentPower": 90.93416063426403,
                            "percentSystemCapacity": 7.050029738343981,
                            "percentSystemPower": 8.839890087795725,
                            "order": 4
                        },
                        {
                            "power": 263.3,
                            "airflow": 1279.55,
                            "percentCapacity": 68.90394602683094,
                            "timeInterval": 9,
                            "percentPower": 90.76180627369872,
                            "percentSystemCapacity": 7.011980916912816,
                            "percentSystemPower": 8.823135178607334,
                            "order": 4
                        },
                        {
                            "power": 262.5,
                            "airflow": 1268.53,
                            "percentCapacity": 68.31086658292591,
                            "timeInterval": 10,
                            "percentPower": 90.4860392967942,
                            "percentSystemCapacity": 6.951626438212045,
                            "percentSystemPower": 8.796327323905905,
                            "order": 4
                        },
                        {
                            "power": 261.3,
                            "airflow": 1252.23,
                            "percentCapacity": 67.43292479012766,
                            "timeInterval": 11,
                            "percentPower": 90.07238883143744,
                            "percentSystemCapacity": 6.862283063090041,
                            "percentSystemPower": 8.756115541853763,
                            "order": 4
                        },
                        {
                            "power": 260.7,
                            "airflow": 1244.17,
                            "percentCapacity": 66.99911807866474,
                            "timeInterval": 12,
                            "percentPower": 89.86556359875904,
                            "percentSystemCapacity": 6.818136906624312,
                            "percentSystemPower": 8.736009650827693,
                            "order": 4
                        },
                        {
                            "power": 254.9,
                            "airflow": 1169.44,
                            "percentCapacity": 62.97445389261185,
                            "timeInterval": 13,
                            "percentPower": 87.8662530162013,
                            "percentSystemCapacity": 6.408568658405316,
                            "percentSystemPower": 8.541652704242344,
                            "order": 4
                        },
                        {
                            "power": 258.4,
                            "airflow": 1213.87,
                            "percentCapacity": 65.36722685823584,
                            "timeInterval": 14,
                            "percentPower": 89.07273354015855,
                            "percentSystemCapacity": 6.652068186965364,
                            "percentSystemPower": 8.65893706856109,
                            "order": 4
                        },
                        {
                            "power": 246.1,
                            "airflow": 1065.87,
                            "percentCapacity": 57.39735972211846,
                            "timeInterval": 15,
                            "percentPower": 84.83281627025163,
                            "percentSystemCapacity": 5.841018029590858,
                            "percentSystemPower": 8.246766302526641,
                            "order": 4
                        },
                        {
                            "power": 244.8,
                            "airflow": 1051.47,
                            "percentCapacity": 56.62221217638903,
                            "timeInterval": 16,
                            "percentPower": 84.3846949327818,
                            "percentSystemCapacity": 5.762135467533671,
                            "percentSystemPower": 8.203203538636823,
                            "order": 4
                        },
                        {
                            "power": 246.3,
                            "airflow": 1068.1,
                            "percentCapacity": 57.517666091521576,
                            "timeInterval": 17,
                            "percentPower": 84.90175801447776,
                            "percentSystemCapacity": 5.853260956376347,
                            "percentSystemPower": 8.253468266201997,
                            "order": 4
                        },
                        {
                            "power": 248.6,
                            "airflow": 1094.18,
                            "percentCapacity": 58.92186566214392,
                            "timeInterval": 18,
                            "percentPower": 85.69458807307824,
                            "percentSystemCapacity": 5.996158731619972,
                            "percentSystemPower": 8.330540848468601,
                            "order": 4
                        },
                        {
                            "power": 248.6,
                            "airflow": 1094.18,
                            "percentCapacity": 58.92186566214392,
                            "timeInterval": 19,
                            "percentPower": 85.69458807307824,
                            "percentSystemCapacity": 5.996158731619972,
                            "percentSystemPower": 8.330540848468601,
                            "order": 4
                        },
                        {
                            "power": 250.5,
                            "airflow": 1116.27,
                            "percentCapacity": 60.11137531961417,
                            "timeInterval": 20,
                            "percentPower": 86.34953464322646,
                            "percentSystemCapacity": 6.117208678678404,
                            "percentSystemPower": 8.394209503384491,
                            "order": 4
                        },
                        {
                            "power": 251.5,
                            "airflow": 1128.1,
                            "percentCapacity": 60.74852536346383,
                            "timeInterval": 21,
                            "percentPower": 86.69424336435712,
                            "percentSystemCapacity": 6.182047983338027,
                            "percentSystemPower": 8.427719321761277,
                            "order": 4
                        },
                        {
                            "power": 250.60000000000002,
                            "airflow": 1117.44,
                            "percentCapacity": 60.174741613705905,
                            "timeInterval": 22,
                            "percentPower": 86.38400551533954,
                            "percentSystemCapacity": 6.123657122788901,
                            "percentSystemPower": 8.397560485222172,
                            "order": 4
                        },
                        {
                            "power": 250.5,
                            "airflow": 1116.27,
                            "percentCapacity": 60.11137531961417,
                            "timeInterval": 23,
                            "percentPower": 86.34953464322646,
                            "percentSystemCapacity": 6.117208678678404,
                            "percentSystemPower": 8.394209503384491,
                            "order": 4
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 258.2625000000001,
                    "avgAirflow": 1217.5749999999998,
                    "avgPrecentPower": 89.0253360910031,
                    "avgPercentCapacity": 65.56679811765655
                },
                {
                    "compressorId": "1i1iaygyz",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 257,
                            "airflow": 1195.86,
                            "percentCapacity": 64.3973248342344,
                            "timeInterval": 0,
                            "percentPower": 88.59014133057566,
                            "percentSystemCapacity": 6.553366517819666,
                            "percentSystemPower": 8.612023322833592,
                            "order": 4
                        },
                        {
                            "power": 256.4,
                            "airflow": 1188.24,
                            "percentCapacity": 63.986925754595525,
                            "timeInterval": 1,
                            "percentPower": 88.38331609789726,
                            "percentSystemCapacity": 6.511602429103676,
                            "percentSystemPower": 8.59191743180752,
                            "order": 4
                        },
                        {
                            "power": 258.1,
                            "airflow": 1209.98,
                            "percentCapacity": 65.15792418627093,
                            "timeInterval": 2,
                            "percentPower": 88.96932092381937,
                            "percentSystemCapacity": 6.630768589100455,
                            "percentSystemPower": 8.648884123048054,
                            "order": 4
                        },
                        {
                            "power": 258.3,
                            "airflow": 1212.57,
                            "percentCapacity": 65.29736965295707,
                            "timeInterval": 3,
                            "percentPower": 89.0382626680455,
                            "percentSystemCapacity": 6.644959198023963,
                            "percentSystemPower": 8.65558608672341,
                            "order": 4
                        },
                        {
                            "power": 256.4,
                            "airflow": 1188.24,
                            "percentCapacity": 63.986925754595525,
                            "timeInterval": 4,
                            "percentPower": 88.38331609789726,
                            "percentSystemCapacity": 6.511602429103676,
                            "percentSystemPower": 8.59191743180752,
                            "order": 4
                        },
                        {
                            "power": 254.2,
                            "airflow": 1160.78,
                            "percentCapacity": 62.508458827265656,
                            "timeInterval": 5,
                            "percentPower": 87.62495691140984,
                            "percentSystemCapacity": 6.361146867724261,
                            "percentSystemPower": 8.518195831378595,
                            "order": 4
                        },
                        {
                            "power": 246.70000000000002,
                            "airflow": 1072.59,
                            "percentCapacity": 57.7591313815994,
                            "timeInterval": 6,
                            "percentPower": 85.03964150293002,
                            "percentSystemCapacity": 5.877833569466796,
                            "percentSystemPower": 8.266872193552711,
                            "order": 4
                        },
                        {
                            "power": 241.7,
                            "airflow": 1018.01,
                            "percentCapacity": 54.82028805653203,
                            "timeInterval": 7,
                            "percentPower": 83.31609789727679,
                            "percentSystemCapacity": 5.578763421798552,
                            "percentSystemPower": 8.099323101668789,
                            "order": 4
                        },
                        {
                            "power": 226.9,
                            "airflow": 873.19,
                            "percentCapacity": 47.02165345264044,
                            "timeInterval": 8,
                            "percentPower": 78.21440882454326,
                            "percentSystemCapacity": 4.785138670624359,
                            "percentSystemPower": 7.603377789692381,
                            "order": 4
                        },
                        {
                            "power": 228.2,
                            "airflow": 885.02,
                            "percentCapacity": 47.658505643248276,
                            "timeInterval": 9,
                            "percentPower": 78.66253016201308,
                            "percentSystemCapacity": 4.849947664374838,
                            "percentSystemPower": 7.6469405535822,
                            "order": 4
                        },
                        {
                            "power": 220.7,
                            "airflow": 818.88,
                            "percentCapacity": 44.097152773355845,
                            "timeInterval": 10,
                            "percentPower": 76.07721475353326,
                            "percentSystemCapacity": 4.487528096236399,
                            "percentSystemPower": 7.395616915756317,
                            "order": 4
                        },
                        {
                            "power": 188.8,
                            "airflow": 584.2,
                            "percentCapacity": 31.459363811133294,
                            "timeInterval": 11,
                            "percentPower": 65.0810065494657,
                            "percentSystemCapacity": 3.2014488490395947,
                            "percentSystemPower": 6.326653709536894,
                            "order": 4
                        },
                        {
                            "power": 220.4,
                            "airflow": 816.34,
                            "percentCapacity": 43.96017203258482,
                            "timeInterval": 12,
                            "percentPower": 75.97380213719407,
                            "percentSystemCapacity": 4.473588309102916,
                            "percentSystemPower": 7.3855639702432825,
                            "order": 4
                        },
                        {
                            "power": 219.3,
                            "airflow": 807.08,
                            "percentCapacity": 43.46133679665374,
                            "timeInterval": 13,
                            "percentPower": 75.59462254395036,
                            "percentSystemCapacity": 4.422824552355655,
                            "percentSystemPower": 7.34870317002882,
                            "order": 4
                        },
                        {
                            "power": 223.4,
                            "airflow": 842.12,
                            "percentCapacity": 45.348418229539014,
                            "timeInterval": 14,
                            "percentPower": 77.007928300586,
                            "percentSystemCapacity": 4.614862596024437,
                            "percentSystemPower": 7.486093425373635,
                            "order": 4
                        },
                        {
                            "power": 230.3,
                            "airflow": 904.46,
                            "percentCapacity": 48.70555527659653,
                            "timeInterval": 15,
                            "percentPower": 79.38641847638746,
                            "percentSystemCapacity": 4.95650022734764,
                            "percentSystemPower": 7.717311172173448,
                            "order": 4
                        },
                        {
                            "power": 235.3,
                            "airflow": 952.53,
                            "percentCapacity": 51.29405930912889,
                            "timeInterval": 16,
                            "percentPower": 81.10996208204068,
                            "percentSystemCapacity": 5.219918245125623,
                            "percentSystemPower": 7.8848602640573695,
                            "order": 4
                        },
                        {
                            "power": 238.6,
                            "airflow": 985.71,
                            "percentCapacity": 53.08089040369188,
                            "timeInterval": 17,
                            "percentPower": 82.2475008617718,
                            "percentSystemCapacity": 5.401754355526952,
                            "percentSystemPower": 7.995442664700758,
                            "order": 4
                        },
                        {
                            "power": 239.5,
                            "airflow": 994.97,
                            "percentCapacity": 53.57964570073679,
                            "timeInterval": 18,
                            "percentPower": 82.55773871078938,
                            "percentSystemCapacity": 5.4525099773272805,
                            "percentSystemPower": 8.025601501239864,
                            "order": 4
                        },
                        {
                            "power": 240.3,
                            "airflow": 1003.29,
                            "percentCapacity": 54.0272265739973,
                            "timeInterval": 19,
                            "percentPower": 82.8335056876939,
                            "percentSystemCapacity": 5.498057855541045,
                            "percentSystemPower": 8.052409355941291,
                            "order": 4
                        },
                        {
                            "power": 244.09999999999997,
                            "airflow": 1043.81,
                            "percentCapacity": 56.209670514834585,
                            "timeInterval": 20,
                            "percentPower": 84.14339882799034,
                            "percentSystemCapacity": 5.720153339875483,
                            "percentSystemPower": 8.17974666577307,
                            "order": 4
                        },
                        {
                            "power": 280.8,
                            "airflow": 1553.59,
                            "percentCapacity": 83.66120366492575,
                            "timeInterval": 21,
                            "percentPower": 96.794208893485,
                            "percentSystemCapacity": 8.513746997247212,
                            "percentSystemPower": 9.40955700020106,
                            "order": 4
                        },
                        {
                            "power": 272.3,
                            "airflow": 1412.04,
                            "percentCapacity": 76.03862615847086,
                            "timeInterval": 22,
                            "percentPower": 93.86418476387452,
                            "percentSystemCapacity": 7.738038622110937,
                            "percentSystemPower": 9.124723543998392,
                            "order": 4
                        },
                        {
                            "power": 281.6,
                            "airflow": 1567.84,
                            "percentCapacity": 84.42861319256832,
                            "timeInterval": 23,
                            "percentPower": 97.06997587038953,
                            "percentSystemCapacity": 8.591842103167435,
                            "percentSystemPower": 9.436364854902488,
                            "order": 4
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 242.47083333333342,
                    "avgAirflow": 1053.8058333333336,
                    "avgPrecentPower": 83.581810869815,
                    "avgPercentCapacity": 56.74776841592321
                },
                {
                    "compressorId": "ljepu4k8q",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 390.2,
                            "airflow": 1189.74,
                            "percentCapacity": 38.44070518099008,
                            "timeInterval": 0,
                            "percentPower": 78.44792923200643,
                            "percentSystemCapacity": 6.5198368333606025,
                            "percentSystemPower": 13.075531130621274,
                            "order": 5
                        },
                        {
                            "power": 387.4,
                            "airflow": 1166.34,
                            "percentCapacity": 37.684498272667845,
                            "timeInterval": 1,
                            "percentPower": 77.88500201045436,
                            "percentSystemCapacity": 6.391578373186485,
                            "percentSystemPower": 12.981703639166275,
                            "order": 5
                        },
                        {
                            "power": 383.9,
                            "airflow": 1137.82,
                            "percentCapacity": 36.763238029784695,
                            "timeInterval": 2,
                            "percentPower": 77.18134298351428,
                            "percentSystemCapacity": 6.235325608405504,
                            "percentSystemPower": 12.86441927484753,
                            "order": 5
                        },
                        {
                            "power": 382,
                            "airflow": 1122.68,
                            "percentCapacity": 36.273892442063584,
                            "timeInterval": 3,
                            "percentPower": 76.79935665460394,
                            "percentSystemCapacity": 6.152328863885729,
                            "percentSystemPower": 12.800750619931641,
                            "order": 5
                        },
                        {
                            "power": 380.3,
                            "airflow": 1109.32,
                            "percentCapacity": 35.84228161298175,
                            "timeInterval": 4,
                            "percentPower": 76.45757941294733,
                            "percentSystemCapacity": 6.0791243748453825,
                            "percentSystemPower": 12.743783928691107,
                            "order": 5
                        },
                        {
                            "power": 378.9,
                            "airflow": 1098.45,
                            "percentCapacity": 35.49115640525682,
                            "timeInterval": 5,
                            "percentPower": 76.17611580217128,
                            "percentSystemCapacity": 6.019570861150255,
                            "percentSystemPower": 12.696870182963607,
                            "order": 5
                        },
                        {
                            "power": 371.1,
                            "airflow": 1040.01,
                            "percentCapacity": 33.603050016740625,
                            "timeInterval": 6,
                            "percentPower": 74.60796139927625,
                            "percentSystemCapacity": 5.699333614742011,
                            "percentSystemPower": 12.435493599624692,
                            "order": 5
                        },
                        {
                            "power": 364,
                            "airflow": 989.73,
                            "percentCapacity": 31.978243278121287,
                            "timeInterval": 7,
                            "percentPower": 73.1805388017692,
                            "percentSystemCapacity": 5.423753997467415,
                            "percentSystemPower": 12.19757388914952,
                            "order": 5
                        },
                        {
                            "power": 381.2,
                            "airflow": 1116.37,
                            "percentCapacity": 36.070057762774965,
                            "timeInterval": 8,
                            "percentPower": 76.63852030558907,
                            "percentSystemCapacity": 6.117756947379906,
                            "percentSystemPower": 12.773942765230212,
                            "order": 5
                        },
                        {
                            "power": 386,
                            "airflow": 1154.83,
                            "percentCapacity": 37.31285401753128,
                            "timeInterval": 9,
                            "percentPower": 77.60353839967833,
                            "percentSystemCapacity": 6.328544672526267,
                            "percentSystemPower": 12.934789893438777,
                            "order": 5
                        },
                        {
                            "power": 389.6,
                            "airflow": 1184.68,
                            "percentCapacity": 38.27718731392365,
                            "timeInterval": 10,
                            "percentPower": 78.32730197024529,
                            "percentSystemCapacity": 6.492102955753709,
                            "percentSystemPower": 13.055425239595204,
                            "order": 5
                        },
                        {
                            "power": 380.7,
                            "airflow": 1112.45,
                            "percentCapacity": 35.94331556595818,
                            "timeInterval": 11,
                            "percentPower": 76.53799758745477,
                            "percentSystemCapacity": 6.096260503980742,
                            "percentSystemPower": 12.75718785604182,
                            "order": 5
                        },
                        {
                            "power": 386.1,
                            "airflow": 1155.65,
                            "percentCapacity": 37.33925982807915,
                            "timeInterval": 12,
                            "percentPower": 77.6236429433052,
                            "percentSystemCapacity": 6.333023299424869,
                            "percentSystemPower": 12.938140875276458,
                            "order": 5
                        },
                        {
                            "power": 395.8,
                            "airflow": 1238.22,
                            "percentCapacity": 40.00713377964704,
                            "timeInterval": 13,
                            "percentPower": 79.57378367511058,
                            "percentSystemCapacity": 6.785515072775515,
                            "percentSystemPower": 13.263186113531267,
                            "order": 5
                        },
                        {
                            "power": 398.6,
                            "airflow": 1263.34,
                            "percentCapacity": 40.8187658805955,
                            "timeInterval": 14,
                            "percentPower": 80.13671089666265,
                            "percentSystemCapacity": 6.923174068415337,
                            "percentSystemPower": 13.357013604986262,
                            "order": 5
                        },
                        {
                            "power": 406.7,
                            "airflow": 1339.57,
                            "percentCapacity": 43.28182799815914,
                            "timeInterval": 15,
                            "percentPower": 81.76517893043828,
                            "percentSystemCapacity": 7.340928192366427,
                            "percentSystemPower": 13.628443133838214,
                            "order": 5
                        },
                        {
                            "power": 400.1,
                            "airflow": 1277.05,
                            "percentCapacity": 41.26172226860882,
                            "timeInterval": 16,
                            "percentPower": 80.43827905106555,
                            "percentSystemCapacity": 6.998302850797035,
                            "percentSystemPower": 13.407278332551439,
                            "order": 5
                        },
                        {
                            "power": 393.4,
                            "airflow": 1217.16,
                            "percentCapacity": 39.32674712720683,
                            "timeInterval": 17,
                            "percentPower": 79.09127462806595,
                            "percentSystemCapacity": 6.670116306373583,
                            "percentSystemPower": 13.182762549426982,
                            "order": 5
                        },
                        {
                            "power": 393.4,
                            "airflow": 1217.16,
                            "percentCapacity": 39.32674712720683,
                            "timeInterval": 18,
                            "percentPower": 79.09127462806595,
                            "percentSystemCapacity": 6.670116306373583,
                            "percentSystemPower": 13.182762549426982,
                            "order": 5
                        },
                        {
                            "power": 388.9,
                            "airflow": 1178.81,
                            "percentCapacity": 38.087439145957624,
                            "timeInterval": 19,
                            "percentPower": 78.18657016485726,
                            "percentSystemCapacity": 6.459920219023392,
                            "percentSystemPower": 13.031968366731453,
                            "order": 5
                        },
                        {
                            "power": 384.1,
                            "airflow": 1139.43,
                            "percentCapacity": 36.81518243913984,
                            "timeInterval": 20,
                            "percentPower": 77.22155207076801,
                            "percentSystemCapacity": 6.244135776476205,
                            "percentSystemPower": 12.871121238522889,
                            "order": 5
                        },
                        {
                            "power": 384.7,
                            "airflow": 1144.27,
                            "percentCapacity": 36.971517990591664,
                            "timeInterval": 21,
                            "percentPower": 77.34217933252914,
                            "percentSystemCapacity": 6.270651478566483,
                            "percentSystemPower": 12.891227129548957,
                            "order": 5
                        },
                        {
                            "power": 379.9,
                            "airflow": 1106.2,
                            "percentCapacity": 35.741565683899566,
                            "timeInterval": 22,
                            "percentPower": 76.37716123843988,
                            "percentSystemCapacity": 6.062042184988446,
                            "percentSystemPower": 12.730380001340395,
                            "order": 5
                        },
                        {
                            "power": 375.6,
                            "airflow": 1073.3,
                            "percentCapacity": 34.67851867513079,
                            "timeInterval": 23,
                            "percentPower": 75.51266586248492,
                            "percentSystemCapacity": 5.881741303130742,
                            "percentSystemPower": 12.586287782320221,
                            "order": 5
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 2315,
                    "avgPower": 385.94166666666666,
                    "avgAirflow": 1157.1908333333333,
                    "avgPrecentPower": 77.59181074922934,
                    "avgPercentCapacity": 37.389037826792396
                },
                {
                    "compressorId": "ljepu4k8q",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 319.4,
                            "airflow": 724.44,
                            "percentCapacity": 23.406891228915903,
                            "timeInterval": 0,
                            "percentPower": 64.21391234418978,
                            "percentSystemCapacity": 3.969987305649645,
                            "percentSystemPower": 10.703035989544937,
                            "order": 5
                        },
                        {
                            "power": 334.4,
                            "airflow": 805.16,
                            "percentCapacity": 26.014905544381527,
                            "timeInterval": 1,
                            "percentPower": 67.22959388821873,
                            "percentSystemCapacity": 4.412326428094083,
                            "percentSystemPower": 11.205683265196702,
                            "order": 5
                        },
                        {
                            "power": 332,
                            "airflow": 791.73,
                            "percentCapacity": 25.58092290569234,
                            "timeInterval": 2,
                            "percentPower": 66.74708484117411,
                            "percentSystemCapacity": 4.33871966205161,
                            "percentSystemPower": 11.12525970109242,
                            "order": 5
                        },
                        {
                            "power": 334.8,
                            "airflow": 807.42,
                            "percentCapacity": 26.08788612948154,
                            "timeInterval": 3,
                            "percentPower": 67.31001206272617,
                            "percentSystemCapacity": 4.42470449203997,
                            "percentSystemPower": 11.219087192547418,
                            "order": 5
                        },
                        {
                            "power": 338.6,
                            "airflow": 829.17,
                            "percentCapacity": 26.790674358462653,
                            "timeInterval": 4,
                            "percentPower": 68.07398472054686,
                            "percentSystemCapacity": 4.543902736707689,
                            "percentSystemPower": 11.346424502379199,
                            "order": 5
                        },
                        {
                            "power": 338,
                            "airflow": 825.7,
                            "percentCapacity": 26.67855423542711,
                            "timeInterval": 5,
                            "percentPower": 67.95335745878569,
                            "percentSystemCapacity": 4.5248863085624125,
                            "percentSystemPower": 11.326318611353127,
                            "order": 5
                        },
                        {
                            "power": 346,
                            "airflow": 873.11,
                            "percentCapacity": 28.210465832325337,
                            "timeInterval": 6,
                            "percentPower": 69.56172094893446,
                            "percentSystemCapacity": 4.784710201175303,
                            "percentSystemPower": 11.594397158367402,
                            "order": 5
                        },
                        {
                            "power": 344,
                            "airflow": 861.02,
                            "percentCapacity": 27.819849648330287,
                            "timeInterval": 7,
                            "percentPower": 69.15963007639728,
                            "percentSystemCapacity": 4.718458716658387,
                            "percentSystemPower": 11.527377521613834,
                            "order": 5
                        },
                        {
                            "power": 372.1,
                            "airflow": 1047.31,
                            "percentCapacity": 33.838877809286096,
                            "timeInterval": 8,
                            "percentPower": 74.80900683554485,
                            "percentSystemCapacity": 5.739331807307127,
                            "percentSystemPower": 12.469003418001476,
                            "order": 5
                        },
                        {
                            "power": 373.5,
                            "airflow": 1057.62,
                            "percentCapacity": 34.17204847717541,
                            "timeInterval": 9,
                            "percentPower": 75.09047044632086,
                            "percentSystemCapacity": 5.795840094084716,
                            "percentSystemPower": 12.515917163728973,
                            "order": 5
                        },
                        {
                            "power": 410.2,
                            "airflow": 1374.26,
                            "percentCapacity": 44.40273409297366,
                            "timeInterval": 10,
                            "percentPower": 82.46883795737837,
                            "percentSystemCapacity": 7.53104241658009,
                            "percentSystemPower": 13.74572749815696,
                            "order": 5
                        },
                        {
                            "power": 426.1,
                            "airflow": 1547.05,
                            "percentCapacity": 49.98534782780091,
                            "timeInterval": 11,
                            "percentPower": 85.66546039404906,
                            "percentSystemCapacity": 8.477896291486399,
                            "percentSystemPower": 14.278533610347832,
                            "order": 5
                        },
                        {
                            "power": 421.8,
                            "airflow": 1497.68,
                            "percentCapacity": 48.390408181052976,
                            "timeInterval": 12,
                            "percentPower": 84.8009650180941,
                            "percentSystemCapacity": 8.207382360826337,
                            "percentSystemPower": 14.134441391327659,
                            "order": 5
                        },
                        {
                            "power": 423.8,
                            "airflow": 1520.38,
                            "percentCapacity": 49.1238661032269,
                            "timeInterval": 13,
                            "percentPower": 85.20305589063129,
                            "percentSystemCapacity": 8.331782419415127,
                            "percentSystemPower": 14.20146102808123,
                            "order": 5
                        },
                        {
                            "power": 413.6,
                            "airflow": 1409.05,
                            "percentCapacity": 45.52670959859761,
                            "timeInterval": 14,
                            "percentPower": 83.1523924406916,
                            "percentSystemCapacity": 7.721677236281215,
                            "percentSystemPower": 13.859660880638028,
                            "order": 5
                        },
                        {
                            "power": 406.6,
                            "airflow": 1338.6,
                            "percentCapacity": 43.25032308254393,
                            "timeInterval": 15,
                            "percentPower": 81.74507438681142,
                            "percentSystemCapacity": 7.3355847183512415,
                            "percentSystemPower": 13.625092152000537,
                            "order": 5
                        },
                        {
                            "power": 385,
                            "airflow": 1146.7,
                            "percentCapacity": 37.04996969877627,
                            "timeInterval": 16,
                            "percentPower": 77.40249296340973,
                            "percentSystemCapacity": 6.283957486722522,
                            "percentSystemPower": 12.901280075061994,
                            "order": 5
                        },
                        {
                            "power": 378.3,
                            "airflow": 1093.83,
                            "percentCapacity": 35.341849344906784,
                            "timeInterval": 17,
                            "percentPower": 76.05548854041014,
                            "percentSystemCapacity": 5.994247244765809,
                            "percentSystemPower": 12.67676429193754,
                            "order": 5
                        },
                        {
                            "power": 392.4,
                            "airflow": 1208.51,
                            "percentCapacity": 39.04730367627715,
                            "timeInterval": 18,
                            "percentPower": 78.89022919179735,
                            "percentSystemCapacity": 6.622720565436091,
                            "percentSystemPower": 13.149252731050199,
                            "order": 5
                        },
                        {
                            "power": 413,
                            "airflow": 1402.83,
                            "percentCapacity": 45.325772064026594,
                            "timeInterval": 19,
                            "percentPower": 83.03176517893044,
                            "percentSystemCapacity": 7.6875966976195915,
                            "percentSystemPower": 13.839554989611958,
                            "order": 5
                        },
                        {
                            "power": 410,
                            "airflow": 1372.25,
                            "percentCapacity": 44.33771177345247,
                            "timeInterval": 20,
                            "percentPower": 82.42862887012465,
                            "percentSystemCapacity": 7.520014135183876,
                            "percentSystemPower": 13.739025534481602,
                            "order": 5
                        },
                        {
                            "power": 397.4,
                            "airflow": 1252.5,
                            "percentCapacity": 40.46852659520401,
                            "timeInterval": 21,
                            "percentPower": 79.89545637314033,
                            "percentSystemCapacity": 6.863770813905985,
                            "percentSystemPower": 13.316801822934119,
                            "order": 5
                        },
                        {
                            "power": 406.8,
                            "airflow": 1340.55,
                            "percentCapacity": 43.31336139517226,
                            "timeInterval": 22,
                            "percentPower": 81.78528347406514,
                            "percentSystemCapacity": 7.346276497043958,
                            "percentSystemPower": 13.631794115675893,
                            "order": 5
                        },
                        {
                            "power": 385.8,
                            "airflow": 1153.2,
                            "percentCapacity": 37.26010664844939,
                            "timeInterval": 23,
                            "percentPower": 77.56332931242461,
                            "percentSystemCapacity": 6.319598316360743,
                            "percentSystemPower": 12.928087929763421,
                            "order": 5
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 2315,
                    "avgPower": 379.3166666666666,
                    "avgAirflow": 1136.669583333333,
                    "avgPrecentPower": 76.25988473394987,
                    "avgPercentCapacity": 36.72604442716413
                },
                {
                    "compressorId": "wj0olxdhb",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 383.6,
                            "airflow": 1654.02,
                            "percentCapacity": 71.44796741410823,
                            "timeInterval": 0,
                            "percentPower": 92.54523522316043,
                            "percentSystemCapacity": 9.064119057631553,
                            "percentSystemPower": 12.854366329334496,
                            "order": 1
                        },
                        {
                            "power": 386.8,
                            "airflow": 1700.5,
                            "percentCapacity": 73.45592026743235,
                            "timeInterval": 1,
                            "percentPower": 93.31724969843185,
                            "percentSystemCapacity": 9.318854417969415,
                            "percentSystemPower": 12.961597748140205,
                            "order": 1
                        },
                        {
                            "power": 391.3,
                            "airflow": 1768.86,
                            "percentCapacity": 76.40880668240486,
                            "timeInterval": 2,
                            "percentPower": 94.40289505428227,
                            "percentSystemCapacity": 9.693467090627315,
                            "percentSystemPower": 13.112391930835738,
                            "order": 1
                        },
                        {
                            "power": 391.6,
                            "airflow": 1773.55,
                            "percentCapacity": 76.6112739093221,
                            "timeInterval": 3,
                            "percentPower": 94.47527141133897,
                            "percentSystemCapacity": 9.719152734550672,
                            "percentSystemPower": 13.122444876348771,
                            "order": 1
                        },
                        {
                            "power": 389,
                            "airflow": 1733.47,
                            "percentCapacity": 74.88012588232786,
                            "timeInterval": 4,
                            "percentPower": 93.84800965018094,
                            "percentSystemCapacity": 9.49953372520764,
                            "percentSystemPower": 13.035319348569132,
                            "order": 1
                        },
                        {
                            "power": 388.4,
                            "airflow": 1724.4,
                            "percentCapacity": 74.48807846412339,
                            "timeInterval": 5,
                            "percentPower": 93.70325693606755,
                            "percentSystemCapacity": 9.449797328169973,
                            "percentSystemPower": 13.015213457543059,
                            "order": 1
                        },
                        {
                            "power": 392.5,
                            "airflow": 1787.71,
                            "percentCapacity": 77.22301393211018,
                            "timeInterval": 6,
                            "percentPower": 94.69240048250904,
                            "percentSystemCapacity": 9.796760042351767,
                            "percentSystemPower": 13.152603712887878,
                            "order": 1
                        },
                        {
                            "power": 388.5,
                            "airflow": 1725.91,
                            "percentCapacity": 74.5532290011993,
                            "timeInterval": 7,
                            "percentPower": 93.72738238841978,
                            "percentSystemCapacity": 9.45806253495048,
                            "percentSystemPower": 13.01856443938074,
                            "order": 1
                        },
                        {
                            "power": 393.6,
                            "airflow": 1805.23,
                            "percentCapacity": 77.97964526961624,
                            "timeInterval": 8,
                            "percentPower": 94.9577804583836,
                            "percentSystemCapacity": 9.892748728581852,
                            "percentSystemPower": 13.189464513102342,
                            "order": 1
                        },
                        {
                            "power": 390,
                            "airflow": 1748.74,
                            "percentCapacity": 75.53969086793906,
                            "timeInterval": 9,
                            "percentPower": 94.08926417370326,
                            "percentSystemCapacity": 9.583208261687798,
                            "percentSystemPower": 13.068829166945918,
                            "order": 1
                        },
                        {
                            "power": 390.3,
                            "airflow": 1753.36,
                            "percentCapacity": 75.73907569285635,
                            "timeInterval": 10,
                            "percentPower": 94.16164053075995,
                            "percentSystemCapacity": 9.60850286217462,
                            "percentSystemPower": 13.07888211245895,
                            "order": 1
                        },
                        {
                            "power": 384,
                            "airflow": 1659.74,
                            "percentCapacity": 71.69494943416738,
                            "timeInterval": 11,
                            "percentPower": 92.64173703256937,
                            "percentSystemCapacity": 9.095451991456462,
                            "percentSystemPower": 12.86777025668521,
                            "order": 1
                        },
                        {
                            "power": 376.3,
                            "airflow": 1554.08,
                            "percentCapacity": 67.13076878526056,
                            "timeInterval": 12,
                            "percentPower": 90.78407720144753,
                            "percentSystemCapacity": 8.51642534731906,
                            "percentSystemPower": 12.609744655183968,
                            "order": 1
                        },
                        {
                            "power": 371.6,
                            "airflow": 1493.86,
                            "percentCapacity": 64.52969591255764,
                            "timeInterval": 13,
                            "percentPower": 89.65018094089264,
                            "percentSystemCapacity": 8.186444872729666,
                            "percentSystemPower": 12.452248508813083,
                            "order": 1
                        },
                        {
                            "power": 368.9,
                            "airflow": 1460.62,
                            "percentCapacity": 63.09382516511306,
                            "timeInterval": 14,
                            "percentPower": 88.99879372738239,
                            "percentSystemCapacity": 8.00428568923919,
                            "percentSystemPower": 12.361771999195764,
                            "order": 1
                        },
                        {
                            "power": 368.5,
                            "airflow": 1455.78,
                            "percentCapacity": 62.88457563859016,
                            "timeInterval": 15,
                            "percentPower": 88.90229191797346,
                            "percentSystemCapacity": 7.9777396209631855,
                            "percentSystemPower": 12.348368071845051,
                            "order": 1
                        },
                        {
                            "power": 365.3,
                            "airflow": 1417.75,
                            "percentCapacity": 61.24176390328033,
                            "timeInterval": 16,
                            "percentPower": 88.13027744270205,
                            "percentSystemCapacity": 7.769327237839432,
                            "percentSystemPower": 12.24113665303934,
                            "order": 1
                        },
                        {
                            "power": 366.2,
                            "airflow": 1428.32,
                            "percentCapacity": 61.69828183217723,
                            "timeInterval": 17,
                            "percentPower": 88.34740651387213,
                            "percentSystemCapacity": 7.827242571322351,
                            "percentSystemPower": 12.271295489578447,
                            "order": 1
                        },
                        {
                            "power": 365.3,
                            "airflow": 1417.75,
                            "percentCapacity": 61.24176390328033,
                            "timeInterval": 18,
                            "percentPower": 88.13027744270205,
                            "percentSystemCapacity": 7.769327237839432,
                            "percentSystemPower": 12.24113665303934,
                            "order": 1
                        },
                        {
                            "power": 363.7,
                            "airflow": 1399.2,
                            "percentCapacity": 60.44057823180928,
                            "timeInterval": 19,
                            "percentPower": 87.74427020506634,
                            "percentSystemCapacity": 7.667686245431746,
                            "percentSystemPower": 12.187520943636486,
                            "order": 1
                        },
                        {
                            "power": 368.3,
                            "airflow": 1453.36,
                            "percentCapacity": 62.78028095356581,
                            "timeInterval": 20,
                            "percentPower": 88.854041013269,
                            "percentSystemCapacity": 7.964508461612496,
                            "percentSystemPower": 12.341666108169695,
                            "order": 1
                        },
                        {
                            "power": 373.7,
                            "airflow": 1520.39,
                            "percentCapacity": 65.67551253512214,
                            "timeInterval": 21,
                            "percentPower": 90.1568154402895,
                            "percentSystemCapacity": 8.331806856576488,
                            "percentSystemPower": 12.52261912740433,
                            "order": 1
                        },
                        {
                            "power": 368.6,
                            "airflow": 1456.99,
                            "percentCapacity": 62.93680536772497,
                            "timeInterval": 22,
                            "percentPower": 88.9264173703257,
                            "percentSystemCapacity": 7.984365652470589,
                            "percentSystemPower": 12.35171905368273,
                            "order": 1
                        },
                        {
                            "power": 372.5,
                            "airflow": 1505.16,
                            "percentCapacity": 65.01758933162742,
                            "timeInterval": 23,
                            "percentPower": 89.86731001206273,
                            "percentSystemCapacity": 8.248340601858697,
                            "percentSystemPower": 12.48240734535219,
                            "order": 1
                        }
                    ],
                    "fullLoadPressure": 125,
                    "fullLoadCapacity": 2315,
                    "avgPower": 379.10416666666674,
                    "avgAirflow": 1599.9479166666667,
                    "avgPrecentPower": 91.46059509449134,
                    "avgPercentCapacity": 69.11221743240483
                },
                {
                    "compressorId": "wj0olxdhb",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 394.2,
                            "airflow": 1814.88,
                            "percentCapacity": 78.39656163823054,
                            "timeInterval": 0,
                            "percentPower": 95.10253317249699,
                            "percentSystemCapacity": 9.945640080693979,
                            "percentSystemPower": 13.20957040412841,
                            "order": 1
                        },
                        {
                            "power": 381.2,
                            "airflow": 1620.26,
                            "percentCapacity": 69.9894233766404,
                            "timeInterval": 1,
                            "percentPower": 91.96622436670687,
                            "percentSystemCapacity": 8.879083467608645,
                            "percentSystemPower": 12.773942765230212,
                            "order": 1
                        },
                        {
                            "power": 380.8,
                            "airflow": 1614.72,
                            "percentCapacity": 69.75015677448182,
                            "timeInterval": 2,
                            "percentPower": 91.86972255729795,
                            "percentSystemCapacity": 8.848729336525944,
                            "percentSystemPower": 12.760538837879501,
                            "order": 1
                        },
                        {
                            "power": 373.2,
                            "airflow": 1514.02,
                            "percentCapacity": 65.4003413718952,
                            "timeInterval": 3,
                            "percentPower": 90.03618817852835,
                            "percentSystemCapacity": 8.296897757339837,
                            "percentSystemPower": 12.505864218215937,
                            "order": 1
                        },
                        {
                            "power": 379.3,
                            "airflow": 1594.16,
                            "percentCapacity": 68.86241238288946,
                            "timeInterval": 4,
                            "percentPower": 91.50784077201448,
                            "percentSystemCapacity": 8.736107226347496,
                            "percentSystemPower": 12.710274110314323,
                            "order": 1
                        },
                        {
                            "power": 385.7,
                            "airflow": 1684.33,
                            "percentCapacity": 72.7573345197575,
                            "timeInterval": 5,
                            "percentPower": 93.05186972255729,
                            "percentSystemCapacity": 9.230229582049464,
                            "percentSystemPower": 12.924736947925744,
                            "order": 1
                        },
                        {
                            "power": 400.6,
                            "airflow": 1922.3,
                            "percentCapacity": 83.03691285427365,
                            "timeInterval": 6,
                            "percentPower": 96.64656212303981,
                            "percentSystemCapacity": 10.534329968086558,
                            "percentSystemPower": 13.42403324173983,
                            "order": 1
                        },
                        {
                            "power": 390,
                            "airflow": 1748.74,
                            "percentCapacity": 75.53969086793906,
                            "timeInterval": 7,
                            "percentPower": 94.08926417370326,
                            "percentSystemCapacity": 9.583208261687798,
                            "percentSystemPower": 13.068829166945918,
                            "order": 1
                        },
                        {
                            "power": 401.2,
                            "airflow": 1932.81,
                            "percentCapacity": 83.49082766199842,
                            "timeInterval": 8,
                            "percentPower": 96.7913148371532,
                            "percentSystemCapacity": 10.591915061241032,
                            "percentSystemPower": 13.444139132765901,
                            "order": 1
                        },
                        {
                            "power": 402.2,
                            "airflow": 1950.5,
                            "percentCapacity": 84.25486286359086,
                            "timeInterval": 9,
                            "percentPower": 97.03256936067551,
                            "percentSystemCapacity": 10.688843025493908,
                            "percentSystemPower": 13.477648951142685,
                            "order": 1
                        },
                        {
                            "power": 412.9,
                            "airflow": 2154.31,
                            "percentCapacity": 93.05875396229393,
                            "timeInterval": 10,
                            "percentPower": 99.61399276236429,
                            "percentSystemCapacity": 11.805732980201142,
                            "percentSystemPower": 13.836204007774278,
                            "order": 1
                        },
                        {
                            "power": 408.6,
                            "airflow": 2069.08,
                            "percentCapacity": 89.37693520704872,
                            "timeInterval": 11,
                            "percentPower": 98.57659831121835,
                            "percentSystemCapacity": 11.338645605234426,
                            "percentSystemPower": 13.692111788754108,
                            "order": 1
                        },
                        {
                            "power": 397.1,
                            "airflow": 1862.52,
                            "percentCapacity": 80.45460111148302,
                            "timeInterval": 12,
                            "percentPower": 95.8021712907117,
                            "percentSystemCapacity": 10.20672959080903,
                            "percentSystemPower": 13.306748877421084,
                            "order": 1
                        },
                        {
                            "power": 390.8,
                            "airflow": 1761.09,
                            "percentCapacity": 76.07295325228085,
                            "timeInterval": 13,
                            "percentPower": 94.28226779252111,
                            "percentSystemCapacity": 9.650859643743432,
                            "percentSystemPower": 13.095637021647343,
                            "order": 1
                        },
                        {
                            "power": 386.6,
                            "airflow": 1697.55,
                            "percentCapacity": 73.32824316849234,
                            "timeInterval": 14,
                            "percentPower": 93.26899879372739,
                            "percentSystemCapacity": 9.302656890347421,
                            "percentSystemPower": 12.954895784464851,
                            "order": 1
                        },
                        {
                            "power": 383.2,
                            "airflow": 1648.33,
                            "percentCapacity": 71.20210934274196,
                            "timeInterval": 15,
                            "percentPower": 92.44873341375151,
                            "percentSystemCapacity": 9.032928711554561,
                            "percentSystemPower": 12.840962401983782,
                            "order": 1
                        },
                        {
                            "power": 382.1,
                            "airflow": 1632.81,
                            "percentCapacity": 70.53173533924513,
                            "timeInterval": 16,
                            "percentPower": 92.18335343787697,
                            "percentSystemCapacity": 8.947882908283235,
                            "percentSystemPower": 12.804101601769318,
                            "order": 1
                        },
                        {
                            "power": 381.8,
                            "airflow": 1628.61,
                            "percentCapacity": 70.3503518035987,
                            "timeInterval": 17,
                            "percentPower": 92.11097708082026,
                            "percentSystemCapacity": 8.924872009279428,
                            "percentSystemPower": 12.794048656256285,
                            "order": 1
                        },
                        {
                            "power": 385.5,
                            "airflow": 1681.41,
                            "percentCapacity": 72.63126872614451,
                            "timeInterval": 18,
                            "percentPower": 93.00361881785284,
                            "percentSystemCapacity": 9.214236469806256,
                            "percentSystemPower": 12.918034984250387,
                            "order": 1
                        },
                        {
                            "power": 387.1,
                            "airflow": 1704.95,
                            "percentCapacity": 73.64799139733798,
                            "timeInterval": 19,
                            "percentPower": 93.38962605548855,
                            "percentSystemCapacity": 9.343221179572414,
                            "percentSystemPower": 12.971650693653242,
                            "order": 1
                        },
                        {
                            "power": 386.7,
                            "airflow": 1699.03,
                            "percentCapacity": 73.39204476666117,
                            "timeInterval": 20,
                            "percentPower": 93.2931242460796,
                            "percentSystemCapacity": 9.310750966397446,
                            "percentSystemPower": 12.958246766302528,
                            "order": 1
                        },
                        {
                            "power": 404.7,
                            "airflow": 1995.69,
                            "percentCapacity": 86.206950635842,
                            "timeInterval": 21,
                            "percentPower": 97.6357056694813,
                            "percentSystemCapacity": 10.936491161879342,
                            "percentSystemPower": 13.561423497084647,
                            "order": 1
                        },
                        {
                            "power": 411.2,
                            "airflow": 2120.05,
                            "percentCapacity": 91.57891874317805,
                            "timeInterval": 22,
                            "percentPower": 99.20386007237636,
                            "percentSystemCapacity": 11.617996322361748,
                            "percentSystemPower": 13.779237316533747,
                            "order": 1
                        },
                        {
                            "power": 417.1000000000001,
                            "airflow": 2242.24,
                            "percentCapacity": 96.85702859033256,
                            "timeInterval": 23,
                            "percentPower": 100.62726176115804,
                            "percentSystemCapacity": 12.28759432193226,
                            "percentSystemPower": 13.976945244956775,
                            "order": 1
                        }
                    ],
                    "fullLoadPressure": 125,
                    "fullLoadCapacity": 2315,
                    "avgPower": 392.6583333333335,
                    "avgAirflow": 1803.9329166666666,
                    "avgPrecentPower": 94.73059911540008,
                    "avgPercentCapacity": 77.92368376493242
                },
                {
                    "compressorId": "o105l9t3y",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 153.7,
                            "airflow": 387.25,
                            "percentCapacity": 20.853790620777545,
                            "timeInterval": 0,
                            "percentPower": 52.98173043778007,
                            "percentSystemCapacity": 2.122177180117487,
                            "percentSystemPower": 5.150459084511762,
                            "order": 6
                        },
                        {
                            "power": 154.2,
                            "airflow": 389.74,
                            "percentCapacity": 20.98747236379449,
                            "timeInterval": 1,
                            "percentPower": 53.154084798345394,
                            "percentSystemCapacity": 2.1357812461402,
                            "percentSystemPower": 5.1672139937001536,
                            "order": 6
                        },
                        {
                            "power": 155.5,
                            "airflow": 396.23,
                            "percentCapacity": 21.33700197532327,
                            "timeInterval": 2,
                            "percentPower": 53.60220613581524,
                            "percentSystemCapacity": 2.171350979185407,
                            "percentSystemPower": 5.210776757589974,
                            "order": 6
                        },
                        {
                            "power": 163.5,
                            "airflow": 437.39,
                            "percentCapacity": 23.553749540544448,
                            "timeInterval": 3,
                            "percentPower": 56.35987590486039,
                            "percentSystemCapacity": 2.3969373573427797,
                            "percentSystemPower": 5.47885530460425,
                            "order": 6
                        },
                        {
                            "power": 158.2,
                            "airflow": 409.88,
                            "percentCapacity": 22.072217399945817,
                            "timeInterval": 4,
                            "percentPower": 54.53291968286796,
                            "percentSystemCapacity": 2.2461698658318383,
                            "percentSystemPower": 5.301253267207292,
                            "order": 6
                        },
                        {
                            "power": 162.80000000000004,
                            "airflow": 433.7,
                            "percentCapacity": 23.355047608622094,
                            "timeInterval": 5,
                            "percentPower": 56.11857980006894,
                            "percentSystemCapacity": 2.376716539303553,
                            "percentSystemPower": 5.455398431740502,
                            "order": 6
                        },
                        {
                            "power": 168,
                            "airflow": 461.54,
                            "percentCapacity": 24.85428106126598,
                            "timeInterval": 6,
                            "percentPower": 57.91106514994829,
                            "percentSystemCapacity": 2.529285397346061,
                            "percentSystemPower": 5.62964948729978,
                            "order": 6
                        },
                        {
                            "power": 155.20000000000002,
                            "airflow": 394.73,
                            "percentCapacity": 21.256088204081923,
                            "timeInterval": 7,
                            "percentPower": 53.49879351947604,
                            "percentSystemCapacity": 2.1631168234864164,
                            "percentSystemPower": 5.200723812076939,
                            "order": 6
                        },
                        {
                            "power": 157.3,
                            "airflow": 405.3,
                            "percentCapacity": 21.825730648442224,
                            "timeInterval": 8,
                            "percentPower": 54.222681833850395,
                            "percentSystemCapacity": 2.2210862458437752,
                            "percentSystemPower": 5.271094430668186,
                            "order": 6
                        },
                        {
                            "power": 156.1,
                            "airflow": 399.24,
                            "percentCapacity": 21.499290075074132,
                            "timeInterval": 9,
                            "percentPower": 53.80903136849362,
                            "percentSystemCapacity": 2.1878661589989403,
                            "percentSystemPower": 5.230882648616045,
                            "order": 6
                        },
                        {
                            "power": 153.3,
                            "airflow": 385.27,
                            "percentCapacity": 20.747142479434707,
                            "timeInterval": 10,
                            "percentPower": 52.84384694932782,
                            "percentSystemCapacity": 2.1113241771323024,
                            "percentSystemPower": 5.137055157161049,
                            "order": 6
                        },
                        {
                            "power": 151.7,
                            "airflow": 377.4,
                            "percentCapacity": 20.323153570426605,
                            "timeInterval": 11,
                            "percentPower": 52.29231299551878,
                            "percentSystemCapacity": 2.068177125179867,
                            "percentSystemPower": 5.0834394477581935,
                            "order": 6
                        },
                        {
                            "power": 152.59999999999997,
                            "airflow": 381.82,
                            "percentCapacity": 20.56113807437829,
                            "timeInterval": 12,
                            "percentPower": 52.60255084453635,
                            "percentSystemCapacity": 2.092395517542771,
                            "percentSystemPower": 5.113598284297298,
                            "order": 6
                        },
                        {
                            "power": 152.3,
                            "airflow": 380.34,
                            "percentCapacity": 20.481665269885244,
                            "timeInterval": 13,
                            "percentPower": 52.499138228197175,
                            "percentSystemCapacity": 2.0843080012153057,
                            "percentSystemPower": 5.103545338784264,
                            "order": 6
                        },
                        {
                            "power": 154,
                            "airflow": 388.74,
                            "percentCapacity": 20.933949921302275,
                            "timeInterval": 14,
                            "percentPower": 53.085143054119264,
                            "percentSystemCapacity": 2.1303345574231876,
                            "percentSystemPower": 5.1605120300247975,
                            "order": 6
                        },
                        {
                            "power": 154.1,
                            "airflow": 389.24,
                            "percentCapacity": 20.96070283230756,
                            "timeInterval": 15,
                            "percentPower": 53.119613926232326,
                            "percentSystemCapacity": 2.133057056093552,
                            "percentSystemPower": 5.163863011862476,
                            "order": 6
                        },
                        {
                            "power": 155.3,
                            "airflow": 395.23,
                            "percentCapacity": 21.283042481429685,
                            "timeInterval": 16,
                            "percentPower": 53.53326439158911,
                            "percentSystemCapacity": 2.1658598141174332,
                            "percentSystemPower": 5.204074793914618,
                            "order": 6
                        },
                        {
                            "power": 154.3,
                            "airflow": 390.23,
                            "percentCapacity": 21.014258544821278,
                            "timeInterval": 17,
                            "percentPower": 53.188555670458456,
                            "percentSystemCapacity": 2.1385071305202277,
                            "percentSystemPower": 5.170564975537833,
                            "order": 6
                        },
                        {
                            "power": 154,
                            "airflow": 388.74,
                            "percentCapacity": 20.933949921302275,
                            "timeInterval": 18,
                            "percentPower": 53.085143054119264,
                            "percentSystemCapacity": 2.1303345574231876,
                            "percentSystemPower": 5.1605120300247975,
                            "order": 6
                        },
                        {
                            "power": 155.9,
                            "airflow": 398.24,
                            "percentCapacity": 21.445125538138086,
                            "timeInterval": 19,
                            "percentPower": 53.7400896242675,
                            "percentSystemCapacity": 2.182354127812496,
                            "percentSystemPower": 5.224180684940688,
                            "order": 6
                        },
                        {
                            "power": 155.4,
                            "airflow": 395.73,
                            "percentCapacity": 21.310013728774496,
                            "timeInterval": 20,
                            "percentPower": 53.56773526370217,
                            "percentSystemCapacity": 2.1686045316930205,
                            "percentSystemPower": 5.207425775752296,
                            "order": 6
                        },
                        {
                            "power": 155.1,
                            "airflow": 394.23,
                            "percentCapacity": 21.22915086753657,
                            "timeInterval": 21,
                            "percentPower": 53.46432264736297,
                            "percentSystemCapacity": 2.16037555682899,
                            "percentSystemPower": 5.19737283023926,
                            "order": 6
                        },
                        {
                            "power": 154.9,
                            "airflow": 393.23,
                            "percentCapacity": 21.175326900137232,
                            "timeInterval": 22,
                            "percentPower": 53.39538090313685,
                            "percentSystemCapacity": 2.1548981835573677,
                            "percentSystemPower": 5.190670866563904,
                            "order": 6
                        },
                        {
                            "power": 155.8,
                            "airflow": 397.73,
                            "percentCapacity": 21.418069002452118,
                            "timeInterval": 23,
                            "percentPower": 53.70561875215443,
                            "percentSystemCapacity": 2.1796007309049528,
                            "percentSystemPower": 5.22082970310301,
                            "order": 6
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 155.9666666666667,
                    "avgAirflow": 398.79874999999987,
                    "avgPrecentPower": 53.76307020567619,
                    "avgPercentCapacity": 21.475473276258267
                },
                {
                    "compressorId": "o105l9t3y",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 195.3,
                            "airflow": 626.85,
                            "percentCapacity": 33.756147239845625,
                            "timeInterval": 0,
                            "percentPower": 67.3216132368149,
                            "percentSystemCapacity": 3.435180042985167,
                            "percentSystemPower": 6.544467528985994,
                            "order": 6
                        },
                        {
                            "power": 194.79999999999998,
                            "airflow": 623.49,
                            "percentCapacity": 33.57502902873946,
                            "timeInterval": 1,
                            "percentPower": 67.14925887624956,
                            "percentSystemCapacity": 3.416748624855829,
                            "percentSystemPower": 6.5277126197976,
                            "order": 6
                        },
                        {
                            "power": 231.80000000000004,
                            "airflow": 918.61,
                            "percentCapacity": 49.46767890827795,
                            "timeInterval": 2,
                            "percentPower": 79.90348155808343,
                            "percentSystemCapacity": 5.03405741630163,
                            "percentSystemPower": 7.767575899738626,
                            "order": 6
                        },
                        {
                            "power": 234.9,
                            "airflow": 948.59,
                            "percentCapacity": 51.0818282056146,
                            "timeInterval": 3,
                            "percentPower": 80.97207859358842,
                            "percentSystemCapacity": 5.198320636662994,
                            "percentSystemPower": 7.871456336706656,
                            "order": 6
                        },
                        {
                            "power": 233.5,
                            "airflow": 934.93,
                            "percentCapacity": 50.346208288317214,
                            "timeInterval": 4,
                            "percentPower": 80.4894863840055,
                            "percentSystemCapacity": 5.123460586990633,
                            "percentSystemPower": 7.824542590979157,
                            "order": 6
                        },
                        {
                            "power": 231.80000000000004,
                            "airflow": 918.61,
                            "percentCapacity": 49.46767890827795,
                            "timeInterval": 5,
                            "percentPower": 79.90348155808343,
                            "percentSystemCapacity": 5.03405741630163,
                            "percentSystemPower": 7.767575899738626,
                            "order": 6
                        },
                        {
                            "power": 247.5,
                            "airflow": 1081.62,
                            "percentCapacity": 58.245502799371884,
                            "timeInterval": 6,
                            "percentPower": 85.31540847983453,
                            "percentSystemCapacity": 5.927328951032091,
                            "percentSystemPower": 8.293680048254139,
                            "order": 6
                        },
                        {
                            "power": 198.3,
                            "airflow": 647.33,
                            "percentCapacity": 34.85911099896188,
                            "timeInterval": 7,
                            "percentPower": 68.35573940020683,
                            "percentSystemCapacity": 3.547422683311717,
                            "percentSystemPower": 6.6449969841163465,
                            "order": 6
                        },
                        {
                            "power": 201.6,
                            "airflow": 670.48,
                            "percentCapacity": 36.10561313393327,
                            "timeInterval": 8,
                            "percentPower": 69.49327817993795,
                            "percentSystemCapacity": 3.6742724457318103,
                            "percentSystemPower": 6.755579384759734,
                            "order": 6
                        },
                        {
                            "power": 196,
                            "airflow": 631.58,
                            "percentCapacity": 34.01099900206375,
                            "timeInterval": 9,
                            "percentPower": 67.56290934160634,
                            "percentSystemCapacity": 3.461114924749692,
                            "percentSystemPower": 6.5679244018497425,
                            "order": 6
                        },
                        {
                            "power": 195.5,
                            "airflow": 628.2,
                            "percentCapacity": 33.82880839780952,
                            "timeInterval": 10,
                            "percentPower": 67.39055498104102,
                            "percentSystemCapacity": 3.4425743749853286,
                            "percentSystemPower": 6.551169492661351,
                            "order": 6
                        },
                        {
                            "power": 196.6,
                            "airflow": 635.66,
                            "percentCapacity": 34.230647923478244,
                            "timeInterval": 11,
                            "percentPower": 67.76973457428473,
                            "percentSystemCapacity": 3.4834674043127514,
                            "percentSystemPower": 6.588030292875812,
                            "order": 6
                        },
                        {
                            "power": 196.4,
                            "airflow": 634.3,
                            "percentCapacity": 34.157307430811024,
                            "timeInterval": 12,
                            "percentPower": 67.7007928300586,
                            "percentSystemCapacity": 3.4760039401039053,
                            "percentSystemPower": 6.581328329200456,
                            "order": 6
                        },
                        {
                            "power": 198.1,
                            "airflow": 645.95,
                            "percentCapacity": 34.78469956715019,
                            "timeInterval": 13,
                            "percentPower": 68.28679765598069,
                            "percentSystemCapacity": 3.5398502354339048,
                            "percentSystemPower": 6.638295020440989,
                            "order": 6
                        },
                        {
                            "power": 197.40000000000003,
                            "airflow": 641.13,
                            "percentCapacity": 34.5252599918708,
                            "timeInterval": 14,
                            "percentPower": 68.04550155118925,
                            "percentSystemCapacity": 3.5134484768141205,
                            "percentSystemPower": 6.614838147577242,
                            "order": 6
                        },
                        {
                            "power": 197.8,
                            "airflow": 643.88,
                            "percentCapacity": 34.67332107066062,
                            "timeInterval": 15,
                            "percentPower": 68.1833850396415,
                            "percentSystemCapacity": 3.528515849858438,
                            "percentSystemPower": 6.628242074927955,
                            "order": 6
                        },
                        {
                            "power": 200.3,
                            "airflow": 661.28,
                            "percentCapacity": 35.61030978227141,
                            "timeInterval": 16,
                            "percentPower": 69.04515684246812,
                            "percentSystemCapacity": 3.6238681096930083,
                            "percentSystemPower": 6.712016620869915,
                            "order": 6
                        },
                        {
                            "power": 198.4,
                            "airflow": 648.03,
                            "percentCapacity": 34.896364581392746,
                            "timeInterval": 17,
                            "percentPower": 68.39021027231989,
                            "percentSystemCapacity": 3.5512137783672912,
                            "percentSystemPower": 6.648347965954025,
                            "order": 6
                        },
                        {
                            "power": 197.8,
                            "airflow": 643.88,
                            "percentCapacity": 34.67332107066062,
                            "timeInterval": 18,
                            "percentPower": 68.1833850396415,
                            "percentSystemCapacity": 3.528515849858438,
                            "percentSystemPower": 6.628242074927955,
                            "order": 6
                        },
                        {
                            "power": 199,
                            "airflow": 652.19,
                            "percentCapacity": 35.12055908526016,
                            "timeInterval": 19,
                            "percentPower": 68.59703550499827,
                            "percentSystemCapacity": 3.574028837205619,
                            "percentSystemPower": 6.668453856980096,
                            "order": 6
                        },
                        {
                            "power": 201.30000000000004,
                            "airflow": 668.35,
                            "percentCapacity": 35.99081405316896,
                            "timeInterval": 20,
                            "percentPower": 69.38986556359876,
                            "percentSystemCapacity": 3.6625899658447376,
                            "percentSystemPower": 6.7455264392467,
                            "order": 6
                        },
                        {
                            "power": 200.20000000000002,
                            "airflow": 660.58,
                            "percentCapacity": 35.57244084035142,
                            "timeInterval": 21,
                            "percentPower": 69.01068597035504,
                            "percentSystemCapacity": 3.620014392839357,
                            "percentSystemPower": 6.708665639032238,
                            "order": 6
                        },
                        {
                            "power": 202.7,
                            "airflow": 678.35,
                            "percentCapacity": 36.529130898173946,
                            "timeInterval": 22,
                            "percentPower": 69.87245777318165,
                            "percentSystemCapacity": 3.7173715518363117,
                            "percentSystemPower": 6.792440184974198,
                            "order": 6
                        },
                        {
                            "power": 202.2,
                            "airflow": 674.76,
                            "percentCapacity": 36.33611650717336,
                            "timeInterval": 23,
                            "percentPower": 69.70010341261633,
                            "percentSystemCapacity": 3.697729523992817,
                            "percentSystemPower": 6.775685275785805,
                            "order": 6
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 206.2166666666667,
                    "avgAirflow": 713.2762499999999,
                    "avgPrecentPower": 71.08468344249108,
                    "avgPercentCapacity": 38.410204071401516
                },
                {
                    "compressorId": "zsekn3poe",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 213.59999999999997,
                            "airflow": 760.62,
                            "percentCapacity": 40.95951057252891,
                            "timeInterval": 0,
                            "percentPower": 73.62978283350567,
                            "percentSystemCapacity": 4.168227265080348,
                            "percentSystemPower": 7.1576972052811465,
                            "order": 7
                        },
                        {
                            "power": 212,
                            "airflow": 748.02,
                            "percentCapacity": 40.28117770426412,
                            "timeInterval": 1,
                            "percentPower": 73.07824887969664,
                            "percentSystemCapacity": 4.099197007716926,
                            "percentSystemPower": 7.104081495878292,
                            "order": 7
                        },
                        {
                            "power": 211,
                            "airflow": 740.24,
                            "percentCapacity": 39.86231997418118,
                            "timeInterval": 2,
                            "percentPower": 72.733540158566,
                            "percentSystemCapacity": 4.056572128017013,
                            "percentSystemPower": 7.070571677501508,
                            "order": 7
                        },
                        {
                            "power": 207.6,
                            "airflow": 714.33,
                            "percentCapacity": 38.46666420265902,
                            "timeInterval": 3,
                            "percentPower": 71.56153050672181,
                            "percentSystemCapacity": 3.914543808874277,
                            "percentSystemPower": 6.956638295020441,
                            "order": 7
                        },
                        {
                            "power": 218.8,
                            "airflow": 802.9,
                            "percentCapacity": 43.23635570216482,
                            "timeInterval": 4,
                            "percentPower": 75.42226818338503,
                            "percentSystemCapacity": 4.399929446455506,
                            "percentSystemPower": 7.331948260840428,
                            "order": 7
                        },
                        {
                            "power": 212.8,
                            "airflow": 754.3,
                            "percentCapacity": 40.619076976350485,
                            "timeInterval": 5,
                            "percentPower": 73.35401585660118,
                            "percentSystemCapacity": 4.133583184189109,
                            "percentSystemPower": 7.130889350579721,
                            "order": 7
                        },
                        {
                            "power": 222.2,
                            "airflow": 831.72,
                            "percentCapacity": 44.78816194161088,
                            "timeInterval": 6,
                            "percentPower": 76.59427783522922,
                            "percentSystemCapacity": 4.557848351905492,
                            "percentSystemPower": 7.445881643321493,
                            "order": 7
                        },
                        {
                            "power": 209.6,
                            "airflow": 729.47,
                            "percentCapacity": 39.28237622225458,
                            "timeInterval": 7,
                            "percentPower": 72.2509479489831,
                            "percentSystemCapacity": 3.9975543974532415,
                            "percentSystemPower": 7.023657931774011,
                            "order": 7
                        },
                        {
                            "power": 218.9,
                            "airflow": 803.73,
                            "percentCapacity": 43.28126452670609,
                            "timeInterval": 8,
                            "percentPower": 75.4567390554981,
                            "percentSystemCapacity": 4.4044995739858175,
                            "percentSystemPower": 7.335299242678104,
                            "order": 7
                        },
                        {
                            "power": 224.7,
                            "airflow": 853.53,
                            "percentCapacity": 45.963002398270206,
                            "timeInterval": 9,
                            "percentPower": 77.45604963805583,
                            "percentSystemCapacity": 4.677405493949352,
                            "percentSystemPower": 7.529656189263455,
                            "order": 7
                        },
                        {
                            "power": 224.3,
                            "airflow": 850.01,
                            "percentCapacity": 45.773043341793795,
                            "timeInterval": 10,
                            "percentPower": 77.31816614960358,
                            "percentSystemCapacity": 4.6580743909311195,
                            "percentSystemPower": 7.516252261912741,
                            "order": 7
                        },
                        {
                            "power": 230.8,
                            "airflow": 909.15,
                            "percentCapacity": 48.95825871132659,
                            "timeInterval": 11,
                            "percentPower": 79.55877283695277,
                            "percentSystemCapacity": 4.982216485474216,
                            "percentSystemPower": 7.73406608136184,
                            "order": 7
                        },
                        {
                            "power": 232.4,
                            "airflow": 924.34,
                            "percentCapacity": 49.77593149739461,
                            "timeInterval": 12,
                            "percentPower": 80.1103067907618,
                            "percentSystemCapacity": 5.065426610623728,
                            "percentSystemPower": 7.787681790764695,
                            "order": 7
                        },
                        {
                            "power": 237.2,
                            "airflow": 971.49,
                            "percentCapacity": 52.31490483808674,
                            "timeInterval": 13,
                            "percentPower": 81.7649086521889,
                            "percentSystemCapacity": 5.323804158501046,
                            "percentSystemPower": 7.948528918973259,
                            "order": 7
                        },
                        {
                            "power": 238.3,
                            "airflow": 982.65,
                            "percentCapacity": 52.91574798127563,
                            "timeInterval": 14,
                            "percentPower": 82.14408824543261,
                            "percentSystemCapacity": 5.384948706774926,
                            "percentSystemPower": 7.985389719187723,
                            "order": 7
                        },
                        {
                            "power": 240.3,
                            "airflow": 1003.29,
                            "percentCapacity": 54.0272265739973,
                            "timeInterval": 15,
                            "percentPower": 82.8335056876939,
                            "percentSystemCapacity": 5.498057855541045,
                            "percentSystemPower": 8.052409355941291,
                            "order": 7
                        },
                        {
                            "power": 239.7,
                            "airflow": 997.04,
                            "percentCapacity": 53.69116400802525,
                            "timeInterval": 16,
                            "percentPower": 82.6266804550155,
                            "percentSystemCapacity": 5.463858590689549,
                            "percentSystemPower": 8.03230346491522,
                            "order": 7
                        },
                        {
                            "power": 238.50000000000003,
                            "airflow": 984.69,
                            "percentCapacity": 53.02578167749572,
                            "timeInterval": 17,
                            "percentPower": 82.21302998965874,
                            "percentSystemCapacity": 5.396146239319901,
                            "percentSystemPower": 7.99209168286308,
                            "order": 7
                        },
                        {
                            "power": 239,
                            "airflow": 989.82,
                            "percentCapacity": 53.30194046803947,
                            "timeInterval": 18,
                            "percentPower": 82.38538435022406,
                            "percentSystemCapacity": 5.424249421807831,
                            "percentSystemPower": 8.008846592051471,
                            "order": 7
                        },
                        {
                            "power": 233,
                            "airflow": 930.1,
                            "percentCapacity": 50.08615994515806,
                            "timeInterval": 19,
                            "percentPower": 80.31713202344018,
                            "percentSystemCapacity": 5.09699687736511,
                            "percentSystemPower": 7.8077876817907645,
                            "order": 7
                        },
                        {
                            "power": 226.3,
                            "airflow": 867.79,
                            "percentCapacity": 46.73057505640279,
                            "timeInterval": 20,
                            "percentPower": 78.00758359186487,
                            "percentSystemCapacity": 4.755517200774879,
                            "percentSystemPower": 7.583271898666311,
                            "order": 7
                        },
                        {
                            "power": 233,
                            "airflow": 930.1,
                            "percentCapacity": 50.08615994515806,
                            "timeInterval": 21,
                            "percentPower": 80.31713202344018,
                            "percentSystemCapacity": 5.09699687736511,
                            "percentSystemPower": 7.8077876817907645,
                            "order": 7
                        },
                        {
                            "power": 210.9,
                            "airflow": 739.47,
                            "percentCapacity": 39.820646998872256,
                            "timeInterval": 22,
                            "percentPower": 72.69906928645294,
                            "percentSystemCapacity": 4.052331295314872,
                            "percentSystemPower": 7.0672206956638295,
                            "order": 7
                        },
                        {
                            "power": 197.5,
                            "airflow": 641.82,
                            "percentCapacity": 34.56222786994664,
                            "timeInterval": 23,
                            "percentPower": 68.07997242330231,
                            "percentSystemCapacity": 3.517210497286875,
                            "percentSystemPower": 6.618189129414918,
                            "order": 7
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 223.85000000000002,
                    "avgAirflow": 852.5258333333333,
                    "avgPrecentPower": 77.16304722509477,
                    "avgPercentCapacity": 45.90873663058179
                },
                {
                    "compressorId": "zsekn3poe",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 241.5,
                            "airflow": 1015.89,
                            "percentCapacity": 54.706220793618684,
                            "timeInterval": 0,
                            "percentPower": 83.24715615305067,
                            "percentSystemCapacity": 5.567155415045479,
                            "percentSystemPower": 8.092621137993433,
                            "order": 7
                        },
                        {
                            "power": 241.5,
                            "airflow": 1015.89,
                            "percentCapacity": 54.706220793618684,
                            "timeInterval": 1,
                            "percentPower": 83.24715615305067,
                            "percentSystemCapacity": 5.567155415045479,
                            "percentSystemPower": 8.092621137993433,
                            "order": 7
                        },
                        {
                            "power": 240.8,
                            "airflow": 1008.52,
                            "percentCapacity": 54.30902017970474,
                            "timeInterval": 2,
                            "percentPower": 83.00586004825922,
                            "percentSystemCapacity": 5.526734462610242,
                            "percentSystemPower": 8.069164265129684,
                            "order": 7
                        },
                        {
                            "power": 240.3,
                            "airflow": 1003.29,
                            "percentCapacity": 54.0272265739973,
                            "timeInterval": 3,
                            "percentPower": 82.8335056876939,
                            "percentSystemCapacity": 5.498057855541045,
                            "percentSystemPower": 8.052409355941291,
                            "order": 7
                        },
                        {
                            "power": 241,
                            "airflow": 1010.62,
                            "percentCapacity": 54.422184489419756,
                            "timeInterval": 4,
                            "percentPower": 83.07480179248535,
                            "percentSystemCapacity": 5.538250580713091,
                            "percentSystemPower": 8.07586622880504,
                            "order": 7
                        },
                        {
                            "power": 240.1,
                            "airflow": 1001.2,
                            "percentCapacity": 53.91495351147111,
                            "timeInterval": 5,
                            "percentPower": 82.76456394346776,
                            "percentSystemCapacity": 5.486632434831316,
                            "percentSystemPower": 8.045707392265934,
                            "order": 7
                        },
                        {
                            "power": 234.9,
                            "airflow": 948.59,
                            "percentCapacity": 51.0818282056146,
                            "timeInterval": 6,
                            "percentPower": 80.97207859358842,
                            "percentSystemCapacity": 5.198320636662994,
                            "percentSystemPower": 7.871456336706656,
                            "order": 7
                        },
                        {
                            "power": 239.5,
                            "airflow": 994.97,
                            "percentCapacity": 53.57964570073679,
                            "timeInterval": 7,
                            "percentPower": 82.55773871078938,
                            "percentSystemCapacity": 5.4525099773272805,
                            "percentSystemPower": 8.025601501239864,
                            "order": 7
                        },
                        {
                            "power": 239.3,
                            "airflow": 992.91,
                            "percentCapacity": 53.46837711952131,
                            "timeInterval": 8,
                            "percentPower": 82.48879696656324,
                            "percentSystemCapacity": 5.44118677723318,
                            "percentSystemPower": 8.018899537564508,
                            "order": 7
                        },
                        {
                            "power": 237.7,
                            "airflow": 976.54,
                            "percentCapacity": 52.587108861529245,
                            "timeInterval": 9,
                            "percentPower": 81.93726301275422,
                            "percentSystemCapacity": 5.351504885788021,
                            "percentSystemPower": 7.965283828161651,
                            "order": 7
                        },
                        {
                            "power": 238.6,
                            "airflow": 985.71,
                            "percentCapacity": 53.08089040369188,
                            "timeInterval": 10,
                            "percentPower": 82.2475008617718,
                            "percentSystemCapacity": 5.401754355526952,
                            "percentSystemPower": 7.995442664700758,
                            "order": 7
                        },
                        {
                            "power": 239.2,
                            "airflow": 991.88,
                            "percentCapacity": 53.41283618784261,
                            "timeInterval": 11,
                            "percentPower": 82.45432609445018,
                            "percentSystemCapacity": 5.435534677818047,
                            "percentSystemPower": 8.015548555726829,
                            "order": 7
                        },
                        {
                            "power": 239.6,
                            "airflow": 996.01,
                            "percentCapacity": 53.635373580814985,
                            "timeInterval": 12,
                            "percentPower": 82.59220958290244,
                            "percentSystemCapacity": 5.458181101467197,
                            "percentSystemPower": 8.028952483077543,
                            "order": 7
                        },
                        {
                            "power": 239.99999999999997,
                            "airflow": 1000.16,
                            "percentCapacity": 53.85891173340009,
                            "timeInterval": 13,
                            "percentPower": 82.73009307135469,
                            "percentSystemCapacity": 5.480929366994957,
                            "percentSystemPower": 8.042356410428255,
                            "order": 7
                        },
                        {
                            "power": 239.3,
                            "airflow": 992.91,
                            "percentCapacity": 53.46837711952131,
                            "timeInterval": 14,
                            "percentPower": 82.48879696656324,
                            "percentSystemCapacity": 5.44118677723318,
                            "percentSystemPower": 8.018899537564508,
                            "order": 7
                        },
                        {
                            "power": 239.6,
                            "airflow": 996.01,
                            "percentCapacity": 53.635373580814985,
                            "timeInterval": 15,
                            "percentPower": 82.59220958290244,
                            "percentSystemCapacity": 5.458181101467197,
                            "percentSystemPower": 8.028952483077543,
                            "order": 7
                        },
                        {
                            "power": 240.19999999999996,
                            "airflow": 1002.24,
                            "percentCapacity": 53.97105841922265,
                            "timeInterval": 16,
                            "percentPower": 82.79903481558082,
                            "percentSystemCapacity": 5.492341927032906,
                            "percentSystemPower": 8.04905837410361,
                            "order": 7
                        },
                        {
                            "power": 240.4,
                            "airflow": 1004.33,
                            "percentCapacity": 54.083458093414016,
                            "timeInterval": 17,
                            "percentPower": 82.86797655980695,
                            "percentSystemCapacity": 5.503780232325177,
                            "percentSystemPower": 8.055760337778969,
                            "order": 7
                        },
                        {
                            "power": 239.99999999999997,
                            "airflow": 1000.16,
                            "percentCapacity": 53.85891173340009,
                            "timeInterval": 18,
                            "percentPower": 82.73009307135469,
                            "percentSystemCapacity": 5.480929366994957,
                            "percentSystemPower": 8.042356410428255,
                            "order": 7
                        },
                        {
                            "power": 240.6,
                            "airflow": 1006.42,
                            "percentCapacity": 54.19611169805525,
                            "timeInterval": 19,
                            "percentPower": 82.93691830403309,
                            "percentSystemCapacity": 5.515244378742251,
                            "percentSystemPower": 8.062462301454326,
                            "order": 7
                        },
                        {
                            "power": 243.7,
                            "airflow": 1039.46,
                            "percentCapacity": 55.97543230584003,
                            "timeInterval": 20,
                            "percentPower": 84.00551533953808,
                            "percentSystemCapacity": 5.696316187633984,
                            "percentSystemPower": 8.166342738422358,
                            "order": 7
                        },
                        {
                            "power": 275.5,
                            "airflow": 1463.3,
                            "percentCapacity": 78.79900266551543,
                            "timeInterval": 21,
                            "percentPower": 94.96725267149259,
                            "percentSystemCapacity": 8.018947169545273,
                            "percentSystemPower": 9.231954962804103,
                            "order": 7
                        },
                        {
                            "power": 283.4,
                            "airflow": 1600.53,
                            "percentCapacity": 86.18916514306684,
                            "timeInterval": 22,
                            "percentPower": 97.69045156842466,
                            "percentSystemCapacity": 8.771003927590701,
                            "percentSystemPower": 9.496682527980699,
                            "order": 7
                        },
                        {
                            "power": 282.6,
                            "airflow": 1585.89,
                            "percentCapacity": 85.40083500952385,
                            "timeInterval": 23,
                            "percentPower": 97.41468459152016,
                            "percentSystemCapacity": 8.690779845061693,
                            "percentSystemPower": 9.469874673279271,
                            "order": 7
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 1857,
                    "avgPower": 244.9708333333333,
                    "avgAirflow": 1068.0595833333332,
                    "avgPrecentPower": 84.4435826726416,
                    "avgPercentCapacity": 57.51535516263985
                },
                {
                    "compressorId": "ofeeuny8i",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 378,
                            "airflow": 1091.53,
                            "percentCapacity": 35.26745761316419,
                            "timeInterval": 0,
                            "percentPower": 75.99517490952957,
                            "percentSystemCapacity": 5.981629839584786,
                            "percentSystemPower": 12.666711346424503,
                            "order": 8
                        },
                        {
                            "power": 372.2,
                            "airflow": 1048.05,
                            "percentCapacity": 33.862558651153975,
                            "timeInterval": 1,
                            "percentPower": 74.82911137917169,
                            "percentSystemCapacity": 5.743348258730904,
                            "percentSystemPower": 12.472354399839153,
                            "order": 8
                        },
                        {
                            "power": 380.9,
                            "airflow": 1114.01,
                            "percentCapacity": 35.99395232063216,
                            "timeInterval": 2,
                            "percentPower": 76.57820667470848,
                            "percentSystemCapacity": 6.104848883842423,
                            "percentSystemPower": 12.763889819717178,
                            "order": 8
                        },
                        {
                            "power": 393.9,
                            "airflow": 1221.51,
                            "percentCapacity": 39.46735471452128,
                            "timeInterval": 3,
                            "percentPower": 79.19179734620025,
                            "percentSystemCapacity": 6.6939644257695825,
                            "percentSystemPower": 13.199517458615375,
                            "order": 8
                        },
                        {
                            "power": 390.2,
                            "airflow": 1189.74,
                            "percentCapacity": 38.44070518099008,
                            "timeInterval": 4,
                            "percentPower": 78.44792923200643,
                            "percentSystemCapacity": 6.5198368333606025,
                            "percentSystemPower": 13.075531130621274,
                            "order": 8
                        },
                        {
                            "power": 391.1,
                            "airflow": 1197.38,
                            "percentCapacity": 38.68751424364771,
                            "timeInterval": 5,
                            "percentPower": 78.62887012464817,
                            "percentSystemCapacity": 6.561697533104432,
                            "percentSystemPower": 13.10568996716038,
                            "order": 8
                        },
                        {
                            "power": 384.2,
                            "airflow": 1140.23,
                            "percentCapacity": 36.84118596979311,
                            "timeInterval": 6,
                            "percentPower": 77.24165661439486,
                            "percentSystemCapacity": 6.248546173635997,
                            "percentSystemPower": 12.874472220360566,
                            "order": 8
                        },
                        {
                            "power": 384.9,
                            "airflow": 1145.89,
                            "percentCapacity": 37.02379802292746,
                            "timeInterval": 7,
                            "percentPower": 77.38238841978287,
                            "percentSystemCapacity": 6.279518570854916,
                            "percentSystemPower": 12.897929093224313,
                            "order": 8
                        },
                        {
                            "power": 388.6,
                            "airflow": 1176.3,
                            "percentCapacity": 38.0064532332856,
                            "timeInterval": 8,
                            "percentPower": 78.12625653397669,
                            "percentSystemCapacity": 6.446184390454785,
                            "percentSystemPower": 13.021915421218418,
                            "order": 8
                        },
                        {
                            "power": 371.4,
                            "airflow": 1042.2,
                            "percentCapacity": 33.673611768739555,
                            "timeInterval": 9,
                            "percentPower": 74.66827503015682,
                            "percentSystemCapacity": 5.711301426142531,
                            "percentSystemPower": 12.445546545137725,
                            "order": 8
                        },
                        {
                            "power": 368.2,
                            "airflow": 1019.15,
                            "percentCapacity": 32.92906614086988,
                            "timeInterval": 10,
                            "percentPower": 74.0249296340973,
                            "percentSystemCapacity": 5.585020808088134,
                            "percentSystemPower": 12.338315126332015,
                            "order": 8
                        },
                        {
                            "power": 345.9,
                            "airflow": 872.51,
                            "percentCapacity": 28.190810667212208,
                            "timeInterval": 11,
                            "percentPower": 69.5416164053076,
                            "percentSystemCapacity": 4.781376535237932,
                            "percentSystemPower": 11.591046176529723,
                            "order": 8
                        },
                        {
                            "power": 355.6,
                            "airflow": 933.48,
                            "percentCapacity": 30.16096057838913,
                            "timeInterval": 12,
                            "percentPower": 71.491757137113,
                            "percentSystemCapacity": 5.1155289889365605,
                            "percentSystemPower": 11.916091414784534,
                            "order": 8
                        },
                        {
                            "power": 356.5,
                            "airflow": 939.35,
                            "percentCapacity": 30.350533154327806,
                            "timeInterval": 13,
                            "percentPower": 71.67269802975473,
                            "percentSystemCapacity": 5.147681943919583,
                            "percentSystemPower": 11.946250251323638,
                            "order": 8
                        },
                        {
                            "power": 356,
                            "airflow": 936.08,
                            "percentCapacity": 30.245067554337446,
                            "timeInterval": 14,
                            "percentPower": 71.57217531162044,
                            "percentSystemCapacity": 5.129794173645024,
                            "percentSystemPower": 11.929495342135246,
                            "order": 8
                        },
                        {
                            "power": 353.5,
                            "airflow": 919.93,
                            "percentCapacity": 29.7232268653284,
                            "timeInterval": 15,
                            "percentPower": 71.06956172094894,
                            "percentSystemCapacity": 5.041286012066605,
                            "percentSystemPower": 11.845720796193286,
                            "order": 8
                        },
                        {
                            "power": 357.1,
                            "airflow": 943.28,
                            "percentCapacity": 30.477581442691594,
                            "timeInterval": 16,
                            "percentPower": 71.79332529151588,
                            "percentSystemCapacity": 5.169230302780057,
                            "percentSystemPower": 11.96635614234971,
                            "order": 8
                        },
                        {
                            "power": 362.4,
                            "airflow": 978.75,
                            "percentCapacity": 31.623621992262162,
                            "timeInterval": 17,
                            "percentPower": 72.85886610373944,
                            "percentSystemCapacity": 5.36360752225183,
                            "percentSystemPower": 12.143958179746665,
                            "order": 8
                        },
                        {
                            "power": 357.9,
                            "airflow": 948.55,
                            "percentCapacity": 30.647816046472798,
                            "timeInterval": 18,
                            "percentPower": 71.95416164053076,
                            "percentSystemCapacity": 5.198103390170612,
                            "percentSystemPower": 11.993163997051136,
                            "order": 8
                        },
                        {
                            "power": 367.1,
                            "airflow": 1011.36,
                            "percentCapacity": 32.67719614713831,
                            "timeInterval": 19,
                            "percentPower": 73.80377965420186,
                            "percentSystemCapacity": 5.542301735828204,
                            "percentSystemPower": 12.301454326117554,
                            "order": 8
                        },
                        {
                            "power": 381.8,
                            "airflow": 1121.1,
                            "percentCapacity": 36.222812364789725,
                            "timeInterval": 20,
                            "percentPower": 76.75914756735023,
                            "percentSystemCapacity": 6.143665293129341,
                            "percentSystemPower": 12.794048656256285,
                            "order": 8
                        },
                        {
                            "power": 383,
                            "airflow": 1130.62,
                            "percentCapacity": 36.530516500998324,
                            "timeInterval": 21,
                            "percentPower": 77.00040209087254,
                            "percentSystemCapacity": 6.195854261869235,
                            "percentSystemPower": 12.834260438308426,
                            "order": 8
                        },
                        {
                            "power": 387.9,
                            "airflow": 1170.48,
                            "percentCapacity": 37.81826121140575,
                            "timeInterval": 22,
                            "percentPower": 77.98552472858866,
                            "percentSystemCapacity": 6.414265587971328,
                            "percentSystemPower": 12.99845854835467,
                            "order": 8
                        },
                        {
                            "power": 392.3,
                            "airflow": 1207.65,
                            "percentCapacity": 39.01948831567488,
                            "timeInterval": 23,
                            "percentPower": 78.87012464817049,
                            "percentSystemCapacity": 6.618002868095887,
                            "percentSystemPower": 13.145901749212522,
                            "order": 8
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 2315,
                    "avgPower": 373.35833333333335,
                    "avgAirflow": 1062.46375,
                    "avgPrecentPower": 75.06198900951617,
                    "avgPercentCapacity": 34.32839794586473
                },
                {
                    "compressorId": "ofeeuny8i",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 431.00000000000006,
                            "airflow": 1605.93,
                            "percentCapacity": 51.887820311910374,
                            "timeInterval": 0,
                            "percentPower": 86.6505830317652,
                            "percentSystemCapacity": 8.800570137295189,
                            "percentSystemPower": 14.442731720394079,
                            "order": 8
                        },
                        {
                            "power": 432,
                            "airflow": 1618.31,
                            "percentCapacity": 52.28775939397501,
                            "timeInterval": 1,
                            "percentPower": 86.85162846803378,
                            "percentSystemCapacity": 8.868402856441946,
                            "percentSystemPower": 14.476241538770863,
                            "order": 8
                        },
                        {
                            "power": 427.40000000000003,
                            "airflow": 1562.39,
                            "percentCapacity": 50.481024456284196,
                            "timeInterval": 2,
                            "percentPower": 85.92681946119825,
                            "percentSystemCapacity": 8.561966828814093,
                            "percentSystemPower": 14.322096374237653,
                            "order": 8
                        },
                        {
                            "power": 442.6000000000001,
                            "airflow": 1757.68,
                            "percentCapacity": 56.790791835748955,
                            "timeInterval": 3,
                            "percentPower": 88.98271009248091,
                            "percentSystemCapacity": 9.632151508748521,
                            "percentSystemPower": 14.831445613564778,
                            "order": 8
                        },
                        {
                            "power": 432.2,
                            "airflow": 1620.8,
                            "percentCapacity": 52.36823638019672,
                            "timeInterval": 4,
                            "percentPower": 86.8918375552875,
                            "percentSystemCapacity": 8.88205236720237,
                            "percentSystemPower": 14.482943502446217,
                            "order": 8
                        },
                        {
                            "power": 438.9,
                            "airflow": 1707.27,
                            "percentCapacity": 55.1621213364351,
                            "timeInterval": 5,
                            "percentPower": 88.2388419782871,
                            "percentSystemCapacity": 9.355916568186466,
                            "percentSystemPower": 14.707459285570673,
                            "order": 8
                        },
                        {
                            "power": 429.49999999999994,
                            "airflow": 1587.59,
                            "percentCapacity": 51.29545640542696,
                            "timeInterval": 6,
                            "percentPower": 86.34901487736228,
                            "percentSystemCapacity": 8.700100700065565,
                            "percentSystemPower": 14.392466992828897,
                            "order": 8
                        },
                        {
                            "power": 412.9,
                            "airflow": 1401.8,
                            "percentCapacity": 45.29239173132229,
                            "timeInterval": 7,
                            "percentPower": 83.01166063530357,
                            "percentSystemCapacity": 7.681935138559978,
                            "percentSystemPower": 13.836204007774278,
                            "order": 8
                        },
                        {
                            "power": 415.6,
                            "airflow": 1430.04,
                            "percentCapacity": 46.204722639340325,
                            "timeInterval": 8,
                            "percentPower": 83.5544833132288,
                            "percentSystemCapacity": 7.836673420032787,
                            "percentSystemPower": 13.926680517391599,
                            "order": 8
                        },
                        {
                            "power": 410,
                            "airflow": 1372.25,
                            "percentCapacity": 44.33771177345247,
                            "timeInterval": 9,
                            "percentPower": 82.42862887012465,
                            "percentSystemCapacity": 7.520014135183876,
                            "percentSystemPower": 13.739025534481602,
                            "order": 8
                        },
                        {
                            "power": 410.4,
                            "airflow": 1376.28,
                            "percentCapacity": 44.46787611966578,
                            "timeInterval": 10,
                            "percentPower": 82.50904704463208,
                            "percentSystemCapacity": 7.542091001225646,
                            "percentSystemPower": 13.752429461832316,
                            "order": 8
                        },
                        {
                            "power": 391.4,
                            "airflow": 1199.94,
                            "percentCapacity": 38.77019586457613,
                            "timeInterval": 11,
                            "percentPower": 78.68918375552875,
                            "percentSystemCapacity": 6.575720966728579,
                            "percentSystemPower": 13.115742912673415,
                            "order": 8
                        },
                        {
                            "power": 381.6,
                            "airflow": 1119.52,
                            "percentCapacity": 36.17181336715891,
                            "timeInterval": 12,
                            "percentPower": 76.71893848009651,
                            "percentSystemCapacity": 6.135015474098906,
                            "percentSystemPower": 12.787346692580929,
                            "order": 8
                        },
                        {
                            "power": 395.2,
                            "airflow": 1232.92,
                            "percentCapacity": 39.835733821609985,
                            "timeInterval": 13,
                            "percentPower": 79.45315641334942,
                            "percentSystemCapacity": 6.756444332413575,
                            "percentSystemPower": 13.243080222505194,
                            "order": 8
                        },
                        {
                            "power": 397.9,
                            "airflow": 1257,
                            "percentCapacity": 40.61401845296988,
                            "timeInterval": 14,
                            "percentPower": 79.99597909127462,
                            "percentSystemCapacity": 6.888447342828901,
                            "percentSystemPower": 13.333556732122512,
                            "order": 8
                        },
                        {
                            "power": 406.1,
                            "airflow": 1333.74,
                            "percentCapacity": 43.09322432329337,
                            "timeInterval": 15,
                            "percentPower": 81.64455166867714,
                            "percentSystemCapacity": 7.308939570396371,
                            "percentSystemPower": 13.608337242812146,
                            "order": 8
                        },
                        {
                            "power": 399,
                            "airflow": 1266.98,
                            "percentCapacity": 40.93632314189368,
                            "timeInterval": 16,
                            "percentPower": 80.21712907117009,
                            "percentSystemCapacity": 6.943112676685716,
                            "percentSystemPower": 13.370417532336976,
                            "order": 8
                        },
                        {
                            "power": 396.4,
                            "airflow": 1243.55,
                            "percentCapacity": 40.17941459130814,
                            "timeInterval": 17,
                            "percentPower": 79.69441093687173,
                            "percentSystemCapacity": 6.814735212631449,
                            "percentSystemPower": 13.283292004557335,
                            "order": 8
                        },
                        {
                            "power": 400.5,
                            "airflow": 1280.74,
                            "percentCapacity": 41.3808257152398,
                            "timeInterval": 18,
                            "percentPower": 80.51869722557299,
                            "percentSystemCapacity": 7.018503703894519,
                            "percentSystemPower": 13.420682259902152,
                            "order": 8
                        },
                        {
                            "power": 400.2,
                            "airflow": 1277.97,
                            "percentCapacity": 41.29145908962717,
                            "timeInterval": 19,
                            "percentPower": 80.4583835946924,
                            "percentSystemCapacity": 7.003346442481154,
                            "percentSystemPower": 13.410629314389116,
                            "order": 8
                        },
                        {
                            "power": 396.6,
                            "airflow": 1245.34,
                            "percentCapacity": 40.237038533754976,
                            "timeInterval": 20,
                            "percentPower": 79.73462002412546,
                            "percentSystemCapacity": 6.824508672839307,
                            "percentSystemPower": 13.289993968232693,
                            "order": 8
                        },
                        {
                            "power": 397,
                            "airflow": 1248.91,
                            "percentCapacity": 40.352583558532814,
                            "timeInterval": 21,
                            "percentPower": 79.81503819863289,
                            "percentSystemCapacity": 6.8441059904460255,
                            "percentSystemPower": 13.303397895583407,
                            "order": 8
                        },
                        {
                            "power": 401.7,
                            "airflow": 1291.87,
                            "percentCapacity": 41.74065213268654,
                            "timeInterval": 22,
                            "percentPower": 80.7599517490953,
                            "percentSystemCapacity": 7.079533009133321,
                            "percentSystemPower": 13.460894041954294,
                            "order": 8
                        },
                        {
                            "power": 404.6,
                            "airflow": 1319.28,
                            "percentCapacity": 42.62614453697977,
                            "timeInterval": 23,
                            "percentPower": 81.34298351427424,
                            "percentSystemCapacity": 7.229719275644037,
                            "percentSystemPower": 13.55807251524697,
                            "order": 8
                        }
                    ],
                    "fullLoadPressure": 100,
                    "fullLoadCapacity": 2315,
                    "avgPower": 410.4458333333334,
                    "avgAirflow": 1389.9208333333336,
                    "avgPrecentPower": 82.51826162712774,
                    "avgPercentCapacity": 44.90855581305791
                },
                {
                    "compressorId": "ehg2shiz2",
                    "dayTypeId": "hopx028cf",
                    "profileSummaryData": [
                        {
                            "power": 357.8,
                            "airflow": 1333.35,
                            "percentCapacity": 57.59628638507497,
                            "timeInterval": 0,
                            "percentPower": 86.32086851628469,
                            "percentSystemCapacity": 7.3068502291455815,
                            "percentSystemPower": 11.989813015213459,
                            "order": 2
                        },
                        {
                            "power": 358,
                            "airflow": 1335.52,
                            "percentCapacity": 57.689974683197406,
                            "timeInterval": 1,
                            "percentPower": 86.36911942098915,
                            "percentSystemCapacity": 7.3187358281237405,
                            "percentSystemPower": 11.996514978888815,
                            "order": 2
                        },
                        {
                            "power": 357.8,
                            "airflow": 1333.35,
                            "percentCapacity": 57.59628638507497,
                            "timeInterval": 2,
                            "percentPower": 86.32086851628469,
                            "percentSystemCapacity": 7.3068502291455815,
                            "percentSystemPower": 11.989813015213459,
                            "order": 2
                        },
                        {
                            "power": 362.5,
                            "airflow": 1385.49,
                            "percentCapacity": 59.848256022848915,
                            "timeInterval": 3,
                            "percentPower": 87.45476477683957,
                            "percentSystemCapacity": 7.5925423439771595,
                            "percentSystemPower": 12.147309161584346,
                            "order": 2
                        },
                        {
                            "power": 365.6,
                            "airflow": 1421.26,
                            "percentCapacity": 61.393463712517615,
                            "timeInterval": 4,
                            "percentPower": 88.20265379975875,
                            "percentSystemCapacity": 7.7885723637921025,
                            "percentSystemPower": 12.251189598552378,
                            "order": 2
                        },
                        {
                            "power": 368.7,
                            "airflow": 1458.2,
                            "percentCapacity": 62.98909013933552,
                            "timeInterval": 5,
                            "percentPower": 88.95054282267793,
                            "percentSystemCapacity": 7.990998666843583,
                            "percentSystemPower": 12.355070035520408,
                            "order": 2
                        },
                        {
                            "power": 374.8,
                            "airflow": 1534.52,
                            "percentCapacity": 66.28616646619987,
                            "timeInterval": 6,
                            "percentPower": 90.42219541616406,
                            "percentSystemCapacity": 8.409276379288288,
                            "percentSystemPower": 12.559479927618794,
                            "order": 2
                        },
                        {
                            "power": 382.5,
                            "airflow": 1638.43,
                            "percentCapacity": 70.7745401997534,
                            "timeInterval": 7,
                            "percentPower": 92.2798552472859,
                            "percentSystemCapacity": 8.978685914205894,
                            "percentSystemPower": 12.817505529120032,
                            "order": 2
                        },
                        {
                            "power": 389.5,
                            "airflow": 1741.09,
                            "percentCapacity": 75.20894124717437,
                            "timeInterval": 8,
                            "percentPower": 93.9686369119421,
                            "percentSystemCapacity": 9.54124830048272,
                            "percentSystemPower": 13.052074257757523,
                            "order": 2
                        },
                        {
                            "power": 385.2,
                            "airflow": 1677.05,
                            "percentCapacity": 72.44271322711108,
                            "timeInterval": 9,
                            "percentPower": 92.93124246079614,
                            "percentSystemCapacity": 9.190315712448607,
                            "percentSystemPower": 12.90798203873735,
                            "order": 2
                        },
                        {
                            "power": 389.1,
                            "airflow": 1734.99,
                            "percentCapacity": 74.94573497374483,
                            "timeInterval": 10,
                            "percentPower": 93.87213510253318,
                            "percentSystemCapacity": 9.507857105667432,
                            "percentSystemPower": 13.03867033040681,
                            "order": 2
                        },
                        {
                            "power": 377.9,
                            "airflow": 1575.29,
                            "percentCapacity": 68.04715126071122,
                            "timeInterval": 11,
                            "percentPower": 91.17008443908323,
                            "percentSystemCapacity": 8.632680576969886,
                            "percentSystemPower": 12.663360364586824,
                            "order": 2
                        },
                        {
                            "power": 384.3,
                            "airflow": 1664.04,
                            "percentCapacity": 71.88092797777905,
                            "timeInterval": 12,
                            "percentPower": 92.71411338962606,
                            "percentSystemCapacity": 9.119045827956954,
                            "percentSystemPower": 12.877823202198247,
                            "order": 2
                        },
                        {
                            "power": 376.5,
                            "airflow": 1556.71,
                            "percentCapacity": 67.24443503728725,
                            "timeInterval": 13,
                            "percentPower": 90.83232810615199,
                            "percentSystemCapacity": 8.530845413816309,
                            "percentSystemPower": 12.616446618859326,
                            "order": 2
                        },
                        {
                            "power": 372.5,
                            "airflow": 1505.16,
                            "percentCapacity": 65.01758933162742,
                            "timeInterval": 14,
                            "percentPower": 89.86731001206273,
                            "percentSystemCapacity": 8.248340601858697,
                            "percentSystemPower": 12.48240734535219,
                            "order": 2
                        },
                        {
                            "power": 374.2,
                            "airflow": 1526.79,
                            "percentCapacity": 65.95217807764308,
                            "timeInterval": 15,
                            "percentPower": 90.27744270205066,
                            "percentSystemCapacity": 8.366905537579118,
                            "percentSystemPower": 12.53937403659272,
                            "order": 2
                        },
                        {
                            "power": 378.8,
                            "airflow": 1587.39,
                            "percentCapacity": 68.56978952613231,
                            "timeInterval": 16,
                            "percentPower": 91.38721351025332,
                            "percentSystemCapacity": 8.698984149112029,
                            "percentSystemPower": 12.69351920112593,
                            "order": 2
                        },
                        {
                            "power": 374.8,
                            "airflow": 1534.52,
                            "percentCapacity": 66.28616646619987,
                            "timeInterval": 17,
                            "percentPower": 90.42219541616406,
                            "percentSystemCapacity": 8.409276379288288,
                            "percentSystemPower": 12.559479927618794,
                            "order": 2
                        },
                        {
                            "power": 375,
                            "airflow": 1537.11,
                            "percentCapacity": 66.39798169564584,
                            "timeInterval": 18,
                            "percentPower": 90.47044632086852,
                            "percentSystemCapacity": 8.423461619104565,
                            "percentSystemPower": 12.566181891294152,
                            "order": 2
                        },
                        {
                            "power": 374.3,
                            "airflow": 1528.08,
                            "percentCapacity": 66.00769158162674,
                            "timeInterval": 19,
                            "percentPower": 90.3015681544029,
                            "percentSystemCapacity": 8.373948159330661,
                            "percentSystemPower": 12.542725018430401,
                            "order": 2
                        },
                        {
                            "power": 367.9,
                            "airflow": 1448.55,
                            "percentCapacity": 62.57234820605122,
                            "timeInterval": 20,
                            "percentPower": 88.75753920386006,
                            "percentSystemCapacity": 7.938129444158734,
                            "percentSystemPower": 12.32826218081898,
                            "order": 2
                        },
                        {
                            "power": 369.3,
                            "airflow": 1465.49,
                            "percentCapacity": 63.30395964169453,
                            "timeInterval": 21,
                            "percentPower": 89.09529553679133,
                            "percentSystemCapacity": 8.030944025127292,
                            "percentSystemPower": 12.37517592654648,
                            "order": 2
                        },
                        {
                            "power": 358.3,
                            "airflow": 1338.78,
                            "percentCapacity": 57.83085598844471,
                            "timeInterval": 22,
                            "percentPower": 86.44149577804583,
                            "percentSystemCapacity": 7.336608483847518,
                            "percentSystemPower": 12.006567924401851,
                            "order": 2
                        },
                        {
                            "power": 352.9,
                            "airflow": 1281.52,
                            "percentCapacity": 55.35743643729565,
                            "timeInterval": 23,
                            "percentPower": 85.13872135102532,
                            "percentSystemCapacity": 7.022822520404397,
                            "percentSystemPower": 11.825614905167214,
                            "order": 2
                        }
                    ],
                    "fullLoadPressure": 125,
                    "fullLoadCapacity": 2315,
                    "avgPower": 372.00833333333327,
                    "avgAirflow": 1505.945,
                    "avgPrecentPower": 89.74869320466426,
                    "avgPercentCapacity": 65.05166519459048
                },
                {
                    "compressorId": "ehg2shiz2",
                    "dayTypeId": "mufcn7yvy",
                    "profileSummaryData": [
                        {
                            "power": 404,
                            "airflow": 1982.9,
                            "percentCapacity": 85.65422576716557,
                            "timeInterval": 0,
                            "percentPower": 97.46682750301568,
                            "percentSystemCapacity": 10.86637070643294,
                            "percentSystemPower": 13.537966624220898,
                            "order": 2
                        },
                        {
                            "power": 402.9,
                            "airflow": 1963.01,
                            "percentCapacity": 84.79534365565496,
                            "timeInterval": 1,
                            "percentPower": 97.20144752714113,
                            "percentSystemCapacity": 10.757410157981214,
                            "percentSystemPower": 13.501105824006435,
                            "order": 2
                        },
                        {
                            "power": 399.7,
                            "airflow": 1906.69,
                            "percentCapacity": 82.36229214971988,
                            "timeInterval": 2,
                            "percentPower": 96.42943305186972,
                            "percentSystemCapacity": 10.448745414653745,
                            "percentSystemPower": 13.393874405200723,
                            "order": 2
                        },
                        {
                            "power": 397.6,
                            "airflow": 1870.91,
                            "percentCapacity": 80.81678653395308,
                            "timeInterval": 3,
                            "percentPower": 95.92279855247287,
                            "percentSystemCapacity": 10.252677598975305,
                            "percentSystemPower": 13.323503786609479,
                            "order": 2
                        },
                        {
                            "power": 395.1,
                            "airflow": 1829.49,
                            "percentCapacity": 79.02758560816983,
                            "timeInterval": 4,
                            "percentPower": 95.31966224366707,
                            "percentSystemCapacity": 10.025693812084237,
                            "percentSystemPower": 13.239729240667517,
                            "order": 2
                        },
                        {
                            "power": 397,
                            "airflow": 1860.85,
                            "percentCapacity": 80.38242744388846,
                            "timeInterval": 5,
                            "percentPower": 95.77804583835947,
                            "percentSystemCapacity": 10.197573407091285,
                            "percentSystemPower": 13.303397895583407,
                            "order": 2
                        },
                        {
                            "power": 397.7,
                            "airflow": 1872.59,
                            "percentCapacity": 80.88948804133284,
                            "timeInterval": 6,
                            "percentPower": 95.94692400482508,
                            "percentSystemCapacity": 10.26190074614673,
                            "percentSystemPower": 13.326854768447156,
                            "order": 2
                        },
                        {
                            "power": 410.5,
                            "airflow": 2106.16,
                            "percentCapacity": 90.97887933375776,
                            "timeInterval": 7,
                            "percentPower": 99.03498190591074,
                            "percentSystemCapacity": 11.54187339202374,
                            "percentSystemPower": 13.755780443669996,
                            "order": 2
                        },
                        {
                            "power": 414,
                            "airflow": 2176.88,
                            "percentCapacity": 94.03367646833391,
                            "timeInterval": 8,
                            "percentPower": 99.87937273823884,
                            "percentSystemCapacity": 11.929414786507728,
                            "percentSystemPower": 13.873064807988742,
                            "order": 2
                        },
                        {
                            "power": 414.8,
                            "airflow": 2193.5,
                            "percentCapacity": 94.75145618501735,
                            "timeInterval": 9,
                            "percentPower": 100.0723763570567,
                            "percentSystemCapacity": 12.020474631100129,
                            "percentSystemPower": 13.899872662690168,
                            "order": 2
                        },
                        {
                            "power": 413.8,
                            "airflow": 2172.75,
                            "percentCapacity": 93.8553877652451,
                            "timeInterval": 10,
                            "percentPower": 99.83112183353438,
                            "percentSystemCapacity": 11.906796507921,
                            "percentSystemPower": 13.866362844313384,
                            "order": 2
                        },
                        {
                            "power": 416.6,
                            "airflow": 2231.52,
                            "percentCapacity": 96.39392552968076,
                            "timeInterval": 11,
                            "percentPower": 100.50663449939688,
                            "percentSystemCapacity": 12.228843577444705,
                            "percentSystemPower": 13.960190335768383,
                            "order": 2
                        },
                        {
                            "power": 419.29999999999995,
                            "airflow": 2290.25,
                            "percentCapacity": 98.93098509386569,
                            "timeInterval": 12,
                            "percentPower": 101.15802171290711,
                            "percentSystemCapacity": 12.55070311772792,
                            "percentSystemPower": 14.050666845385699,
                            "order": 2
                        },
                        {
                            "power": 418.5,
                            "airflow": 2272.63,
                            "percentCapacity": 98.1699045661653,
                            "timeInterval": 13,
                            "percentPower": 100.96501809408926,
                            "percentSystemCapacity": 12.454149992912795,
                            "percentSystemPower": 14.023858990684271,
                            "order": 2
                        },
                        {
                            "power": 420.9,
                            "airflow": 2326.05,
                            "percentCapacity": 100.47733719082288,
                            "timeInterval": 14,
                            "percentPower": 101.54402895054282,
                            "percentSystemCapacity": 12.746878320734053,
                            "percentSystemPower": 14.104282554788552,
                            "order": 2
                        },
                        {
                            "power": 415.8999999999999,
                            "airflow": 2216.63,
                            "percentCapacity": 95.75062259218382,
                            "timeInterval": 15,
                            "percentPower": 100.33775633293122,
                            "percentSystemCapacity": 12.14723209671775,
                            "percentSystemPower": 13.93673346290463,
                            "order": 2
                        },
                        {
                            "power": 413.2,
                            "airflow": 2160.43,
                            "percentCapacity": 93.32327290856864,
                            "timeInterval": 16,
                            "percentPower": 99.68636911942099,
                            "percentSystemCapacity": 11.839290704917603,
                            "percentSystemPower": 13.846256953287314,
                            "order": 2
                        },
                        {
                            "power": 412.3,
                            "airflow": 2142.13,
                            "percentCapacity": 92.53276837747731,
                            "timeInterval": 17,
                            "percentPower": 99.46924004825091,
                            "percentSystemCapacity": 11.739004756349187,
                            "percentSystemPower": 13.816098116748208,
                            "order": 2
                        },
                        {
                            "power": 414.6,
                            "airflow": 2189.33,
                            "percentCapacity": 94.57131454368249,
                            "timeInterval": 18,
                            "percentPower": 100.02412545235224,
                            "percentSystemCapacity": 11.997621282804962,
                            "percentSystemPower": 13.893170699014812,
                            "order": 2
                        },
                        {
                            "power": 412.1,
                            "airflow": 2138.1,
                            "percentCapacity": 92.35833891278773,
                            "timeInterval": 19,
                            "percentPower": 99.42098914354645,
                            "percentSystemCapacity": 11.71687607316438,
                            "percentSystemPower": 13.809396153072854,
                            "order": 2
                        },
                        {
                            "power": 412.3,
                            "airflow": 2142.13,
                            "percentCapacity": 92.53276837747731,
                            "timeInterval": 20,
                            "percentPower": 99.46924004825091,
                            "percentSystemCapacity": 11.739004756349187,
                            "percentSystemPower": 13.816098116748208,
                            "order": 2
                        },
                        {
                            "power": 413.4,
                            "airflow": 2164.53,
                            "percentCapacity": 93.50018745837616,
                            "timeInterval": 21,
                            "percentPower": 99.73462002412545,
                            "percentSystemCapacity": 11.861734653997194,
                            "percentSystemPower": 13.85295891696267,
                            "order": 2
                        },
                        {
                            "power": 408,
                            "airflow": 2057.55,
                            "percentCapacity": 88.87903705178547,
                            "timeInterval": 22,
                            "percentPower": 98.43184559710495,
                            "percentSystemCapacity": 11.275480643077783,
                            "percentSystemPower": 13.672005897728035,
                            "order": 2
                        },
                        {
                            "power": 409.1,
                            "airflow": 2078.75,
                            "percentCapacity": 89.79475386292125,
                            "timeInterval": 23,
                            "percentPower": 98.69722557297949,
                            "percentSystemCapacity": 11.39165142441159,
                            "percentSystemPower": 13.708866697942499,
                            "order": 2
                        }
                    ],
                    "fullLoadPressure": 125,
                    "fullLoadCapacity": 2315,
                    "avgPower": 409.7208333333333,
                    "avgAirflow": 2097.74,
                    "avgPrecentPower": 98.84700442299959,
                    "avgPercentCapacity": 90.61511522575142
                }
            ]
        },
        "compressedAirDayTypes": [
            {
                "dayTypeId": "hopx028cf",
                "name": "Weekday",
                "numberOfDays": 250,
                "profileDataType": "power"
            },
            {
                "dayTypeId": "mufcn7yvy",
                "name": "Weekend",
                "numberOfDays": 104,
                "profileDataType": "power"
            }
        ],
        "endUseData": {
            "endUseDayTypeSetup": {
                "selectedDayTypeId": "hopx028cf",
                "dayTypeLeakRates": [
                    {
                        "dayTypeId": "hopx028cf",
                        "dayTypeLeakRate": 2100
                    },
                    {
                        "dayTypeId": "mufcn7yvy",
                        "dayTypeLeakRate": 2500
                    }
                ]
            },
            "dayTypeAirFlowTotals": {
                "unaccountedAirflow": 1012.3,
                "unaccountedAirflowPercent": 11.7,
                "exceededAirflowPercent": null,
                "totalDayTypeEndUseAirflow": 7670,
                "totalDayTypeEndUseAirflowPercent": 88.3,
                "totalDayTypeAverageAirflow": 8682.3
            },
            "endUses": [
                {
                    "endUseId": "x22ow6wc6",
                    "modifiedDate": new Date("2022-08-03T21:07:29.942Z"),
                    "endUseName": "Pneumatic Tools 1",
                    "requiredPressure": 95,
                    "location": "Production Line 1",
                    "endUseDescription": "Total of all hand tools found on production line 1",
                    "dayTypeEndUses": [
                        {
                            "dayTypeId": "hopx028cf",
                            "averageAirflow": 1560,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 120
                        },
                        {
                            "dayTypeId": "mufcn7yvy",
                            "averageAirflow": 1600,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 120
                        }
                    ]
                },
                {
                    "endUseId": "id97ec422",
                    "modifiedDate": new Date("2022-08-03T21:08:05.433Z"),
                    "endUseName": "Pneumatic Tools 2",
                    "requiredPressure": 95,
                    "location": "Production Line 2",
                    "endUseDescription": "Total of all hand tools found on production line 2",
                    "dayTypeEndUses": [
                        {
                            "dayTypeId": "hopx028cf",
                            "averageAirflow": 1250,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 117
                        },
                        {
                            "dayTypeId": "mufcn7yvy",
                            "averageAirflow": 1460,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 117
                        }
                    ]
                },
                {
                    "endUseId": "xtgn5b89p",
                    "modifiedDate": new Date("2022-08-03T21:08:41.224Z"),
                    "endUseName": "Aerator",
                    "requiredPressure": 50,
                    "location": "Production Tanks",
                    "endUseDescription": "Injects air into production tanks",
                    "dayTypeEndUses": [
                        {
                            "dayTypeId": "hopx028cf",
                            "averageAirflow": 550,
                            "averageCapacity": null,
                            "regulated": true,
                            "excessPressure": null,
                            "measuredPressure": 52
                        },
                        {
                            "dayTypeId": "mufcn7yvy",
                            "averageAirflow": 500,
                            "averageCapacity": null,
                            "regulated": true,
                            "excessPressure": null,
                            "measuredPressure": 52
                        }
                    ]
                },
                {
                    "endUseId": "l0xtz0r0a",
                    "modifiedDate": new Date("2022-08-03T21:09:16.018Z"),
                    "endUseName": "Pneumatic Machines",
                    "requiredPressure": 110,
                    "location": "Stamping",
                    "endUseDescription": "Production machines that require compressed air to control",
                    "dayTypeEndUses": [
                        {
                            "dayTypeId": "hopx028cf",
                            "averageAirflow": 750,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 120
                        },
                        {
                            "dayTypeId": "mufcn7yvy",
                            "averageAirflow": 870,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 120
                        }
                    ]
                },
                {
                    "endUseId": "g41gi8jyt",
                    "modifiedDate": new Date("2022-08-03T21:13:37.483Z"),
                    "endUseName": "Processing",
                    "requiredPressure": 110,
                    "location": "Finishing",
                    "endUseDescription": "Air used for final processing and packaging",
                    "dayTypeEndUses": [
                        {
                            "dayTypeId": "hopx028cf",
                            "averageAirflow": 1460,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 126
                        },
                        {
                            "dayTypeId": "mufcn7yvy",
                            "averageAirflow": 1250,
                            "averageCapacity": null,
                            "regulated": false,
                            "excessPressure": null,
                            "measuredPressure": 126
                        }
                    ]
                }
            ]
        }
    },
    "selected": false,
    "appVersion": "1.1.0"
}


export const MockCompressedAirAssessmentSettings: Settings = {
    "language": "English",
    "currency": "$",
    "unitsOfMeasure": "Imperial",
    "emissionsUnit": "Metric",
    "distanceMeasurement": "ft",
    "flowMeasurement": "gpm",
    "powerMeasurement": "hp",
    "pressureMeasurement": "psi",
    "steamPressureMeasurement": "psig",
    "steamTemperatureMeasurement": "F",
    "steamSpecificEnthalpyMeasurement": "btuLb",
    "steamSpecificEntropyMeasurement": "btulbF",
    "steamSpecificVolumeMeasurement": "ft3lb",
    "steamMassFlowMeasurement": "klb",
    "steamPowerMeasurement": "kW",
    "steamVolumeMeasurement": "gal",
    "steamVolumeFlowMeasurement": "gpm",
    "steamVacuumPressure": "psia",
    "currentMeasurement": null,
    "viscosityMeasurement": null,
    "voltageMeasurement": null,
    "energySourceType": "Electricity",
    "furnaceType": "Electrical Infrared",
    "energyResultUnit": "kWh",
    "customFurnaceName": null,
    "temperatureMeasurement": "F",
    "fanCurveType": null,
    "fanConvertedConditions": null,
    "phastRollupUnit": "MMBtu",
    "phastRollupFuelUnit": "MMBtu",
    "phastRollupElectricityUnit": "kWh",
    "phastRollupSteamUnit": "MMBtu",
    "defaultPanelTab": "results",
    "fuelCost": 3.99,
    "steamCost": 4.69,
    "electricityCost": 0.066,
    "densityMeasurement": "lbscf",
    "fanFlowRate": "ft3/min",
    "fanPressureMeasurement": "inH2o",
    "fanBarometricPressure": "inHg",
    "fanSpecificHeatGas": "btulbF",
    "fanPowerMeasurement": "hp",
    "fanTemperatureMeasurement": "F",
    "steamEnergyMeasurement": "MMBtu",
    "disableTutorial": true,
    "disableDashboardTutorial": false,
    "disablePsatTutorial": true,
    "disableFansTutorial": false,
    "disablePhastTutorial": true,
    "disableWasteWaterTutorial": false,
    "disableSteamTutorial": false,
    "disableMotorInventoryTutorial": false,
    "disableTreasureHuntTutorial": true,
    "disableDataExplorerTutorial": false,
    "compressedAirCost": 0.022,
    "otherFuelCost": 0,
    "waterCost": 0,
    "waterWasteCost": 0,
    "printPsatRollup": true,
    "printPhastRollup": true,
    "printFsatRollup": true,
    "printTreasureHuntRollup": true,
    "printReportGraphs": true,
    "printReportSankey": true,
    "printResults": true,
    "printInputData": true,
    "printExecutiveSummary": true,
    "printEnergySummary": true,
    "printLossesSummary": true,
    "printReportOpportunityPayback": true,
    "printReportOpportunitySummary": true,
    "printSsmtRollup": true,
    "printWasteWaterRollup": true,
    "printDetailedResults": true,
    "printReportDiagram": true,
    "printAll": true,
    "co2SavingsEnergyType": "electricity",
    "co2SavingsEnergySource": "Natural Gas",
    "co2SavingsFuelType": "Natural Gas",
    "totalEmissionOutputRate": 401.07,
    "totalFuelEmissionOutputRate": null,
    "electricityUse": 0,
    "eGridRegion": "",
    "eGridSubregion": "U.S. Average",
    "totalEmissionOutput": 0,
    "totalNaturalGasEmissionOutputRate": 53.06,
    "totalCoalEmissionOutputRate": 0,
    "totalOtherEmissionOutputRate": 0,
    "coalFuelType": "Mixed - Industrial Sector",
    "eafOtherFuelSource": "None",
    "otherFuelType": "",
    "userEnteredBaselineEmissions": false,
    "userEnteredModificationEmissions": false,
    "zipcode": "00000",
    "commonRollupUnit": "MMBtu",
    "pumpsRollupUnit": "MWh",
    "fansRollupUnit": "MWh",
    "steamRollupUnit": "MMBtu",
    "wasteWaterRollupUnit": "MWh",
    "compressedAirRollupUnit": "MWh",
    "modifiedDate": new Date("2022-04-27T18:52:10.262Z"),
    "disableCompressedAirTutorial": true,
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
};




export const MockCompressedAirCalculator: Calculator = {
    "airFlowConversionInputs": {
        "elevation": 0,
        "userDefinedPressure": true,
        "convertToStandard": true,
        "actualAtmosphericPressure": 0,
        "actualAmbientTemperature": 32,
        "actualRelativeHumidity": 0,
        "acfm": 0,
        "scfm": 0,
        "standardAtmosphericPressure": 14.5,
        "standardAmbientTemperature": 68,
        "standardRelativeHumidity": 0,
        "actualSaturatedVaporPressure": 0,
        "standardSaturatedVaporPressure": 0
    },
    "createdDate": new Date("2022-05-10T22:08:20.506Z"),
    "modifiedDate": new Date("2022-05-10T04:00:00.000Z"),
    "airLeakInput": {
        "compressedAirLeakSurveyInputVec": [
            {
                "name": "Bag Leak",
                "leakDescription": "Enter notes about the leak here.",
                "selected": false,
                "measurementMethod": 2,
                "estimateMethodData": {
                    "leakRateEstimate": 0
                },
                "bagMethodData": {
                    "height": 15,
                    "diameter": 10,
                    "fillTime": 12
                },
                "decibelsMethodData": {
                    "linePressure": 0,
                    "decibels": 0,
                    "decibelRatingA": 0,
                    "pressureA": 0,
                    "firstFlowA": 0,
                    "secondFlowA": 0,
                    "decibelRatingB": 0,
                    "pressureB": 0,
                    "firstFlowB": 0,
                    "secondFlowB": 0
                },
                "orificeMethodData": {
                    "compressorAirTemp": 0,
                    "atmosphericPressure": 0,
                    "dischargeCoefficient": 0,
                    "orificeDiameter": 0,
                    "supplyPressure": 0,
                    "numberOfOrifices": 0
                },
                "units": 1
            },
            {
                "name": "Estimate Leak",
                "leakDescription": "Enter notes about the leak here.",
                "selected": false,
                "measurementMethod": 0,
                "estimateMethodData": {
                    "leakRateEstimate": 0.1
                },
                "bagMethodData": {
                    "height": 0,
                    "diameter": 0,
                    "fillTime": 0
                },
                "decibelsMethodData": {
                    "linePressure": 0,
                    "decibels": 0,
                    "decibelRatingA": 0,
                    "pressureA": 0,
                    "firstFlowA": 0,
                    "secondFlowA": 0,
                    "decibelRatingB": 0,
                    "pressureB": 0,
                    "firstFlowB": 0,
                    "secondFlowB": 0
                },
                "orificeMethodData": {
                    "compressorAirTemp": 0,
                    "atmosphericPressure": 0,
                    "dischargeCoefficient": 0,
                    "orificeDiameter": 0,
                    "supplyPressure": 0,
                    "numberOfOrifices": 0
                },
                "units": 1
            },
            {
                "name": "Orifice Leak",
                "leakDescription": "Enter notes about the leak here.",
                "selected": false,
                "measurementMethod": 3,
                "bagMethodData": {
                    "height": 0,
                    "diameter": 0,
                    "fillTime": 0
                },
                "estimateMethodData": {
                    "leakRateEstimate": 0
                },
                "decibelsMethodData": {
                    "linePressure": 0,
                    "decibels": 0,
                    "decibelRatingA": 0,
                    "pressureA": 0,
                    "firstFlowA": 0,
                    "secondFlowA": 0,
                    "decibelRatingB": 0,
                    "pressureB": 0,
                    "firstFlowB": 0,
                    "secondFlowB": 0
                },
                "orificeMethodData": {
                    "compressorAirTemp": 250,
                    "atmosphericPressure": 14.7,
                    "dischargeCoefficient": 1,
                    "orificeDiameter": 0.25,
                    "supplyPressure": 120,
                    "numberOfOrifices": 4
                },
                "units": 1
            },
            {
                "name": "Decibel leak",
                "leakDescription": "Enter notes about the leak here.",
                "selected": false,
                "measurementMethod": 1,
                "estimateMethodData": {
                    "leakRateEstimate": 0
                },
                "bagMethodData": {
                    "height": 0,
                    "diameter": 0,
                    "fillTime": 0
                },
                "decibelsMethodData": {
                    "linePressure": 130,
                    "decibels": 25,
                    "decibelRatingA": 20,
                    "pressureA": 150,
                    "firstFlowA": 1.4,
                    "secondFlowA": 1.2,
                    "decibelRatingB": 30,
                    "pressureB": 125,
                    "firstFlowB": 1.85,
                    "secondFlowB": 1.65
                },
                "orificeMethodData": {
                    "compressorAirTemp": 0,
                    "atmosphericPressure": 0,
                    "dischargeCoefficient": 0,
                    "orificeDiameter": 0,
                    "supplyPressure": 0,
                    "numberOfOrifices": 0
                },
                "units": 1
            }
        ],
        "facilityCompressorData": {
            "hoursPerYear": 8760,
            "utilityType": 1,
            "utilityCost": 0.12,
            "compressorElectricityData": {
                "compressorControl": 8,
                "compressorControlAdjustment": 25,
                "compressorSpecificPowerControl": 0,
                "compressorSpecificPower": 16
            }
        }
    }
}
