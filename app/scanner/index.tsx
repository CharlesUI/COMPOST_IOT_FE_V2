// (app)/scanner.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // Use TouchableOpacity for custom button styling
  Alert,
  ActivityIndicator,
  Dimensions, // To help calculate viewfinder size
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext'; // Adjust path if needed
import useAddDevice from '@/hooks/useAddDevice'; // Adjust path if needed
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const viewfinderSize = width * 0.7; // Make viewfinder 70% of screen width
const viewfinderBorderWidth = 2;
const cornerSize = 30;
const cornerBorderWidth = 4; // Thicker corners

const ScannerScreen = () => {
  // Keep 'scanned' state to prevent processing multiple scans from one QR code
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const { user, updateUser } = useUser();
  const {
    addDevice,
    loading: addingDevice,
    error: addDeviceError,
  } = useAddDevice();

  // --- Permission Handling (same as before) ---
   useEffect(() => {
     if (!permission) return;
     if (permission.status === 'undetermined') {
       requestPermission();
     }
      if (permission.status === 'denied' && permission.canAskAgain) {
        requestPermission();
      } else if (permission.status === 'denied' && !permission.canAskAgain) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to scan QR codes. Please enable it in your device settings.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
   }, [permission, requestPermission, router]);

  // --- Device Adding Logic (with refined validation feedback) ---
  const handleAddDeviceFromScan = async (text: string | null) => {
    if (!text) {
      Alert.alert("Scan Error", "QR code data is empty. Please try again.", [
        // Only allow rescan after dismissing alert
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
      return;
    }

    // More specific validation (example: starts with CMPST and is 10 chars)
    const isValidFormat = text.startsWith("CMPST") && text.length === 10;

    if (!isValidFormat) {
      Alert.alert(
        "Invalid Format",
        `Scanned data "${text}" is not a valid Device ID (must start with CMPST and be 10 characters long). Please scan the correct QR code.`,
        [
          // Only allow rescan after dismissing alert
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
      return; // Stop processing if format is invalid
    }

    if (!user?._id || !user?.email || !user?.username) {
      Alert.alert("Error", "User not found. Please log in again.", [
        { text: 'OK', onPress: () => {
            setScanned(false); // Allow rescan if user isn't logged in? Or navigate away?
            // router.replace('/login'); // Or appropriate login route
        }}
      ]);
      return;
    }

    // ---- Proceed with adding the device ----
    const success = await addDevice(text, user._id);

    if (success) {
      Alert.alert("Success", `Device ${text} added successfully!`, [
          { text: 'OK', onPress: () => {
              updateUser({
                ...user,
                devices: [...(user?.devices || []), text],
                selectedDevice: text,
              });
              router.back();
          }}
      ]);
    } else {
      const errorMessage = addDeviceError || `Failed to add device ${text}. It might already be registered or an error occurred.`;
      Alert.alert("Error", errorMessage, [
          // Only allow rescan after dismissing alert
          { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  // --- Scan Handler (locks after first scan until processing is done/alert dismissed) ---
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
     // Ignore scans if already processing, loading, or permission denied
     if (scanned || addingDevice || !permission?.granted) return;

     setScanned(true); // <<< LOCK: Mark as scanned immediately
     console.log(`Scanned QR Code: Type: ${type} Data: ${data}`);

     // Process the scanned data (validation happens inside)
     handleAddDeviceFromScan(data);
     // >>> UNLOCK happens via setScanned(false) in the Alert callbacks for errors/invalid format
  };


  // --- Render Logic ---
  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        {permission.canAskAgain ? (
           // Use TouchableOpacity for consistent styling if needed
           <TouchableOpacity onPress={requestPermission} style={styles.actionButton}>
             <Text style={styles.actionButtonText}>Grant Permission</Text>
           </TouchableOpacity>
        ) : (
           <Text style={styles.permissionText}>Please enable camera permissions in settings.</Text>
        )}
         <TouchableOpacity onPress={() => router.back()} style={[styles.actionButton, styles.cancelButtonVisual]}>
             <Text style={styles.actionButtonText}>Go Back</Text>
         </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Render Camera View with Overlay ---
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned} // Pass the debounced handler
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject} // Camera fills the background
      />

      {/* --- Viewfinder Overlay --- */}
      <View style={styles.overlay}>
        {/* Top Semi-Transparent Area */}
        <View style={styles.overlaySection} />

        {/* Middle Area (Sides + Viewfinder) */}
        <View style={styles.middleContainer}>
          <View style={styles.overlaySection} />{/* Left Side */}
          <View style={styles.viewfinder}>
             {/* Corner Brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.overlaySection} />{/* Right Side */}
        </View>

        {/* Bottom Semi-Transparent Area */}
        <View style={[styles.overlaySection, styles.bottomOverlay]}>
           <Text style={styles.scanInstructionText}>Align QR code within the frame</Text>
           {/* Styled Cancel Button */}
           <TouchableOpacity onPress={() => router.back()} style={[styles.actionButton, styles.cancelButtonVisual]}>
             <Text style={styles.actionButtonText}>Cancel</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Loading Indicator Overlay (appears on top when adding) */}
      {addingDevice && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF"/>
            <Text style={styles.loadingText}>Adding Device...</Text>
          </View>
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     padding: 20,
     backgroundColor: '#242424',
  },
  permissionText: {
     color: 'white',
     fontSize: 16,
     textAlign: 'center',
     marginBottom: 20,
  },
  // --- Overlay Styles ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // Overlay container itself is transparent
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlaySection: {
    flex: 1, // Takes up space top/bottom/sides
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
  },
  middleContainer: {
    flexDirection: 'row',
    height: viewfinderSize, // Height of the clear area row
    width: '100%',
  },
  viewfinder: {
    width: viewfinderSize,
    height: viewfinderSize,
    // backgroundColor: 'transparent', // Center is clear (no background needed)
    borderWidth: viewfinderBorderWidth,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Subtle white border
    position: 'relative', // Needed for positioning corners absolutely
  },
  bottomOverlay: {
    justifyContent: 'center', // Center text and button vertically
    alignItems: 'center',
    paddingBottom: 40, // Add padding for button spacing
  },
  scanInstructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30, // Space above cancel button
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
   // --- Viewfinder Corner Styles ---
   corner: {
     position: 'absolute',
     width: cornerSize,
     height: cornerSize,
     borderColor: '#FFFFFF', // Bright white corners
     borderWidth: cornerBorderWidth, // Set thickness via border width on specific sides
   },
   topLeft: {
     top: -viewfinderBorderWidth - (cornerBorderWidth/2) +1, // Adjust position carefully
     left: -viewfinderBorderWidth - (cornerBorderWidth/2) +1,
     borderTopWidth: cornerBorderWidth,
     borderLeftWidth: cornerBorderWidth,
     borderRightWidth:0, //hide other border
     borderBottomWidth:0 //hide other border
   },
   topRight: {
     top: -viewfinderBorderWidth - (cornerBorderWidth/2) +1,
     right: -viewfinderBorderWidth - (cornerBorderWidth/2)+1,
     borderTopWidth: cornerBorderWidth,
     borderRightWidth: cornerBorderWidth,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   },
   bottomLeft: {
     bottom: -viewfinderBorderWidth - (cornerBorderWidth/2)+1 ,
     left: -viewfinderBorderWidth - (cornerBorderWidth/2) +1,
     borderBottomWidth: cornerBorderWidth,
     borderLeftWidth: cornerBorderWidth,
       borderTopWidth: 0,
     borderRightWidth: 0,
   },
   bottomRight: {
     bottom: -viewfinderBorderWidth - (cornerBorderWidth/2)+1,
     right: -viewfinderBorderWidth - (cornerBorderWidth/2)+1,
     borderBottomWidth: cornerBorderWidth,
     borderRightWidth: cornerBorderWidth,
      borderTopWidth: 0,
      borderLeftWidth: 0,
   },
  // --- Button Styles (Generic Action Button + Specific Cancel Style) ---
  actionButton: {
      backgroundColor: '#4A4A4A', // Darker grey background
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#5A5A5A',
      minWidth: '60%', // Ensure decent width
      alignItems: 'center', // Center text inside
      marginTop: 15, // Spacing between buttons/text
  },
  actionButtonText: {
      color: '#E5E7EB', // Light grey/white text
      fontSize: 16,
      fontWeight: 'bold',
  },
  cancelButtonVisual: {
    // Optional: slightly different visual for cancel, e.g., different border or background
    // backgroundColor: '#5A5A5A' // Example: slightly darker grey for cancel
     borderColor: '#777' // Example: Lighter border for cancel
  },
  // --- Loading Overlay ---
   loadingOverlay: {
     position: 'absolute',
     top: 0, left: 0, right: 0, bottom: 0,
     backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker overlay when loading
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 10,
   },
   loadingText: {
     color: 'white',
     marginTop: 15,
     fontSize: 18,
     fontWeight: 'bold',
   },
});

export default ScannerScreen;