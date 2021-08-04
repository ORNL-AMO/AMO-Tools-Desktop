export interface SSMTSankeyNode {
    name: string,
    value: number,
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