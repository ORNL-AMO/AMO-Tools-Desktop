import { CSSProperties } from "react";
import EditIcon from '@mui/icons-material/Edit';

const EditDataDrawerButton = ({ onEdit, selected, transformLocation }: EditDataDrawerButtonProps) => {
    const customStyle: CSSProperties = {
      position: 'absolute',
      transform: transformLocation,
      color: '#fff',
      fontSize: 16,
      pointerEvents: 'all',
    }
  
    return (
        <>
            <div
                style={customStyle}
                className="nodrag nopan"
            >
                {selected &&
                    <button className="edit-button hover-highlight" onClick={onEdit}>
                        <EditIcon sx={{ width: 'unset', height: 'unset' }} />
                    </button>
                }
            </div>
        </>

    );
}
  
export default EditDataDrawerButton;

export interface EditDataDrawerButtonProps {
    transformLocation: string,
    selected: boolean,
    onEdit: () => void;
  }