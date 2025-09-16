import { useState } from "react";

const ColorPicker = (props: ColorPickerProps) => {
    const { color, recentColors, setParentColor, label, showRecent } = props;
    const [selectedColor, setSelectedColor] = useState(color);
    const recentColorsLimit = 5;

    const handleSetColor = () => {
        let updatedRecentColors;
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
            <div className={'picker-wrapper'}>
                <div className={'picker'}>
                    <label>{label}</label>
                    <input type="color" id="color"
                        name="color"
                        className={'color-input'}
                        value={color}
                        onChange={(event) => setSelectedColor(event.target.value)}
                        onBlur={handleSetColor}
                        style={{marginLeft: '16px'}}
                        />
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
    showRecent: boolean 
}