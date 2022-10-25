import { CsvImportData } from "../shared/helper-services/csv-to-json.service";

export interface LogToolField {
    fieldName: string,
    alias: string,
    useField: boolean,
    isDateField: boolean,
    isTimeField?: boolean,
    unit: string,
    invalidField: boolean,
    csvId: string,
    csvName: string,
    fieldId: string
}

export interface LogToolDay {
    date: Date,
    hourlyAverages: Array<HourAverage>
}

export interface HourAverage {
    hour: number,
    averages: Array<{
        value: number,
        field: LogToolField
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


export interface DayType {
    dayTypeId: string,
    color: string,
    label: string,
    useDayType: boolean,
    logToolDays?: Array<LogToolDay>
}

export interface DayTypeSummary {
    dayType: DayType,
    data: Array<any>,
    hourlyAverages: Array<{
        hour: number,
        averages: Array<{
            value: number,
            field: LogToolField
        }>
    }>
}


export interface IndividualDataFromCsv {
    csvImportData: CsvImportData,
    csvName: string,
    fields: Array<LogToolField>;
    startDate?: string,
    endDate?: string,
    dataPointsPerColumn?: number,
    hasDateField: boolean,
    hasTimeField?: boolean,
    dateField?: LogToolField,
    timeField?: LogToolField,
    intervalForSeconds?: number;
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

export interface VisualizerGraphData {
    x: Array<number | string>,
    y: Array<number | string>,
    name: string,
    type: string,
    mode: string,
    yaxis: string,
    marker: {
        color: string
    },
    line: {
        color: string,
        width: number
    }
}

export interface GraphObj {
    name: string,
    data: VisualizerGraphData[],
    layout: GraphLayout
    mode: {
        modeBarButtonsToRemove?: string[],
        plotGlPixelRatio?: number,
        responsive?: boolean,
        displaylogo?: boolean,
        displayModeBar?: boolean
      },
    selectedXAxisDataOption: { dataField: LogToolField, data: Array<number | string> }
    selectedYAxisDataOptions: Array<{
        index: number,
        dataOption: { dataField: LogToolField, data: Array<number | string> },
        seriesColor: string,
        seriesName: string,
        yaxis: string,
        linesOrMarkers: string
    }>,
    hasSecondYAxis: boolean,
    //histogram
    numberOfBins: number,
    bins: Array<{ min: number, max: number }>,
    binnedField: LogToolField,
    useStandardDeviation: boolean,
    usePercentForBins: boolean,
    binningMethod: string,
    graphInteractivity: GraphInteractivity,
    showPerformanceWarning?: boolean,
    binSize: number,
    graphId: string,
    xAxisDataOptions: Array<{
        dataField: LogToolField,
        data: Array<number | string>
    }>;
    yAxisDataOptions: Array<{
        dataField: LogToolField,
        data: Array<number | string>
    }>
}

export interface GraphLayout {
    title: {
        text: string,
        font: {
            size: number
        }
    },
    hovermode: string | boolean,
    dragmode?: string | boolean,
    xaxis: AxisObj,
    yaxis: AxisObj,
    yaxis2: AxisObj,
    margin: {
        t: number,
        b: number,
        l: number,
        r: number
    },
    annotations: Array<AnnotationData>
}

export interface GraphInteractivity {
    isGraphInteractive?: boolean,
    showPerformanceWarning?: boolean,
}

export interface AxisObj {
    autorange: boolean,
    type: string,
    spikemode?: string,
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
    },
    rangemode?: string,
    ticksuffix?: string
}

export interface AnnotationData {
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
    arrowsize: number,
    // arrowwidth: number,
    arrowcolor: string,
    ax: number,
    ay: number,
    // bordercolor: string,
    // borderwidth: number,
    borderpad: number,
    bgcolor: string,
    // opacity: number
    annotationId: string,
    yref: string,
    seriesName: string
}


export interface LogToolDbData {
    id?: number,
    name: string,
    modifiedDate: Date,
    origin?: string,
    setupData: {
        logToolDays: Array<LogToolDay>,
        individualDataFromCsv: Array<IndividualDataFromCsv>,
        fields: Array<LogToolField>,
        dataCleaned: boolean,
        dataSubmitted: boolean,
        noDayTypeAnalysis: boolean
    }
    visualizeData: {
        graphObjects: Array<GraphObj>,
        selectedGraphObj: GraphObj,
        visualizeData: Array<{ dataField: LogToolField, data: Array<number | string> }>;
        annotateDataPoint: AnnotationData;
    },
    dayTypeData: {
        selectedDataField: LogToolField,
        dayTypes: Array<DayType>,
        dayTypeSummaries: Array<DayTypeSummary>,
        displayDayTypeCalander: boolean,
        dayTypesCalculated: boolean,
        calendarStartDate: { year: number, month: number, day: number },
        numberOfMonths: number,
        dataView: string,
        dataDisplayType: string,
        selectedGraphType: string,
        dayTypeScatterPlotData: Array<DayTypeGraphItem>,
        individualDayScatterPlotData: Array<DayTypeGraphItem>
    }
}


export interface DataExplorerStatus {
    hasFilesUploaded: boolean,
    isStepHeaderRowComplete: boolean, 
    isStepRefineComplete: boolean, 
    isStepMapTimeDataComplete: boolean, 
    showLoadingSpinner: boolean,
    showLoadingMessage: string,
    invalidFiles: Array<InvalidFile>
  }

export interface LoadingSpinner {
    show: boolean,
    msg?: string
}
  
  export interface InvalidFile {
    name: string;
    message?: string;
  }
  
  export interface ExplorerData {
    fileData: Array<ExplorerFileData>,
    datasets: Array<ExplorerDataSet>,
    isStepHeaderRowComplete: boolean,
    isStepFileUploadComplete: boolean,
    refineDataStepStatus: RefineDataStepStatus,
    isStepMapTimeDataComplete: boolean,
    isSetupDone: boolean,
    isExample?: boolean,
    isExistingImport?: boolean,
    canRunDayTypeAnalysis: boolean
  }

  export interface RefineDataStepStatus {
    isComplete: boolean,
    currentDatasetValid?: boolean,
    hasInvalidDataset?: boolean,
  }
  
  export interface ExplorerFileData {
    dataSetId: string, 
    fileType: string,
    name: string, 
    data: any,
    previewData: any,
    workSheets?: Array<any>,
    workBook?: any,
    selectedSheet?: string,
    headerRowVisited?: boolean,
    headerRowIndex?: number,
}

// OLD IndividualDataFromCSV
export interface ExplorerDataSet {
    dataSetId: string, 
    refineDataTabVisited?: boolean,
    mapTimeDataTabVisited?: boolean
    csvImportData: CsvImportData,
    csvName: string,
    fields: Array<LogToolField>;
    startDate?: string,
    endDate?: string,
    dataPointsPerColumn?: number,
    hasDateField: boolean,
    hasTimeField?: boolean,
    dateField?: LogToolField,
    timeField?: LogToolField,
    intervalForSeconds?: number;
    canRunDayTypeAnalysis: boolean

  }

  export interface StepMovement {
    direction: 'forward' | 'back';
    url: string
  }