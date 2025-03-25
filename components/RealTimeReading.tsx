import { View, Text } from "react-native";
import React from "react";
import Svg, { Circle, Rect, Path, Line } from "react-native-svg";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export interface RTC {
  batteryPercentage: number;
  batteryVoltage: number;
  solar: {
    voltage: number;
    current: number;
    wattage: number;
  };
  compostContainerOne: {
    methane: number;
    temperatureIn: number;
    temperatureOut: number;
    moisture: number;
    tegOne: {
      voltage: number;
      current: number;
      wattage: number;
    };
  };
  compostContainerTwo: {
    methane: number;
    temperatureIn: number;
    temperatureOut: number;
    moisture: number;
    tegTwo: {
      voltage: number;
      current: number;
      wattage: number;
    };
  };
  timestamp: Date;
}

interface Props {
  selectedReading: string | null;
  realTimeData: RTC | null;
}

const RealTimeReading = ({ selectedReading, realTimeData }: Props) => {
  // Function to determine battery color based on percentage
  const getBatteryColor = (percentage: number) => {
    if (percentage >= 70) return "#4ade80"; // Green for high battery
    if (percentage >= 30) return "#facc15"; // Yellow for medium battery
    return "#ef4444"; // Red for low battery
  };

  // Function for circular progress bar
  const CircleProgress = ({
    percentage,
    radius = 40,
    strokeWidth = 10,
    color = "#4ade80",
    label,
    value,
    unit = "",
  }: {
    percentage: number;
    radius?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    value: number;
    unit?: string;
  }) => {
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (percentage / 100) * circumference;

    return (
      <View className="items-center justify-center my-2">
        <Svg
          height={(radius + strokeWidth) * 2}
          width={(radius + strokeWidth) * 2}
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${
            (radius + strokeWidth) * 2
          }`}
        >
          {/* Background circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90, ${radius + strokeWidth}, ${
              radius + strokeWidth
            })`}
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="color-white text-[9px] font-bold">
            {value.toFixed(1)}
            {unit}
          </Text>
          {label && <Text className="color-white text-[7px]">{label}</Text>}
        </View>
      </View>
    );
  };

  // Function for gauge visualization
  const Gauge = ({
    value,
    min = 0,
    max = 100,
    label,
    unit = "",
    color = "#4ade80",
  }: {
    value: number;
    min?: number;
    max?: number;
    label: string;
    unit?: string;
    color?: string;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    return (
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="color-white text-[10px]">{label}:</Text>
          <Text className="color-white font-medium text-[10px]">
            {value} {unit}
          </Text>
        </View>
        <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              width: `${clampedPercentage}%`,
            }}
          />
        </View>
      </View>
    );
  };

  // Function for power visualization (solar and TEG)
  const PowerMonitor = ({
    voltage,
    current,
    wattage,
    type,
  }: {
    voltage: number;
    current: number;
    wattage: number;
    type: string;
  }) => {
    // Max values for visualization (adjust based on your expected ranges)
    const maxWattage = type === "Solar" ? 20 : 10; // Higher max for solar than TEG
    const wattagePercentage = Math.min(100, (wattage / maxWattage) * 100);

    return (
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-6">
          <View className="items-center">
            <CircleProgress
              percentage={wattagePercentage}
              radius={35}
              strokeWidth={8}
              color="#3b82f6"
              label="Power"
              value={wattage}
              unit="W"
            />
          </View>

          <View className="flex-1 mx-2">
            <MaterialCommunityIcons
              name={type === "Solar" ? "solar-power" : "flash"}
              size={48}
              color="#f59e0b"
              style={{ alignSelf: "center" }}
            />
          </View>

          <View className="flex-1">
            <Gauge
              value={voltage}
              min={0}
              max={type === "Solar" ? 12 : 5}
              label="Voltage"
              unit="V"
              color="#60a5fa"
            />
            <Gauge
              value={current}
              min={0}
              max={type === "Solar" ? 2 : 1}
              label="Current"
              unit="A"
              color="#818cf8"
            />
          </View>
        </View>
      </View>
    );
  };

  // Function for compost container visualization
  // Function for compost container visualization
  const CompostMonitor = ({
    temperatureIn,
    temperatureOut,
    moisture,
    methane,
    id,
  }: {
    temperatureIn: number;
    temperatureOut: number;
    moisture: number;
    methane: number;
    id: string;
  }) => {
    // Color functions based on healthy ranges
    const getTempColor = (temp: number) => {
      if (temp < 40 || temp > 70) return "#ef4444"; // Red for too cold or too hot
      return "#4ade80"; // Green for good range
    };

    const getMoistureColor = (m: number) => {
      if (m < 40 || m > 60) return "#ef4444"; // Red for too dry or too wet
      return "#4ade80"; // Green for good range
    };

    const getMethaneColor = (m: number) => {
      if (m > 5000) return "#ef4444"; // Red for high/concerning
      if (m >= 1000) return "#facc15"; // Yellow for moderate
      return "#4ade80"; // Green for low/normal
    };

    // Calculate percentages for circular indicators
    const tempInPercentage = Math.min(
      100,
      Math.max(0, (temperatureIn / 70) * 100)
    );
    const tempOutPercentage = Math.min(
      100,
      Math.max(0, (temperatureOut / 70) * 100)
    );

    const moisturePercentage = moisture; // Already a percentage
    const maxMethanePpmForDisplay = 6000; // Set a max for the circle to represent

    // Calculate the percentage for the CircleProgress based on a reasonable maximum
    const methanePercentage = Math.min(
      100,
      Math.max(0, (methane / maxMethanePpmForDisplay) * 100)
    );

    return (
      <View className="p-2">
        <View className="flex-row justify-between items-center mb-4">
          <MaterialCommunityIcons
            name="flower-tulip"
            size={24}
            color="#f59e0b"
          />
          <Text className="color-white text-lg font-bold flex-1">
            Container {id}
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row flex-wrap justify-around">
            {/* Changed to flex-wrap */}
            <View className="items-center w-1/2 mb-4">
              {/* Added width and margin */}
              <CircleProgress
                percentage={tempInPercentage}
                radius={30}
                strokeWidth={6}
                color={getTempColor(temperatureIn)}
                label="Internal °C"
                value={temperatureIn}
                unit="°C"
              />
            </View>
            <View className="items-center w-1/2 mb-4">
              {/* Added width and margin */}
              <CircleProgress
                percentage={tempOutPercentage}
                radius={30}
                strokeWidth={6}
                color={getTempColor(temperatureOut)}
                label="External °C"
                value={temperatureOut}
                unit="°C"
              />
            </View>
            <View className="items-center w-1/2 mb-4">
              {/* Added width and margin */}
              <CircleProgress
                percentage={moisturePercentage}
                radius={30}
                strokeWidth={6}
                color={getMoistureColor(moisture)}
                label="Moisture"
                value={moisture}
                unit="%"
              />
            </View>
            <View className="items-center w-1/2 mb-4">
              {/* Added width and margin */}
              <View className="items-center w-1/2 mb-4">
                <CircleProgress
                  percentage={methanePercentage}
                  radius={30}
                  strokeWidth={6}
                  color={getMethaneColor(methane)}
                  label="Methane"
                  value={methane}
                  unit="ppm"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Battery component
  const BatteryCircleProgress = ({
    percentage,
    voltage,
  }: {
    percentage: number;
    voltage: number;
  }) => {
    const radius = 50;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (percentage / 100) * circumference;
    const color = getBatteryColor(percentage);

    return (
      <View className="items-center justify-center my-4">
        <Svg
          height={(radius + strokeWidth) * 2}
          width={(radius + strokeWidth) * 2}
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${
            (radius + strokeWidth) * 2
          }`}
        >
          {/* Background circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90, ${radius + strokeWidth}, ${
              radius + strokeWidth
            })`}
          />
        </Svg>
        <View className="absolute items-center">
          <MaterialCommunityIcons name="battery" size={28} color={color} />
          <Text className="color-white text-xl font-bold mt-1">
            {percentage}%
          </Text>
          <Text className="color-white text-sm font-semibold">
            {voltage.toFixed(1)}V
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {selectedReading === "BATTERY" && (
        <View className="flex-1 p-4 items-center justify-center">
          <Text className="color-white mb-4 font-bold text-center text-xl">
            Battery Status
          </Text>
          <BatteryCircleProgress
            percentage={realTimeData?.batteryPercentage || 0}
            voltage={realTimeData?.batteryVoltage || 0}
          />
          <View className="mt-6 bg-gray-800 rounded-lg p-4 w-full">
            <Text className="color-white text-center">
              {realTimeData?.batteryPercentage || 0 >= 70
                ? "Battery level is good"
                : realTimeData?.batteryPercentage || 0 >= 30
                ? "Battery level is moderate"
                : "Battery level is low"}
            </Text>
          </View>
        </View>
      )}

      {selectedReading === "SOLAR" && (
        <View className="flex-1 p-4">
          <Text className="color-white mb-4 font-bold text-center text-xl">
            Solar Power
          </Text>
          <PowerMonitor
            voltage={realTimeData?.solar.voltage || 0}
            current={realTimeData?.solar.current || 0}
            wattage={realTimeData?.solar.wattage || 0}
            type="Solar"
          />
          <View className="bg-gray-800 rounded-lg p-4 mt-4">
            <Text className="color-white font-medium mb-2">
              Solar Performance
            </Text>
            <Text className="color-white">
              {realTimeData?.solar.wattage || 0 > 10
                ? "High solar energy production"
                : realTimeData?.solar.wattage || 0 > 5
                ? "Moderate solar energy production"
                : "Low solar energy production"}
            </Text>
          </View>
        </View>
      )}

      {selectedReading === "COMPOST #1" && (
        <>
          <View className="flex-1 p-4">
            <Text className="color-white mb-4 font-bold text-center text-xl">
              COCO BIN
            </Text>
            <CompostMonitor
              temperatureIn={
                realTimeData?.compostContainerOne.temperatureIn || 0
              }
              temperatureOut={
                realTimeData?.compostContainerOne.temperatureOut || 0
              }
              moisture={realTimeData?.compostContainerOne.moisture || 0}
              methane={realTimeData?.compostContainerOne.methane || 0}
              id="1"
            />
            <View className="bg-gray-800 rounded-lg p-4 mt-4">
              <Text className="color-white font-medium mb-2">
                Status Summary
              </Text>
              <Text className="color-white mb-1">
                Internal Temp:
                {realTimeData?.compostContainerOne.temperatureIn || 0 < 40
                  ? "Too cold"
                  : realTimeData?.compostContainerOne.temperatureIn || 0 > 65
                  ? "Too hot"
                  : "Optimal"}
              </Text>
              <Text className="color-white mb-1">
                External Temp:
                {realTimeData?.compostContainerOne.temperatureOut || 0 < 40
                  ? "Too cold"
                  : realTimeData?.compostContainerOne.temperatureOut || 0 > 65
                  ? "Too hot"
                  : "Optimal"}
              </Text>
              <Text className="color-white mb-1">
                Moisture:
                {realTimeData?.compostContainerOne.moisture || 0 < 40
                  ? "Too dry"
                  : realTimeData?.compostContainerOne.moisture || 0 > 60
                  ? "Too wet"
                  : "Optimal"}
              </Text>
              <Text className="color-white">
                Methane:
                {realTimeData?.compostContainerOne.methane || 0 > 300
                  ? "High (action required)"
                  : realTimeData?.compostContainerOne.methane || 0 > 100
                  ? "Moderate"
                  : "Low (good)"}
              </Text>
            </View>
          </View>
          <View className="flex-1 p-4">
            <Text className="color-white mb-4 font-bold text-center text-xl">
              TEG: COCO
            </Text>
            <PowerMonitor
              voltage={realTimeData?.compostContainerOne.tegOne.voltage || 0}
              current={realTimeData?.compostContainerOne.tegOne.current || 0}
              wattage={realTimeData?.compostContainerOne.tegOne.wattage || 0}
              type="TEG"
            />
            <View className="bg-gray-800 rounded-lg p-4 mt-4">
              <Text className="color-white font-medium mb-2">
                TEG Performance
              </Text>
              <Text className="color-white">
                {realTimeData?.compostContainerOne.tegOne.wattage || 0 > 5
                  ? "High TEG energy production"
                  : realTimeData?.compostContainerOne.tegOne.wattage || 0 > 2
                  ? "Moderate TEG energy production"
                  : "Low TEG energy production"}
              </Text>
            </View>
          </View>
        </>
      )}

      {selectedReading === "COMPOST #2" && (
        <>
          <View className="flex-1 p-4">
            <Text className="color-white mb-4 font-bold text-center text-xl">
              MIXED BIN
            </Text>
            <CompostMonitor
              temperatureIn={
                realTimeData?.compostContainerTwo.temperatureIn || 0
              }
              temperatureOut={
                realTimeData?.compostContainerTwo.temperatureOut || 0
              }
              moisture={realTimeData?.compostContainerTwo.moisture || 0}
              methane={realTimeData?.compostContainerTwo.methane || 0}
              id="2"
            />
            <View className="bg-gray-800 rounded-lg p-4 mt-4">
              <Text className="color-white font-medium mb-2">
                Status Summary
              </Text>
              <Text className="color-white mb-1">
                Internal Temp:
                {realTimeData?.compostContainerTwo.temperatureIn || 0 < 40
                  ? "Too cold"
                  : realTimeData?.compostContainerTwo.temperatureIn || 0 > 65
                  ? "Too hot"
                  : "Optimal"}
              </Text>
              <Text className="color-white mb-1">
                External Temp:
                {realTimeData?.compostContainerTwo.temperatureOut || 0 < 40
                  ? "Too cold"
                  : realTimeData?.compostContainerTwo.temperatureOut || 0 > 65
                  ? "Too hot"
                  : "Optimal"}
              </Text>
              <Text className="color-white mb-1">
                Moisture:
                {realTimeData?.compostContainerTwo.moisture || 0 < 40
                  ? "Too dry"
                  : realTimeData?.compostContainerTwo.moisture || 0 > 60
                  ? "Too wet"
                  : "Optimal"}
              </Text>
              <Text className="color-white">
                Methane:
                {realTimeData?.compostContainerTwo.methane || 0 > 300
                  ? "High (action required)"
                  : realTimeData?.compostContainerTwo.methane || 0 > 100
                  ? "Moderate"
                  : "Low (good)"}
              </Text>
            </View>
          </View>
          <View className="flex-1 p-4">
            <Text className="color-white mb-4 font-bold text-center text-xl">
              TEG: MIXED
            </Text>
            <PowerMonitor
              voltage={realTimeData?.compostContainerTwo.tegTwo.voltage || 0}
              current={realTimeData?.compostContainerTwo.tegTwo.current || 0}
              wattage={realTimeData?.compostContainerTwo.tegTwo.wattage || 0}
              type="TEG"
            />
            <View className="bg-gray-800 rounded-lg p-4 mt-4">
              <Text className="color-white font-medium mb-2">
                TEG Performance
              </Text>
              <Text className="color-white">
                {realTimeData?.compostContainerTwo.tegTwo.wattage || 0 > 5
                  ? "High TEG energy production"
                  : realTimeData?.compostContainerTwo.tegTwo.wattage || 0 > 2
                  ? "Moderate TEG energy production"
                  : "Low TEG energy production"}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default React.memo(RealTimeReading, (prevProps, nextProps) => {
  return (
    prevProps.selectedReading === nextProps.selectedReading &&
    JSON.stringify(prevProps.realTimeData) ===
      JSON.stringify(nextProps.realTimeData)
  );
});
