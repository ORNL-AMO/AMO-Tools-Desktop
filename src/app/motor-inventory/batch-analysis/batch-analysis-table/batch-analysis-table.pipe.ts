import { Pipe, PipeTransform } from '@angular/core';
import { BatchAnalysisResults } from './batch-analysis-table.component';
import * as _ from 'lodash';
@Pipe({
  name: 'batchAnalysisTable',
  pure: false
})
export class BatchAnalysisTablePipe implements PipeTransform {

  transform(analysisData: Array<Array<BatchAnalysisResults>>, sortBy: string, direction: string): Array<Array<BatchAnalysisResults>> {
    let sortedData: Array<Array<BatchAnalysisResults>> = _.orderBy(analysisData, sortBy, direction);
    return sortedData;
  }
}
