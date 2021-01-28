import React from "react";
import {TextField} from "@material-ui/core";
import s from './ParamInputField.module.css';


const ParamInputField = (props) => {

  const x = props.x;
  let y;
  if      (props.positionToGetY === 'sup') {y = 55 ;}
  else if (props.positionToGetY === 'ret') {y = 250;}
  else if (props.positionToGetY === 'mid') {y = 180;}

  const onChangeHandler = (e) => {
    props.changeGeneralParamAC(props.alias, e.target.value);
  }

  return (
    <g>

      {props.positionToGetY !== 'mid' && <line className={s.paramInputFieldStem} x1={x+25} y1={y+25} x2={x+25} y2={y+40}/>} {/* Check if stem is needed */}

      <foreignObject x={x} y={y} width="50" height="50">
        <TextField
          disabled   = {props.disabled}
          inputProps = {{style: {height: 25, padding: 0, fontSize: 14, textAlign: 'center',},}}
          onChange   = {onChangeHandler}
          style      = {{height: 25,}}
          value      = {props.value}
        />
      </foreignObject>

    </g>
  );
}

export default ParamInputField;