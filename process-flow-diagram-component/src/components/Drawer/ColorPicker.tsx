import { ReactNode, useEffect, useState } from "react";

const ColorPicker = (props: ColorPickerProps) => {
    const { color, recentColors, setParentColor, label, showRecent, compact, actions } = props;
    const [selectedColor, setSelectedColor] = useState(color);
    const recentColorsLimit = 5;
    // replaces whitespace runs in label with '-' so multi-word labels produce a valid id
    const inputId = `color-${label.toLowerCase().replace(/\s+/g, '-')}`;

    useEffect(() => {
        setSelectedColor(color);
    }, [color]);

    const handleSetColor = () => {
        let updatedRecentColors: string[];
        if (showRecent && recentColors && recentColors.length > 0) {
                if (!recentColors.includes(selectedColor) && selectedColor !== color) {
                    const updatedColors = [...recentColors, selectedColor];
                    updatedRecentColors = updatedColors.length > recentColorsLimit ? updatedColors.slice(1) : updatedColors;
                }
        }
        setParentColor(selectedColor, updatedRecentColors);
    };

    const handleSetColorFromRecent = (color: string) => {
        setParentColor(color);
        setSelectedColor(color);
    }

    return (
        <>
            <div className={'picker-wrapper'} style={compact ? { width: 'auto', alignItems: 'flex-start' } : undefined}>
                <div className={'picker'} style={compact ? { width: 'auto', justifyContent: 'flex-start', gap: '.5rem', padding: '4px 0' } : undefined}>
                    <label htmlFor={inputId}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: actions ? '.5rem' : 0 }}>
                        <input type="color" id={inputId}
                            name={inputId}
                            className={'color-input'}
                            value={color}
                            onChange={(event) => setSelectedColor(event.target.value)}
                            onBlur={handleSetColor}
                            style={compact ? { width: 64, height: 32, marginLeft: 0 } : { marginLeft: '16px' }}
                            />
                        {actions}
                    </div>
                </div>
                {showRecent && recentColors && recentColors.length > 0 &&
                    <div className="recents-wrapper">
                        <label htmlFor={'recent-color'}>Recent Colors</label>
                        <div className="recents" style={{marginLeft: '16px'}}>
                            {recentColors.map((recentColor, index) => (
                                <button
                                key={recentColor + index}
                                className="recent"
                                style={{ background: recentColor }}
                                onClick={() => {
                                    handleSetColorFromRecent(recentColor)
                                }}
                                />
                            ))}
                        </div>
                    </div>
                }
            </div>
        </>
    );
};


export default ColorPicker;

export interface ColorPickerProps {
    color: string,
    setParentColor: (selectedColor: string, recentColors?: string[]) => void,
    recentColors?: string[],
    label: string,
    showRecent: boolean,
    compact?: boolean,
    actions?: ReactNode,
}