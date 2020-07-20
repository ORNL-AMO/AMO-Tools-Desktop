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
    inputCount?: number
}

export interface AxisObj {
    autorange: boolean,
    type: string,
    showgrid: boolean,
    showspikes?: boolean,
    spikemode?: string,
    title: {
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
    mode?: string,
    marker?: {
        color?: string | Array<string>,
        line?: {
            color: string,
            width: number
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
    }
}

export interface TraceCoordinates {
    x: Array<number>,
    y: Array<number>,
};

export interface DataPoint {
  x: number;
  y: number;
}

// End PUMP CALCULATOR PLOTS