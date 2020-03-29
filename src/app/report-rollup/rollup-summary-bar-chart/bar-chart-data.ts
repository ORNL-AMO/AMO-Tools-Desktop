export interface BarChartDataItem {
    x: Array<string>,
    y: Array<number>,
    hoverinfo: string,
    hovertemplate: string,
    name: string,
    type: string,
    marker: {
        color: string
    }
}