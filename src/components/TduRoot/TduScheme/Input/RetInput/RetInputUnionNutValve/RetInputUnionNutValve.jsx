import { useEffect, useRef } from 'react';
import { drawUnionNutValve } from '../../../../../../common/drawFuncs';
import s from './RetInputUnionNutValve.module.css';

const RetInputUnionNutValve = (props) => {

  const canvasRef = useRef(null);

  const draw = (ctx) => {
    drawUnionNutValve(ctx, props.bvAndFilterDn);
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    draw(context);
  }, [draw,]);

  const onSwitchBvAndFilterDn = () => {
    props.switchBvAndFilterDn();
  }

  return(
    <canvas ref={canvasRef} className={s.retInputUnionNutValve} onClick={onSwitchBvAndFilterDn}/>
  );
}

export default RetInputUnionNutValve;