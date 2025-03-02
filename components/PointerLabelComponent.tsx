import { View, Text } from "react-native";
import React from "react";
import { getYAxisLabelSuffix } from "@/hooks/deviceFunctions";
import { format } from "date-fns";

const PointerLabelComponent = ({ items, selectedParameter, readingTypeLabels }: any) => {
  return (
    <View
      style={{
        height: 90,
        width: 120,
        justifyContent: "center",
        marginTop: -65,
        marginLeft: -40,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 12,
          marginBottom: 3,
          textAlign: "center",
        }}
      >
        {format(items[0]?.timeStamp, "dd/MM HH:mm")}
      </Text>

      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 12,
          backgroundColor: "white",
          marginBottom: 2,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 10,
            color: "#eec643",
          }}
        >
          {readingTypeLabels.data1Label}: {items[0]?.value?.toFixed(2)}{" "}
          {getYAxisLabelSuffix(selectedParameter!)}
        </Text>
      </View>
      {items[1] && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 12,
            backgroundColor: "white",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              textAlign: "center",
              fontSize: 10,
              color: "#10B04B",
            }}
          >
            {readingTypeLabels.data2Label}: {items[1]?.value?.toFixed(2)}{" "}
            {getYAxisLabelSuffix(selectedParameter!)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PointerLabelComponent;
