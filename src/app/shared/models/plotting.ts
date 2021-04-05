//Shared objects for Plotly data visualizations

export interface SelectedDataPoint {
    pointColor: string;
    pointX: number;
    pointY: number;
}

export interface SimpleChart {
    name: string,
    currentEquipmentType?: string,
    data: Array<TraceData>,
    layout: {
        grid?: any,
        barmode?: string,
        height?: number,
        width?: number,
        showlegend?: boolean,
        legend?: {
            orientation: string,
            font?: {
                size: number,
              },
              x?: number,
              y?: number
        },
        title?: {
            text: string,
            font: {
                size: number
            }
        },
        hovermode: string,
        xaxis: AxisObj,
        yaxis: AxisObj,
        xaxis2?: AxisObj,
        yaxis2?: AxisObj,
        xaxis3?: AxisObj,
        yaxis3?: AxisObj,
        margin: {
            t: number,
            b: number,
            l: number,
            r: number
        },
    },
    config: {
        modeBarButtonsToRemove: Array<string>,
        displaylogo: boolean,
        displayModeBar: boolean,
        responsive: boolean
    }
    chartId?: string,
    inputCount?: number,
    removeIndex?: number,
    existingPoint?: boolean,
    selectedAxis?: number
}

export interface AxisObj {
    autorange?: boolean,
    type?: string,
    showgrid: boolean,
    showspikes?: boolean,
    spikemode?: string,
    hoverinfo?: string,
    hoverformat?: string,
    title?: {
        text: string,
        standoff?: number
    },
    tickvals?: Array<number | string>,
    ticktext?: Array<number | string>,
    tickmode?: string,
    autotick?: boolean,
    ticksuffix?: string,
    tickangle?: number,
    tick0?: number,
    dtick?: number,
    showticksuffix: string,
    rangemode?: string,
    range?: Array<number>
}

export interface TraceData {
    x: Array<number | string>,
    y: Array<number | string>,
    type: string,
    name?: string,
    id?: string,
    showlegend?: boolean,
    hovertemplate?: string,
    customdata?: Array<number | string>,
    xaxis?: any,
    yaxis?: any,
    fill?: string,
    fillcolor?: string,
    mode?: string,
    hoverinfo?: string,
    hoverlabel?: {
        namelength?: number,
        bordercolor?: string
    },
    text?: string[],
    marker?: {
        color?: string | Array<string>,
        line?: {
            color: string,
            width: number,
            shape?: string,
        }
        colorbar?: {
            ticksuffix: string,
            showticksuffix: string
        }
        size?: number | number[],
        sizeref?: number,
        sizemin?: number,
        sizemode?: string,
    },
    line?: {
        shape: string,
        color?: string,
        dash?: string,
        smoothing?: number
        width?: number
    }
}

export interface TraceCoordinates {
    x: Array<number>,
    y: Array<number>,
};

export interface ChartConfig {
    defaultPointCount: number,
    defaultPointOutlineColor?: string,
    defaultPointBackgroundColor?: string,
    yName?: string,
    xName?: string,
    yUnits?: string,
    xUnits?: string,
    powerUnits: string,
    systemColor: string
}

export interface DataPoint {
    pointColor?: string;
    pointOutlineColor?: string;
    pointTraceIndex?: number;
    name?: string;
    x: number;
    y: number;
}
