export interface TimeDataProp {
    batteryPercentage: number,
    batteryVoltage: number,
    solar: {
      voltage: number,
      current: number,
      wattage: number,
    },
    teg: {
      voltage: number,
      current: number,
      wattage: number,
    },
    compostContainerOne:{
      methane: number,
      temperatureIn: number;
    temperatureOut: number;
      moisture: number,
    },
    compostContainerTwo:{
      methane: number,
      temperatureIn: number;
    temperatureOut: number;
      moisture: number,
    },
    timestamp: Date
  }
  
  export interface APIDataProp {
    _id: string
    deviceNumber: string
    realTimeData: TimeDataProp
    savedTimeFrameData: TimeDataProp[]
  } 
  
  export interface EnergyData {
    timestamp: string;
    voltage: number;
    current: number;
    wattage: number;
  }
  
  export interface CompostData {
    timestamp: string;
    methane: number;
    temperatureIn: number;
    temperatureOut: number;
    moisture: number;
  }
  
  export interface AllSavedDataProp {
    solar: EnergyData[]
    teg: EnergyData[]
    compostContainerOne: CompostData[]
    compostContainerTwo: CompostData[]
  }

  export interface EnergySavedDataProp {
    solar: EnergyData[]
    teg: EnergyData[]
  }

  export interface CompostSavedDataProp {
    compostContainerOne: CompostData[]
    compostContainerTwo: CompostData[]
  }