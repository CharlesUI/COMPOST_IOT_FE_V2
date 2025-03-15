// Structure of the Whole Data
// {
// 	_id: String,
// 	deviceNumber: String,
// 	realTimeData: {
// 		batteryStatus: number,
// 		solar: {
// 			voltage: number,
// 			current: number,
// 			wattage: number,
// 		},
// 		teg: {
// 			voltage: number,
// 			current: number,
// 			wattage: number,
// 		},
// 		compostContainerOne:{
// 			methane: number,
// 			temperatureIn: number,
//          temperatureOut: number,
// 			moisture: number,
// 		},
// 		compostContainerTwo:{
// 			methane: number,
// 			temperatureIn: number,
//          temperatureOut: number,
// 			moisture: number,
// 		},
// 		timestamp: Date
// 	},
// 	savedTimeFrameData: [{
// 		batteryStatus: number,
// 		solar: {
// 			voltage: number,
// 			current: number,
// 			wattage: number,
// 		},
// 		teg: {
// 			voltage: number,
// 			current: number,
// 			wattage: number,
// 		},
// 		compostContainerOne:{
// 			methane: number,
// 			temperatureIn: number,
//          temperatureOut: number,
// 			moisture: number,
// 		},
// 		compostContainerTwo:{
// 			methane: number,
// 			temperatureIn: number,
//          temperatureOut: number,
// 			moisture: number,
// 		},
// 		timestamp: Date
// 	}]
// }

//  Structure for Individual Data Solar, Teg, CompostOne, and Compost Two

//     solar: [{timestamp: Date(), voltage: number, current: number, wattage:number}]

//     teg: [{timestamp: Date(), voltage: number, current: number, wattage:number}]

//     compostContainerOne: [{timestamp: Date(), methane: number, temperatureIn: number, temperatureOut: number, moisture:number}]

//     compostContainerTwo: [{timestamp: Date(), methane: number, temperatureIn: number, temperatureOut: number, moisture:number}]

// Generate mock data for energy
// const generateMockData1 = (timePeriod: string, dataType: string) => {
//   let maxValue = 100; // Default maximum value for wattage
//   if (dataType === "voltage") maxValue = 20;
//   if (dataType === "current") maxValue = 5;

//   const dataLength = timePeriod === "Day" ? 24 : timePeriod === "Week" ? 7 : 12;

//   return Array.from({ length: dataLength }, (_, i) => ({
//     label:
//       timePeriod === "Day"
//         ? `${i}:00`
//         : timePeriod === "Week"
//         ? `Day ${i + 1}`
//         : `Month ${i + 1}`,
//     value: parseFloat((Math.random() * maxValue).toFixed(2)), // Random value within range
//     timeStamp: new Date(), // Mock timestamp
//   }));
// };
// const generateMockData2 = (timePeriod: string, dataType: string) => {
//   let maxValue = 100; // Default maximum value for wattage
//   if (dataType === "voltage") maxValue = 20;
//   if (dataType === "current") maxValue = 5;

//   const dataLength = timePeriod === "Day" ? 24 : timePeriod === "Week" ? 7 : 12;

//   return Array.from({ length: dataLength }, (_, i) => ({
//     label:
//       timePeriod === "Day"
//         ? `${i}:00`
//         : timePeriod === "Week"
//         ? `Day ${i + 1}`
//         : `Month ${i + 1}`,
//     value: parseFloat((Math.random() * maxValue).toFixed(2)), // Random value within range
//     timeStamp: new Date(), // Mock timestamp
//   }));
// };

// // Generate mock data for compost
// const generateCompostData1 = (timePeriod: string, dataType: string) => {
//   let maxValue = 100; // Default maximum value for temperature
//   if (dataType === "methane") maxValue = 50;
//   if (dataType === "moisture") maxValue = 80;

//   const dataLength = timePeriod === "Day" ? 24 : timePeriod === "Week" ? 7 : 12;

//   return Array.from({ length: dataLength }, (_, i) => ({
//     label:
//       timePeriod === "Day"
//         ? `${i}:00`
//         : timePeriod === "Week"
//         ? `Day ${i + 1}`
//         : `Month ${i + 1}`,
//     value: parseFloat((Math.random() * maxValue).toFixed(2)), // Random value within range
//     timeStamp: new Date(), // Mock timestamp
//   }));
// };
// const generateCompostData2 = (timePeriod: string, dataType: string) => {
//   let maxValue = 100; // Default maximum value for temperature
//   if (dataType === "methane") maxValue = 50;
//   if (dataType === "moisture") maxValue = 80;

//   const dataLength = timePeriod === "Day" ? 24 : timePeriod === "Week" ? 7 : 12;

//   return Array.from({ length: dataLength }, (_, i) => ({
//     label:
//       timePeriod === "Day"
//         ? `${i}:00`
//         : timePeriod === "Week"
//         ? `Day ${i + 1}`
//         : `Month ${i + 1}`,
//     value: parseFloat((Math.random() * maxValue).toFixed(2)), // Random value within range
//     timeStamp: new Date(), // Mock timestamp
//   }));
// };
