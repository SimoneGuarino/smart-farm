import type { Sensor, Sample } from '@/types/sensors'
import { sectors } from '@/config/fieldLayout'
import { randBetween, drift } from './generators'

export function buildMockSensors(): Sensor[]{
  const sensors: Sensor[] = []

  // 4 punti rappresentativi × 2 profondità = 8 VWC
  const vwcRows = [1, 16, 30, 33]
  const depths = [20, 35]
  vwcRows.forEach((row)=>{
    depths.forEach((d)=>{
      const sector = sectors.find(s=>s.rows.includes(row))!.id
      sensors.push({ id:`VWC_${row}_${d}`, kind:'VWC', label:`VWC fila ${row} @${d}cm`, row, depthCm:d, sector, unit:'%v/v', battery: randBetween(65, 100) })
    })
  })

  // EC drenaggio/percolato – 2 sonde
  sensors.push({ id:'ECDRAIN_A', kind:'EC_DRAIN', label:'EC drenaggio – testa impianto', sector:'A', unit:'mS/cm', battery: randBetween(60, 100) })
  sensors.push({ id:'ECDRAIN_E', kind:'EC_DRAIN', label:'EC drenaggio – valle impianto', sector:'E', unit:'mS/cm', battery: randBetween(60, 100) })

  // Temperatura suolo dedicata – 1
  sensors.push({ id:'T_SOIL_CENTRO', kind:'SOIL_TEMP', label:'T suolo 15cm – centro', sector:'C', unit:'°C', battery: randBetween(70, 100) })

  // Leaf wetness – 2
  sensors.push({ id:'LWS_1', kind:'LEAF_WETNESS', label:'Bagnatura fogliare – est', sector:'B', unit:'arb', battery: randBetween(50, 100) })
  sensors.push({ id:'LWS_2', kind:'LEAF_WETNESS', label:'Bagnatura fogliare – ovest', sector:'D', unit:'arb', battery: randBetween(50, 100) })

  // Inline pH/EC (mandata)
  sensors.push({ id:'PH_INLINE', kind:'PH_INLINE', label:'pH in linea', unit:'pH' })
  sensors.push({ id:'EC_INLINE', kind:'EC_INLINE', label:'EC in linea', unit:'mS/cm' })

  // Contalitri / impulsi e pressione pre/post filtro
  sensors.push({ id:'FLOW_PULSE_MAIN', kind:'FLOW_PULSE', label:'Impulsi contalitri', unit:'imp/s' })
  sensors.push({ id:'P_PRE', kind:'PRESSURE', label:'Pressione pre-filtro', unit:'bar' })
  sensors.push({ id:'P_POST', kind:'PRESSURE', label:'Pressione post-filtro', unit:'bar' })

  // Stazione meteo aggregata
  sensors.push({ id:'METEO', kind:'METEO', label:'Meteo (temp, UR, pioggia, vento)', unit:'composite' })

  return sensors
}

// simulatore push
export function startMockFeed(push:(id:string,s:Sample)=>void){
  const state: Record<string, number> = {
    'PH_INLINE': 5.4,
    'EC_INLINE': 1.1,
    'FLOW_PULSE_MAIN': 2.2,
    'P_PRE': 2.0,
    'P_POST': 1.8,
  }

  setInterval(()=>{
    const t = Date.now()

    // VWC
    document.querySelectorAll('[data-sensor-id^="VWC_"]').forEach(()=>{}) // no-op hint per tree-shake

    // generico helper per pubblicare
    const publish = (id:string, v:number)=> push(id, { t, v })

    // random walk per i sensori noti
    Object.keys(state).forEach(id=>{
      const prev = state[id]
      let lo=0, hi=10, step=0.05
      if(id==='PH_INLINE'){ lo=4.6; hi=6.2; step=0.02 }
      if(id==='EC_INLINE'){ lo=0.5; hi=1.8; step=0.03 }
      if(id==='FLOW_PULSE_MAIN'){ lo=0.0; hi=3.5; step=0.2 }
      if(id==='P_PRE'){ lo=1.0; hi=3.0; step=0.05 }
      if(id==='P_POST'){ lo=0.8; hi=2.8; step=0.05 }
      const v = state[id] = drift(prev, step, lo, hi)
      publish(id, v)
    })

    // VWC per ciascuna sonda
    const vwcIds = buildMockSensors().filter(s=>s.kind==='VWC').map(s=>s.id)
    vwcIds.forEach((id, idx)=>{
      // profilo: oscillazioni strette 22-30% con micro noise
      const base = 26 + Math.sin((t/1000 + idx)%360)*2
      const v = base + randBetween(-1.5, 1.5)
      publish(id, Math.min(32, Math.max(18, v)))
    })

    // EC drenaggio
    ;['ECDRAIN_A','ECDRAIN_E'].forEach((id)=> publish(id, randBetween(0.3, 1.2)))

    // T suolo
    publish('T_SOIL_CENTRO', randBetween(12, 29))

    // Leaf wetness
    ;['LWS_1','LWS_2'].forEach((id)=> publish(id, Math.random()>0.98 ? randBetween(0.7,1) : randBetween(0,0.2)))

    // Meteo → solo come proxy: temperatura e pioggia in due canali derivati (per semplicità mettiamo in EC_INLINE off-channel comment)
    publish('METEO', randBetween(0, 1))
  }, 1000)
}
