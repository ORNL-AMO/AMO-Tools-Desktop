export interface ScenarioSummary {
    baselineGraphData: {
      name: string,
      valuesAndLabels: Array<{value: number, label: string}>
      barChartLabels: Array<string>,
      barChartValues: Array<number>
    },
    modificationGraphData: {
      name: string,
      valuesAndLabels: Array<{value: number, label: string}>
      barChartLabels: Array<string>,
      barChartValues: Array<number>
    },
    notes: Array<string>
  }