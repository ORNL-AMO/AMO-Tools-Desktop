import { useState } from 'react';
import { Box, Link, Menu, MenuItem, TextFieldProps } from '@mui/material';
import { DiagramCalculatorId, DiagramCalculatorResult, diagramCalculatorLabels } from 'process-flow-lib';
import InputField from '../StyledMUI/InputField';
import { useAppSelector } from '../../hooks/state';
import { useOpenDiagramCalculator } from './DiagramCalculatorContext';

export type CalculatorInputFieldProps = TextFieldProps & {
    warning?: boolean,
    // * host calculators that can fill this input - one opens directly, several show a selector
    calculators: DiagramCalculatorId[],
    onCalculatedValue: (value: number) => void,
};

/**
 * InputField with links to host app calculators that can fill its value.
 * Renders as a plain InputField when no host calculator bridge is available.
 */
export default function CalculatorInputField({ calculators, onCalculatedValue, ...inputFieldProps }: CalculatorInputFieldProps) {
    const openCalculator = useOpenDiagramCalculator();
    const unitsOfMeasure = useAppSelector((state) => state.diagram.settings.unitsOfMeasure);
    const [selectorAnchor, setSelectorAnchor] = useState<HTMLElement | null>(null);

    const handleOpenCalculator = async (calculatorId: DiagramCalculatorId) => {
        setSelectorAnchor(null);
        const result: DiagramCalculatorResult = await openCalculator({ calculatorId, unitsOfMeasure });
        if (typeof result === 'number' && Number.isFinite(result)) {
            onCalculatedValue(result);
        }
    };

    const hasCalculators = Boolean(openCalculator) && calculators.length > 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <InputField {...inputFieldProps} />
            {hasCalculators &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: -0.5 }}>
                    {calculators.length === 1 ?
                        <Link component="button" type="button" variant="caption" onClick={() => handleOpenCalculator(calculators[0])}>
                            {diagramCalculatorLabels[calculators[0]]}
                        </Link>
                        :
                        <>
                            <Link component="button" type="button" variant="caption" onClick={(e) => setSelectorAnchor(e.currentTarget)}>
                                Calculators
                            </Link>
                            <Menu
                                anchorEl={selectorAnchor}
                                open={Boolean(selectorAnchor)}
                                onClose={() => setSelectorAnchor(null)}
                                disablePortal
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                {calculators.map((calculatorId) => (
                                    <MenuItem key={calculatorId} onClick={() => handleOpenCalculator(calculatorId)}>
                                        {diagramCalculatorLabels[calculatorId]}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    }
                </Box>
            }
        </Box>
    );
}
