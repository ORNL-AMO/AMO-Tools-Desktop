
export interface LogToolField {
    fieldName: string,
    alias: string,
    useField: boolean,
    isDateField: boolean,
    unit: string
}

export interface LogToolDay {
    date: Date,
    data: Array<any>,
    hourlyAverages: Array<{
        hour: number,
        averages: Array<{
            value: number,
            field: LogToolField
        }>
    }>
}

export interface GraphDataObj {
    graphType: { label: string, value: string },
    scatterPlotMode: string,
    selectedXDataField: LogToolField,
    xData: Array<number>,
    selectedYDataField: LogToolField,
    yData: Array<number>,
    graphName: string,
    graphId: string;
    useStandardDeviation: boolean;
    numberOfBins: number;
    histogramDataField: LogToolField;
    histogramData: {
        xLabels: Array<string>,
        yValues: Array<number>,
        standardDeviation: number,
        average: number
    }
}

export interface DaySummary {
    date: Date,
    averages: Array<{ value: number, field: LogToolField }>,
    dayData: Array<any>
}

export interface DayType {
    color: string,
    label: string,
    useDayType: boolean,
    dates?: Array<Date>
}

export interface DayTypeSummary {
    dayType: DayType,
    data: Array<any>,
    averages: Array<{
        field: LogToolField,
        value: number
    }>
}



export interface DayTypeGraphItem {
    xData: Array<any>,
    yData: Array<number>,
    name: string,
    color: string,
    date?: Date,
    dayType?: DayType
  }
  