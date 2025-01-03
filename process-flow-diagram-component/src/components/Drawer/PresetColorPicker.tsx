import { useState } from "react";
const PresetColorPicker = (props: ColorPickerProps) => {
    const { color, recentColors, setParentColor, setRecentColors, label, showRecent } = props;
    const [selectedColor, setSelectedColor] = useState(color);
    const recentColorsLimit = 5;

    const handleSetColor = () => {
        setRecentColors((prev) => {
            if (!prev.includes(selectedColor) && selectedColor !== color) {
                const updatedColors = [...prev, selectedColor];
                return updatedColors.length > recentColorsLimit ? updatedColors.slice(1) : updatedColors;
            }
            return prev;
        });
        setParentColor(selectedColor);
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
                {showRecent && 
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


export default PresetColorPicker;

export interface ColorPickerProps { 
    color: string, 
    setParentColor: React.Dispatch<React.SetStateAction<string>>, 
    recentColors?: string[],
    setRecentColors?: React.Dispatch<React.SetStateAction<string[]>>,
    label: string, 
    showRecent: boolean 
}