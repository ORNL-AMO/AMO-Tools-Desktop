export interface ScenarioSummary {
    baselineGraphData: {
      name: string,
      pieChartLabels: Array<string>,
      pieChartValues: Array<number>,
      barChartLabels: Array<string>,
      barChartValues: Array<number>
    },
    modificationGraphData: {
      name: string,
      pieChartLabels: Array<string>,
      pieChartValues: Array<number>,
      barChartLabels: Array<string>,
      barChartValues: Array<number>
    },
    notes: Array<string>
  }