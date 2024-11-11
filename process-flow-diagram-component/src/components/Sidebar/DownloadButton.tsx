import React from 'react';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { Button } from '@mui/material';

function downloadImage(dataUrl) {
  const a = document.createElement('a');
  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function DownloadButton(props: DownloadProps) {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const transform: {x: number, y: number, zoom: number} = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0);

    // * access shadowDom in place of document
    const viewPortObject = props.shadowRoot.querySelector('.react-flow__viewport');
    console.log('imgdownload props: w,h,z', imageWidth, imageHeight, transform.zoom);
    toJpeg(viewPortObject, {
      backgroundColor: '#efefef',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: String(imageWidth),
        height: String(imageHeight),
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
    }).then(downloadImage);
  
  };

  return (
    <Button variant="outlined" sx={{ width: '100%', marginBottom: '1rem' }} onClick={() => onClick}>Download Image</Button>

  );
}

export default DownloadButton;
export interface DownloadProps {
    shadowRoot;
}
