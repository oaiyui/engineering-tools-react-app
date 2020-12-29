import React, { useEffect, useRef } from 'react';
import s from './Partner.module.css';
import { drawPartner } from '../../../../../../common/drawFuncs';

const Partner = (props) => {

  const draw = (ctx) => {
    drawPartner(ctx, props.partnerTypeDn);
  }

  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    draw(context);
  }, [draw,]);

  const onSwitchPartnerTypeDn = () => {
    props.switchPartnerTypeDn()
  }

  let className;
  props.isPartner === true ? className = s.partner : className = s.displayNone;

  return(
    <canvas ref={canvasRef} className={className} onClick={onSwitchPartnerTypeDn}/>
  );
}

export default Partner;