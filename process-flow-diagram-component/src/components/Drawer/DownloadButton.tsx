import React from 'react';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { Button } from '@mui/material';
import { useAppSelector } from '../../hooks/state';
import { selectNodes } from '../Diagram/store';

function downloadImage(dataUrl, name: string) {
  const a = document.createElement('a');
  a.setAttribute('download', `${name? name : 'Water Process Diagram'}.png`);
  // a.setAttribute('download', 'reactflow.svg');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function DownloadButton(props: DownloadProps) {
  const nodes = useAppSelector(selectNodes);
  const diagramName = useAppSelector((state) => state.diagram.name);
  
  const onClick = () => {
    const nodesBounds = getNodesBounds(nodes);
    // todo bounds are not correct (ex. showing 1024 x768 when full screen)
    const transform: {x: number, y: number, zoom: number} = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0);

    // https://www.npmjs.com/package/save-html-as-image
    // * access shadowDom in place of document
    const viewPortObject = props.shadowRoot.querySelector('.react-flow__viewport');
    // console.log('imgdownload props: w,h,z', imageWidth, imageHeight, transform.zoom);
    // todo try changing scale tansofrm zoom
    toPng(viewPortObject, {
      // toSvg(viewPortObject, {
      backgroundColor: '#efefef',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: String(imageWidth),
        height: String(imageHeight),
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
    }).then((url) => downloadImage(url, diagramName));
  
  };

  return (
    <Button variant="outlined" sx={{ width: '100%', marginBottom: '1rem' }} onClick={() => onClick()}>Download Image</Button>

  );
}

export default DownloadButton;
export interface DownloadProps {
    shadowRoot;
}
