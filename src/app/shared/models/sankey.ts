export interface SankeyNode {
    name: string,
    value: number,
    loss?: number,
    x: number,
    y: number,
    nodeColor: string,
    source: number,
    target: number[],
    isConnector: boolean,
    isConnectingPath?: boolean,
    isCircularFlow?: boolean,
    id?: string,
}