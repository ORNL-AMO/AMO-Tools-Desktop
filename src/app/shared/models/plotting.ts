//Shared objects for Plotly data visualizations


// PUMP CALCULATOR PLOTS
export interface SelectedDataPoint {
    pointColor: string;
    pointX: number;
    pointY: number;
}

export interface SimpleChart {
    name: string,
    data: Array<TraceData>,
    layout: {
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
}

export interface AxisObj {
    autorange: boolean,
    type: string,
    showgrid: boolean,
    title: {
        text: string
    },
    tickvals?: Array<number | string>,
    tickmode?: string,
    rangemode?: string,
    showticksuffix: string;
    ticksuffix?: string,
}

export interface TraceData {
    x: Array<number | string>,
    y: Array<number | string>,
    type: string,
    name: string,
    showlegend?: boolean,
    hovertemplate: string,
    xaxis?: any,
    yaxis?: any,
    mode?: string,
    marker?: {
        color?: string | Array<string>,
        colorbar?: {
            ticksuffix: string,
            showticksuffix: string
        }
        size?: number,
    },
    line?: {
        shape: string
    }
}
// End PUMP CALCULATOR PLOTS