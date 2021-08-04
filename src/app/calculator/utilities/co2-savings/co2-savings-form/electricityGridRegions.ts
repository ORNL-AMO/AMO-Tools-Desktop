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
                outputRate: 432.2286834
            }
        ]
    },
    {
        region: 'ASCC',
        subregions: [
            {
                subregion: 'AKGD: ASCC Alaska Grid',
                outputRate: 474.0045904
            },
            {
                subregion: 'AKMS: ASCC Miscellaneous',
                outputRate: 239.0434633
            }
        ]
    },
    {
        region: 'ERCOT',
        subregions: [
            {
                subregion: 'ERCT: ERCOT All',
                outputRate: 424.6083225
            }
        ]
    },
    {
        region: 'FRCC',
        subregions: [
            {
                subregion: 'FRCC: FRCC All',
                outputRate: 424.6083225
            }
        ]
    },
    {
        region: 'HICC',
        subregions: [
            {
                subregion: 'HIMS: HICC Miscellaneous',
                outputRate: 507.6158249
            },
            {
                subregion: 'HIOA: HICC Oahu',
                outputRate: 763.2154294
            }
        ]
    },
    {
        region: 'MRO',
        subregions: [
            {
                subregion: 'MROE: MRO East',
                outputRate: 766.4359391
            },
            {
                subregion: 'MROW: MRO West',
                outputRate: 566.6282625
            }
        ]
    },
    {
        region: 'NPCC',
        subregions: [
            {
                subregion: 'NEWE: NPCC New England',
                outputRate: 239.315619
            },
            {
                subregion: 'NYCW: NPCC NYC/Westchester',
                outputRate: 302.5181949
            },
            {
                subregion: 'NYLI: NPCC Long Island',
                outputRate: 541.1817002
            },
            {
                subregion: 'NYUP: NPCC Upstate NY',
                outputRate: 115.1672397
            },
        ]
    },
    {
        region: 'RFC',
        subregions: [
            {
                subregion: 'RFCE: RFC East',
                outputRate: 326.5868948
            },
            {
                subregion: 'RFCM: RFC Michigan',
                outputRate: 599.2869519
            },
            {
                subregion: 'RFCW: RFC West',
                outputRate: 532.5180757
            }
        ]
    },
    {
        region: 'SERC',
        subregions: [
            {
                subregion: 'SRMV: SERC Mississippi Valley',
                outputRate: 389.3641535
            },
            {
                subregion: 'SRMW: SERC Midwest',
                outputRate: 760.5845905
            },
            {
                subregion: 'SRSO: SERC South',
                outputRate: 468.7882719
            },
            {
                subregion: 'SRTV: SERC Tennessee Valley',
                outputRate: 470.8747993
            },
            {
                subregion: 'SRVC: SERC Virginia/Carolina',
                outputRate: 339.0606998
            }
        ]
    },
    {
        region: 'SPP',
        subregions: [
            {
                subregion: 'SPNO: SPP North',
                outputRate: 531.4294527
            },
            {
                subregion: 'SPSO: SPP South',
                outputRate: 531.9737642
            }
        ]
    },
    {
        region: 'WECC',
        subregions: [
            {
                subregion: 'AZNM: WECC Southwest',
                outputRate: 466.0667144
            },
            {
                subregion: 'CAMX: WECC California',
                outputRate: 226.2067839
            },
            {

                subregion: 'NWPP: WECC Northwest',
                outputRate: 291.8416779
            },
            {
                subregion: 'RMPA: WECC Rockies',
                outputRate: 581.4607506
            }
        ]
    }
];
