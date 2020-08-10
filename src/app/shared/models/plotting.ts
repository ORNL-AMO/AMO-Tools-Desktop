//Shared objects for Plotly data visualizations

export interface SelectedDataPoint {
    pointColor: string;
    pointX: number;
    pointY: number;
}

export interface SimpleChart {
    name: string,
    data: Array<TraceData>,
    layout: {
        barmode?: string,
        legend?: {
            orientation: string,
            font?: {
                size: number,
              },
        }
        title?: {
            text: string,
            font: {
                size: number
            }
        },
        hovermode: string,
        xaxis: AxisObj,
        yaxis: AxisObj,
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
    existingPoint?: boolean
}

export interface AxisObj {
    autorange: boolean,
    type: string,
    showgrid: boolean,
    showspikes?: boolean,
    spikemode?: string,
    title?: {
        text: string
    },
    tickvals?: Array<number | string>,
    tickmode?: string,
    ticksuffix?: string,
    tickangle?: number,
    showticksuffix: string,
    rangemode?: string,
    range?: Array<number>
}

export interface TraceData {
    x: Array<number | string>,
    y: Array<number | string>,
    type: string,
    name: string,
    id?: string,
    showlegend?: boolean,
    hovertemplate?: string,
    xaxis?: any,
    yaxis?: any,
    fill?: string,
    fillcolor?: string,
    mode?: string,
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
        size?: number,
    },
    line?: {
        shape: string,
        color?: string,
        width?: number
    }
}

export interface TraceCoordinates {
    x: Array<number>,
    y: Array<number>,
};

export interface DataPoint {
    pointColor?: string;
    pointOutlineColor?: string;
    pointTraceIndex?: number;
    name?: string;
    x: number;
    y: number;
}
