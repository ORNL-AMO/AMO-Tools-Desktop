import React from "react";

export const PresetColorPicker = ({ color, updateId, onChangeHandler, presetColors, label }) => {
    return (
        <>
            <div className={'picker-wrapper'}>
                <div className={'picker'}>
                    <label htmlFor={'color'}>{label}</label>
                    <input type="color" id="colorPicker"
                        name="color"
                        className={'color-input'}
                        value={color}
                        onChange={(event) => {
                            onChangeHandler(updateId, event.target.value)
                        }} 
                        style={{marginLeft: '16px'}}
                        />
                </div>
                <div className="presets-wrapper">
                    <label htmlFor={'preset-color'} style={{marginLeft: '4px'}}>Color Presets</label>
                    <div className="presets" style={{marginLeft: '16px'}}>
                        {presetColors.map((presetColor, index) => (
                            <button
                                key={presetColor + index}
                                className="preset"
                                style={{ background: presetColor }}
                                onClick={() => onChangeHandler(updateId, presetColor)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
