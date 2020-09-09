import { Pipe, PipeTransform } from '@angular/core';
import { BatchAnalysisResults } from './batch-analysis-table.component';
import * as _ from 'lodash';
import { BatchAnalysisSettings } from '../batch-analysis.service';
@Pipe({
  name: 'batchAnalysisTable',
  pure: false
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
