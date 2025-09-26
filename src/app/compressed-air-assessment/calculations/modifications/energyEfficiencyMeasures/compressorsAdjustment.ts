import * as _ from 'lodash';
import { CompressorInventoryItemClass } from '../../CompressorInventoryItemClass';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirProfileSummary } from '../../CompressedAirProfileSummary';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';

export function systemPressureChangeAdjustProfile(originalCompressors: Array<CompressorInventoryItemClass>, settings: Settings, adjustedCompressors: Array<CompressorInventoryItemClass>, atmosphericPressure: number,
    profileSummary: Array<CompressedAirProfileSummary>
): Array<CompressedAirProfileSummary> {
    //reduce airflow
    profileSummary.forEach(profile => {
        let ogCompressors: CompressorInventoryItemClass = originalCompressors.find(ogCompressor => { return ogCompressor.itemId == profile.compressorId });
        let adjustedCompressor: CompressorInventoryItemClass = adjustedCompressors.find(adjustedCompressor => { return adjustedCompressor.itemId == profile.compressorId });
        profile.profileSummaryData.forEach(summaryData => {
            summaryData.airflow = calculateReducedAirFlow(summaryData.airflow, adjustedCompressor.performancePoints.fullLoad.dischargePressure, atmosphericPressure, ogCompressors.performancePoints.fullLoad.dischargePressure, settings);
        });
    });
    //order compressors
    let orderedCompressors: Array<CompressorInventoryItemClass> = _.orderBy(adjustedCompressors, (compressor) => {
        return compressor.performancePoints.fullLoad.dischargePressure
    }, 'desc');
    //iterate hour intervals. TODO: HANDLE 1 day interval
    for (let i = 0; i < profileSummary[0].profileSummaryData.length; i++) {
        let newOrder: number = 1;
        //iterate new ordered compressors and update corresponding summary order
        orderedCompressors.forEach(compressor => {
            let dayTypeSummary = profileSummary.find(summary => { return summary.compressorId == compressor.itemId });
            let intervalData = dayTypeSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == i });
            if (intervalData.order != 0) {
                intervalData.order = newOrder;
                newOrder++;
            }
        });
    };
    return profileSummary;
}


export function calculateReducedAirFlow(c_usage: number, adjustedFullLoadDischargePressure: number, p_alt: number, originalFullLoadDischargePressure: number, settings: Settings): number {
    if (adjustedFullLoadDischargePressure == originalFullLoadDischargePressure) {
        return c_usage;
    } else {
        if (settings.unitsOfMeasure == 'Imperial') {
            let p: number = (adjustedFullLoadDischargePressure + p_alt) / (originalFullLoadDischargePressure + 14.7);
            let reduceFlow: number = (c_usage - (c_usage - (c_usage * p)) * .6);
            return reduceFlow;
        } else {
            //for metric convert values to imperial calcs and then convert back to metric
            let c_usage_imperial: number = new ConvertValue(c_usage, 'm3/min', 'ft3/min').convertedValue;
            let adjustedFullLoadDischargePressureImperial: number = new ConvertValue(adjustedFullLoadDischargePressure, 'barg', 'psig').convertedValue;
            let p_alt_imperial: number = new ConvertValue(p_alt, 'kPaa', 'psia').convertedValue;
            let ogDischargePressureImperial: number = new ConvertValue(originalFullLoadDischargePressure, 'barg', 'psig').convertedValue;
            let p: number = (adjustedFullLoadDischargePressureImperial + p_alt_imperial) / (ogDischargePressureImperial + 14.7);
            let reducedFlow: number = (c_usage_imperial - (c_usage_imperial - (c_usage_imperial * p)) * .6);
            reducedFlow = new ConvertValue(reducedFlow, 'ft3/min', 'm3/min').convertedValue;
            return reducedFlow;
        }
    }
}