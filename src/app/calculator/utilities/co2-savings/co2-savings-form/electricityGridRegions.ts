export interface eGridRegion {
    region: string;
    subregions: Array<{
        subregion: string,
        outputRate: number
    }>;
}

export const electricityGridRegions: Array<eGridRegion> = [
    {
        region: 'US',
        subregions: [
            {
                subregion: 'U.S. Average',
                outputRate: 512.6374
            }
        ]
    },
    {
        region: 'ASCC',
        subregions: [
            {
                subregion: 'AKGD: ASCC Alaska Grid',
                outputRate: 421.7208
            },
            {
                subregion: 'AKMS: ASCC Miscellaneous',
                outputRate: 309.8554991
            }
        ]
    },
    {
        region: 'ERCOT',
        subregions: [
            {
                subregion: 'ERCT: ERCOT All',
                outputRate: 520.745842
            }
        ]
    },
    {
        region: 'FRCC',
        subregions: [
            {
                subregion: 'FRCC: FRCC All',
                outputRate: 490.2277187
            }
        ]
    },
    {
        region: 'HICC',
        subregions: [
            {
                subregion: 'HIMS: HICC Miscellaneous',
                outputRate: 429.790667
            },
            {
                subregion: 'HIOA: HICC Oahu',
                outputRate: 676.0180947
            }
        ]
    },
    {
        region: 'MRO',
        subregions: [
            {
                subregion: 'MROE: MRO East',
                outputRate: 760.4610494
            },
            {
                subregion: 'MROW: MRO West',
                outputRate: 623.9638768
            }
        ]
    },
    {
        region: 'NPCC',
        subregions: [
            {
                subregion: 'NEWE: NPCC New England',
                outputRate: 261.6137219
            },
            {
                subregion: 'NYCW: NPCC NYC/Westchester',
                outputRate: 302.5181949
            },
            {
                subregion: 'NYLI: NPCC Long Island',
                outputRate: 546.2712782
            },
            {
                subregion: 'NYUP: NPCC Upstate NY',
                outputRate: 166.7585629
            },
        ]
    },
    {
        region: 'RFC',
        subregions: [
            {
                subregion: 'RFCE: RFC East',
                outputRate: 378.5116378
            },
            {
                subregion: 'RFCM: RFC Michigan',
                outputRate: 699.7191839
            },
            {
                subregion: 'RFCW: RFC West',
                outputRate: 630.8865979
            }
        ]
    },
    {
        region: 'SERC',
        subregions: [
            {
                subregion: 'SRMV: SERC Mississippi Valley',
                outputRate: 465.8916007
            },
            {
                subregion: 'SRMW: SERC Midwest',
                outputRate: 810.0273152
            },
            {
                subregion: 'SRSO: SERC South',
                outputRate: 521.9632829
            },
            {
                subregion: 'SRTV: SERC Tennessee Valley',
                outputRate: 610.2703879
            },
            {
                subregion: 'SRVC: SERC Virginia/Carolina',
                outputRate: 391.3528273
            }
        ]
    },
    {
        region: 'SPP',
        subregions: [
            {
                subregion: 'SPNO: SPP North',
                outputRate: 719.6051107
            },
            {
                subregion: 'SPSO: SPP South',
                outputRate: 673.4938552
            }
        ]
    },
    {
        region: 'WECC',
        subregions: [
            {
                subregion: 'AZNM: WECC Southwest',
                outputRate: 399.1029002
            },
            {
                subregion: 'CAMX: WECC California',
                outputRate: 258.7692465
            },
            {

                subregion: 'NWPP: WECC Northwest',
                outputRate: 414.3213654
            },
            {
                subregion: 'RMPA: WECC Rockies',
                outputRate: 793.5229166
            }
        ]
    }
];
