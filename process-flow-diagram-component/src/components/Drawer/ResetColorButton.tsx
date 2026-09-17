import { Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SmallTooltip from '../StyledMUI/SmallTooltip';

const ResetColorButton = ({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) => (
  <SmallTooltip title="Reset to Default"
    slotProps={{
      popper: {
        disablePortal: true,
      }
    }}>
    <span>
      <Button variant="outlined" aria-label={`reset ${label} color`}
        disabled={disabled}
        size="small" sx={{ ml: 1 }} onClick={onClick}>
        <RestartAltIcon fontSize="small" />
      </Button>
    </span>
  </SmallTooltip>
);

export default ResetColorButton;
