import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { runOnJS } from 'react-native-reanimated';

export default function ScannerScreen() {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [bpm, setBpm] = useState<number | string>("--");

  // Load the TFLite model from the local bundle
  const model = useTensorflowModel(require('../assets/rppg_model.tflite'));

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const updateBpmOnJS = (newBpm: number) => {
    setBpm(newBpm);
  };

  // High-performance Frame Processor running in C++/JNI
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!model.state || model.state !== 'loaded') return;

    // 1. Extract RGB from the frame (custom native plugin usually needed here for raw byte extraction)
    // 2. Pass frame data into TFLite Model
    // const output = model.model.runSync([frameData]);
    // 3. Process output (e.g., getting BPM from output tensor)
    
    // Mocking output for demonstration
    const mockBpm = 75 + Math.floor(Math.random() * 5);
    runOnJS(updateBpmOnJS)(mockBpm);
  }, [model.state]);

  if (!hasPermission) return <Text style={{color: 'white', marginTop: 50}}>No Camera Permission</Text>;
  if (device == null) return <ActivityIndicator size="large" color="#39ff14" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Sensors Suite (Native)</Text>
      
      <View style={styles.cameraWrapper}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          fps={60} // crucial for rPPG
          torch="on" // The magic web can't do: Explicit hardware flash control
        />
        <View style={styles.overlay}>
           <View style={styles.roiBox} />
        </View>
      </View>

      <View style={styles.bpmContainer}>
        <Text style={styles.bpmLabel}>rPPG Neural Estimation</Text>
        <Text style={styles.bpmValue}>{bpm} <Text style={styles.bpmUnit}>BPM</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1c1c',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraWrapper: {
    width: '90%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#39ff14',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#39ff14',
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  bpmContainer: {
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    width: '80%',
  },
  bpmLabel: {
    color: '#a0aab2',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  bpmValue: {
    color: '#39ff14',
    fontSize: 64,
    fontWeight: '900',
  },
  bpmUnit: {
    fontSize: 24,
    color: 'white',
  }
});
