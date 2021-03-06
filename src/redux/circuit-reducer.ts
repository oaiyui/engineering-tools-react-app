import { BaseThunkType, InferActions } from './store';
import { GeneralParamsType, CircuitState, EquipState, EquipDbData, ValveResData, BrainResData, ObjectToSwitch,
  ValveEquipState, BrainEquipState, EquipAlias, PositionAlias, SwitchDirection} from './../types/types'
import {getDataArr, getNewUnitState, getStWithCalcs} from '../utils/circuit-util'
import {circuitApi} from '../api/circuit-api'
import {selectMountedUnitsCodes} from './circuit-selectors'

const equipAliases: EquipAlias[] = [
  'downstream1', 'downstream2', 'supDpr', 'supCv', 'retCv', 'retDpr', 'upstream1', 'upstream2'
]
const positionAliases: PositionAlias[] = [
  'Downstream 1', 'Downstream 2', 'Supply DPR', 'Supply CV', 'Return CV', 'Return DPR', 'Upstream 1', 'Upstream 2'
]

const initialEquip: EquipState = {}
equipAliases.forEach((alias, i) => {
  initialEquip[alias] = {
    alias   : alias,
    brain   : {id: 0, code: '', equip_type: 'cv_actuator', full_title: '', price: 0},
    position: positionAliases[i],
    valve   : {id: 0, code: '', dp: 0, dpMax: 0, price: 0, v: 0, dn: 0, equip_type: 'cv_valve', kvs: 0,
      type_title: 'VFM2', z: 0, authority: ''},
  }
})


const generalParamsAliases = ['g',  'hexDp', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 't1',  't2']
const generalParamsValues  = ['10', '0.15',  '8',  '8',  '8',  '0',  '0',  '0',  '0',  '6',  '6',  '6',   '150', '70']

const initialGeneralParams: GeneralParamsType = {}
generalParamsAliases.forEach((alias, i) => {
  initialGeneralParams[alias] = {alias: alias, value: generalParamsValues[i]}
})


const initialState: CircuitState = {
  equip         : initialEquip,
  equipDbData   : null,
  generalParams : initialGeneralParams,
  hoveredTarget : null,
  isFetching    : false,
}

const circuitReducer = (state: CircuitState = initialState, action: Actions): CircuitState => {

  let st

  switch (action.type) {

    case 'CHANGE_GENERAL_PARAM': {
      if (!isNaN(+action.value) && (+action.value <= 150 || action.field === 'g') && +action.value >= 0) {
        st = {...state}
        st.generalParams[action.field].value = action.value
      } else {
        return state
      }
      return getStWithCalcs(st, equipAliases)
    }

    case 'CHANGE_HOVERED_TARGET': {
      return {...state, hoveredTarget: action.target}
    }

    case 'SET_EQUIP_DB_DATA': {
      return {...state, equipDbData: action.equipDbData}
    }

    case 'SET_IS_FETCHING': {
      return {...state, isFetching: action.isFetching}
    }

    case 'SET_START_EQUIP': {
      const startEquip = {...state.equip}

      equipAliases.forEach((alias) => {
        const valveDataArr       = getDataArr(state.equipDbData, alias, 'valve') as Array<ValveResData>
        const controlUnitDataArr = getDataArr(state.equipDbData, alias, 'brain') as Array<BrainResData>
        startEquip[alias].valve = getNewUnitState(0, valveDataArr, 'start')       as ValveEquipState
        startEquip[alias].brain = getNewUnitState(0, controlUnitDataArr, 'start') as BrainEquipState
      })

      st = {...state, equip: startEquip}
      return getStWithCalcs(st, equipAliases)
    }

    case 'SWITCH_MODEL': {

      const alias: EquipAlias = action.alias
      const object: ObjectToSwitch = action.object

      const dataArr = getDataArr(state.equipDbData, alias, object) as ValveResData[] | BrainResData[]

      st = {...state}
      if (object === 'valve') {
        st.equip[alias][object] = getNewUnitState(state.equip[alias][object].id, dataArr, action.direction) as ValveEquipState
      } else if (object === 'brain') {
        st.equip[alias][object] = getNewUnitState(state.equip[alias][object].id, dataArr, action.direction) as BrainEquipState
      }

      if (alias === 'supDpr') {
        st.equip.supDpr.valve.dp = 1
        st.equip.retDpr.valve.dp = 0
      } else if (alias === 'retDpr') {
        st.equip.supDpr.valve.dp = 0
        st.equip.retDpr.valve.dp = 1
      } else if (alias === 'supCv') {
        st.equip.supCv.valve.dp = 1
        st.equip.retCv.valve.dp = 0
      } else if (alias === 'retCv') {
        st.equip.supCv.valve.dp = 0
        st.equip.retCv.valve.dp = 1
      }

      return getStWithCalcs(st, equipAliases)
    }

    default:
      return state
  }
}

export const actions = {
  changeGeneralParam  : (field: string, value: string) => ({type: 'CHANGE_GENERAL_PARAM', field, value} as const),
  changeHoveredTarget : (target: string | null)        => ({type: 'CHANGE_HOVERED_TARGET', target}      as const),
  setEquipDbData      : (equipDbData: EquipDbData)     => ({type: 'SET_EQUIP_DB_DATA', equipDbData}     as const),
  setIsFetching       : (isFetching: boolean)          => ({type: 'SET_IS_FETCHING', isFetching}        as const),
  setStartEquip       : ()                             => ({type: 'SET_START_EQUIP'}                    as const),
  switchModel         : (alias: EquipAlias, object: ObjectToSwitch, direction: SwitchDirection) => ({
    type: 'SWITCH_MODEL', alias, object, direction
  } as const),
}


export const getEquipDbDataAndSetStartEquipState = (): ThunkType => async (dispatch) => {
  dispatch(actions.setIsFetching(true))
  const data = await circuitApi.getEquipDbData()
  dispatch(actions.setIsFetching(false))
  dispatch(actions.setEquipDbData(data))
  dispatch(actions.setStartEquip())
}

export const downloadCircuitCp = (): ThunkType => async (dispatch, getState) => {
  const mountedUnitsCodes = selectMountedUnitsCodes(getState())
  await circuitApi.downloadCp(mountedUnitsCodes)
}

export default circuitReducer



// types
type Actions = InferActions<typeof actions>
type ThunkType = BaseThunkType<Actions>