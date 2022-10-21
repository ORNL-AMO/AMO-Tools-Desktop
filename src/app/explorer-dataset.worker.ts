// angular web worker auto generate imports webWorker lib - has typings, but conflicts with dom
// declare const self: ServiceWorkerGlobalScope;

// workaround: use ctx of type any 
const ctx: Worker = self as any;
// addEventListener('message', ({ data }) => {
//   const response = `worker response to ${data}`;
//   postMessage(response);
//   ctx.postMessage(response);
// });

import * as _ from 'lodash';

/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
    let filteredData: Array<any> = _.filter(data.xData, (dataItem) => {
      if (data.isDateField) {
        return (new Date(dataItem).valueOf() > new Date(data.axisRanges.xMin).valueOf() && new Date(dataItem).valueOf() < new Date(data.axisRanges.xMax).valueOf());
      } else {
        return (dataItem > data.axisRanges.xMin && dataItem < data.axisRanges.xMax);
      }
    });
    postMessage(filteredData);
});
