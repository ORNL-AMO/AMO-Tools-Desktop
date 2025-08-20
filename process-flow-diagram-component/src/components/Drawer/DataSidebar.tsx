import {
    type Node,
    Edge,
} from '@xyflow/react';
import ManageEdge from "./ManageEdge";
import ManageComponent from "./ManageComponent";
import { selectEdges, selectNodes } from "../Diagram/store";
import { useAppSelector } from "../../hooks/state";
import { memo } from "react";
import { CustomEdgeData, ProcessFlowPart } from 'process-flow-lib';

const DataSidebar = () => {
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const nodes = useAppSelector(selectNodes);
    const edges = useAppSelector(selectEdges);
    const selectedNode: Node<ProcessFlowPart> = nodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === selectedDataId) as Node<ProcessFlowPart>;
    const selectedEdge: Edge<CustomEdgeData> = edges.find((edge: Edge<CustomEdgeData>) => edge.id === selectedDataId) as Edge<CustomEdgeData>;

    return (
            <>
                {selectedNode &&
                    <ManageComponent
                        selectedNode={selectedNode}
                    ></ManageComponent>
                }
                {selectedEdge &&
                    <ManageEdge
                        selectedEdge={selectedEdge}
                    ></ManageEdge>
                }
                {!selectedEdge && !selectedNode &&
                    <div style={{ padding: '1rem' }}>
                        <p>Select a component or connected edge to manage its data.</p>
                    </div>
                }
            </>
    );

};

export default memo(DataSidebar);

