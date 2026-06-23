import * as _ from 'lodash';
import { CompressorInventoryItemClass } from '../../CompressorInventoryItemClass';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirProfileSummary } from '../../CompressedAirProfileSummary';
import { CompressedAirCalculationService } from '../../../compressed-air-calculation.service';

export function systemPressureChangeAdjustProfile(originalCompressors: Array<CompressorInventoryItemClass>, settings: Settings, adjustedCompressors: Array<CompressorInventoryItemClass>, atmosphericPressure: number,
    profileSummary: Array<CompressedAirProfileSummary>,
    _compressedAirCalculationService: CompressedAirCalculationService
): Array<CompressedAirProfileSummary> {
    //reduce airflow
    profileSummary.forEach(profile => {
        let ogCompressor: CompressorInventoryItemClass = originalCompressors.find(ogCompressor => { return ogCompressor.findItem(profile.compressorId) });
        let adjustedCompressor: CompressorInventoryItemClass = adjustedCompressors.find(adjustedCompressor => { return adjustedCompressor.findItem(profile.compressorId) });
        profile.profileSummaryData.forEach(summaryData => {
            summaryData.airflow = _compressedAirCalculationService.calculatePressureReducedAirflow(
                summaryData.airflow,
                adjustedCompressor.performancePoints.fullLoad.dischargePressure,
                atmosphericPressure,
                ogCompressor.performancePoints.fullLoad.dischargePressure,
                settings
            );
        });
    });
    //order compressors
    let orderedCompressors: Array<CompressorInventoryItemClass> = _.orderBy(adjustedCompressors, (compressor) => {
        return compressor.performancePoints.fullLoad.dischargePressure
    }, 'desc');
    //iterate hour intervals.
    for (let i = 0; i < profileSummary[0].profileSummaryData.length; i++) {
        let newOrder: number = 1;
        //iterate new ordered compressors and update corresponding summary order
        orderedCompressors.forEach(compressor => {
            let dayTypeSummary = profileSummary.find(summary => {
                return summary.compressorId == compressor.itemId;
            });
            let intervalData = dayTypeSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == i });
            if (intervalData.order != 0) {
                intervalData.order = newOrder;
                newOrder++;
            }
        });
    };
    return profileSummary;
}
