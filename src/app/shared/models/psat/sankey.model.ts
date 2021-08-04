export interface PsatSankeyNode {
    name: string,
    value: number,
    x: number,
    y: number,
    nodeColor: string,
    loss: number,
    source: number,
    target: number[],
    isConnector: boolean,
    id?: string,
}