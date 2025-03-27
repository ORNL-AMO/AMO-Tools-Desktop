import React from 'react';
import { Box, Button } from '@mui/material';

const FormActionGroupButtons = (props: FormActionGroupButtonsProps) => {
    const { cancelContext, actionContext } = props;

    return (
        <Box 
            display={'flex'} 
            justifyContent={'center'} 
            alignItems={'center'} 
            gap={2}
            margin={'1rem 0'} 
        >
            <Button 
                type="button" 
                variant="outlined" 
                color="error" 
                sx={{ width: '50%' }} 
                onClick={cancelContext.handler}
            >
                {cancelContext.label}
            </Button>
            <Button 
                type="button" 
                variant="contained" 
                color="primary" 
                onClick={actionContext.handler}
                sx={{ width: '50%' }}
            >
                {actionContext.label}
            </Button>
        </Box>
    );
};

export default FormActionGroupButtons;
interface FormActionGroupButtonsProps {
    cancelContext: {
        label: string;
        handler: () => void;
    };
    actionContext: {
        label: string;
        handler: () => void;
    };
}