
export interface LogToolField {
    fieldName: string,
    alias: string,
    useField: boolean,
    isDateField: boolean,
    unit: string,
    invalidField: boolean
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
    xData: Array<number | Date>,
    selectedYDataField: LogToolField,
    yData: Array<number | Date>,
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

// export interface DaySummary {
//     logToolDay: LogToolDay,
//     // averages: Array<{ value: number, field: LogToolField }>,
//     dayData: Array<any>
// }

export interface DayType {
    color: string,
    label: string,
    useDayType: boolean,
    logToolDays?: Array<LogToolDay>
}

export interface DayTypeSummary {
    dayType: DayType,
    data: Array<any>,
    // averages: Array<{
    //     field: LogToolField,
    //     value: number
    // }>,
    hourlyAverages: Array<{
        hour: number,
        averages: Array<{
            value: number,
            field: LogToolField
        }>
    }>
}


export interface HourlyAverage {
    hour: number,
    averages: Array<{
        value: number,
        field: LogToolField
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

export interface GraphObj {
    name: string,
    data: [{
        x: Array<number | string>,
        y: Array<number | string>,
        name: string,
        type: string,
        mode: string,
        yaxis: string,
        marker: {
            color: string
        },
    }],
    layout: {
        title: {
            text: string
        },
        xaxis: AxisObj,
        yaxis: AxisObj,
        yaxis2: AxisObj,
        margin: {
            t: number,
            b: number,
            l: number,
            r: number
        },
        annotations: [{
            x: number | string,
            y: number | string,
            text: string,
            showarrow: boolean,
            font: {
                // family: string,
                size: number,
                color: string
            },
            // align: string,
            // arrowhead: number,
            // arrowsize: number,
            // arrowwidth: number,
            // arrowcolor: number,
            ax: number,
            ay: number,
            // bordercolor: string,
            // borderwidth: number,
            // borderpad: number,
            // bgcolor: string,
            // opacity: number
        }]
    },
    isTimeSeries: boolean,
    selectedXAxisDataOption: { dataField: LogToolField, data: Array<number | string> }
    selectedYAxisDataOptions: Array<{ index: number, dataOption: { dataField: LogToolField, data: Array<number | string> }, seriesColor: string, seriesName: string, yaxis: string }>,
    hasSecondYAxis: boolean,
    numberOfBins: number,
    useStandardDeviation: boolean,
    graphId: string
}

export interface AxisObj {
    autorange: boolean,
    type: string,
    title: {
        text: string
    },
    side: string,
    overlaying: string,
    titlefont: {
        color: string
    },
    tickfont: {
        color: string
    }
}