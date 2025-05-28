import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { BatchAnalysisSettings, BatchAnalysisResults } from '../batch-analysis.service';
@Pipe({
    name: 'batchAnalysisTable',
    pure: false,
    standalone: false
})
export class BatchAnalysisTablePipe implements PipeTransform {

  transform(analysisData: Array<BatchAnalysisResults>, sortBy: string, direction: string, batchAnalysisSettings: BatchAnalysisSettings): Array<BatchAnalysisResults> {
    let sortedData: Array<BatchAnalysisResults> = _.orderBy(analysisData, sortBy, direction);
    if (batchAnalysisSettings.displayIncompleteMotors == false) {
      sortedData = sortedData.filter(dataItem => { return dataItem.isBatchAnalysisValid })
    }
    return sortedData;
  }
}
