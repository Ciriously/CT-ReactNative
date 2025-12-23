import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {CheckCircle, XCircle, Info, AlertTriangle} from 'lucide-react-native';

const {width} = Dimensions.get('window');

/* --- 1. THE GLASS CARD COMPONENT --- */
const GlassToast = ({text1, text2, type}: any) => {
  let borderColor = '#333';
  let glowColor = 'transparent';
  let Icon = Info;
  let iconColor = '#fff';

  // Customize based on Type
  switch (type) {
    case 'success':
      borderColor = '#00E096'; // Neon Green
      glowColor = 'rgba(0, 224, 150, 0.15)';
      Icon = CheckCircle;
      iconColor = '#00E096';
      break;
    case 'error':
      borderColor = '#FF3B30'; // Neon Red
      glowColor = 'rgba(255, 59, 48, 0.15)';
      Icon = XCircle;
      iconColor = '#FF3B30';
      break;
    case 'info':
      borderColor = '#007AFF'; // Neon Blue
      glowColor = 'rgba(0, 122, 255, 0.15)';
      Icon = Info;
      iconColor = '#007AFF';
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {borderColor, backgroundColor: '#111', shadowColor: borderColor},
      ]}>
      {/* GLOW BACKGROUND */}
      <View style={[styles.glow, {backgroundColor: glowColor}]} />

      {/* ICON SECTION */}
      <View style={[styles.iconBox, {borderColor: iconColor}]}>
        <Icon size={20} color={iconColor} strokeWidth={2.5} />
      </View>

      {/* TEXT SECTION */}
      <View style={styles.content}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  );
};

/* --- 2. EXPORT THE CONFIG --- */
export const toastConfig = {
  success: ({text1, text2}: any) => (
    <GlassToast text1={text1} text2={text2} type="success" />
  ),
  error: ({text1, text2}: any) => (
    <GlassToast text1={text1} text2={text2} type="error" />
  ),
  info: ({text1, text2}: any) => (
    <GlassToast text1={text1} text2={text2} type="info" />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,

    // Shadow / Glow Logic
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6, // Android Glow
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    opacity: 0.6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800', // Extra Bold
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#aaa',
  },
});
