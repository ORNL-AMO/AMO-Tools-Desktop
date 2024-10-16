import React from "react";

export const PresetColorPicker = ({ color, onChangeHandler, presetColors, label, showPresets }) => {
    return (
        <>
            <div className={'picker-wrapper'}>
                <div className={'picker'}>
                    <label htmlFor={'color'}>{label}</label>
                    <input type="color" id="color"
                        name="color"
                        className={'color-input'}
                        value={color}
                        onChange={(event) => {
                            onChangeHandler(event.target.value);
                        }} 
                        style={{marginLeft: '16px'}}
                        />
                </div>
                {showPresets && 
                    <div className="presets-wrapper">
                        <label htmlFor={'preset-color'}>Color Presets</label>
                        <div className="presets" style={{marginLeft: '16px'}}>
                            {presetColors.map((presetColor, index) => (
                                <button
                                key={presetColor + index}
                                className="preset"
                                style={{ background: presetColor }}
                                onClick={() => {
                                    onChangeHandler(presetColor)
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
