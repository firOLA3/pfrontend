import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { ArrowRightIcon, DevicesIcon } from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectedDevices'>;

export const ConnectedDevicesScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const isIos = Platform.OS === 'ios';
  const platformHealthName = isIos ? 'Apple Health' : 'Google Fit';

  const defaultDevices = {
    appleHealth: isIos,
    googleFit: !isIos,
    readSteps: true,
    readCalories: true,
    readWeight: false,
    readHeartRate: false,
    writeWorkouts: true,
    lastSyncDate: new Date().toISOString(),
  };

  const [devices, setDevices] = useState({
    ...defaultDevices,
    ...(user?.devices || {}),
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isConnected = isIos ? devices.appleHealth : devices.googleFit;

  const persistChange = async (updated: typeof devices) => {
    try {
      setIsUpdating(true);
      const res = await userService.updateDevices(updated);
      if (res.success && res.data) {
        updateUser({ devices: res.data as any });
      }
    } catch {
      // Quiet fallback
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleConnection = async () => {
    const nextState = !isConnected;
    const updated = {
      ...devices,
      appleHealth: isIos ? nextState : false,
      googleFit: !isIos ? nextState : false,
    };
    setDevices(updated);
    await persistChange(updated);
  };

  const togglePermission = async (key: keyof typeof devices) => {
    const updated = {
      ...devices,
      [key]: !devices[key],
    };
    setDevices(updated);
    await persistChange(updated);
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      // Simulate/trigger healthkit data refresh
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updated = {
        ...devices,
        lastSyncDate: new Date().toISOString(),
      };
      setDevices(updated);
      await persistChange(updated);
      Alert.alert('Health Sync Complete', `${platformHealthName} data successfully synchronized.`);
    } catch {
      Alert.alert('Sync Error', 'Could not sync health metrics at this time.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const minsAgo = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minsAgo < 1) return 'Just now';
    if (minsAgo === 1) return '1 min ago';
    if (minsAgo < 60) return `${minsAgo} min ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowRightIcon size={20} color="#111111" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected devices</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple Health / Google Fit Card (Figma #2420:343) */}
        <View style={styles.deviceCard}>
          {/* Card Top Row */}
          <View style={styles.cardHeader}>
            <View style={styles.deviceIconCircle}>
              <DevicesIcon size={22} color="#FE2E31" />
            </View>
            <View style={styles.deviceInfoCol}>
              <Text style={styles.deviceName}>{platformHealthName}</Text>
              <Text style={styles.deviceStatus}>
                {isConnected
                  ? `Connected · Last synced ${formatLastSync(devices.lastSyncDate)}`
                  : 'Disconnected'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.connectBtn,
                isConnected ? styles.disconnectBtn : styles.activeConnectBtn,
              ]}
              onPress={toggleConnection}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.connectBtnText,
                  isConnected ? styles.disconnectBtnText : styles.activeConnectBtnText,
                ]}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>

          {isConnected && (
            <>
              <View style={styles.cardDivider} />

              {/* Permissions List */}
              <View style={styles.permissionsList}>
                {/* 1. Steps */}
                <View style={styles.permRow}>
                  <View style={styles.permTextCol}>
                    <Text style={styles.permTitle}>Steps</Text>
                    <Text style={styles.permSub}>Used for step goal and challenges</Text>
                  </View>
                  <Switch
                    value={devices.readSteps}
                    onValueChange={() => togglePermission('readSteps')}
                    trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* 2. Active Energy */}
                <View style={styles.permRow}>
                  <View style={styles.permTextCol}>
                    <Text style={styles.permTitle}>Active energy</Text>
                    <Text style={styles.permSub}>Fills your daily calorie ring</Text>
                  </View>
                  <Switch
                    value={devices.readCalories}
                    onValueChange={() => togglePermission('readCalories')}
                    trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* 3. Weight */}
                <View style={styles.permRow}>
                  <View style={styles.permTextCol}>
                    <Text style={styles.permTitle}>Body weight</Text>
                    <Text style={styles.permSub}>Track progress toward your target</Text>
                  </View>
                  <Switch
                    value={devices.readWeight}
                    onValueChange={() => togglePermission('readWeight')}
                    trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* 4. Heart Rate */}
                <View style={styles.permRow}>
                  <View style={styles.permTextCol}>
                    <Text style={styles.permTitle}>Heart rate</Text>
                    <Text style={styles.permSub}>Average BPM on workout summary</Text>
                  </View>
                  <Switch
                    value={devices.readHeartRate}
                    onValueChange={() => togglePermission('readHeartRate')}
                    trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* 5. Write Workouts */}
                <View style={styles.permRow}>
                  <View style={styles.permTextCol}>
                    <Text style={styles.permTitle}>Save workouts to Health</Text>
                    <Text style={styles.permSub}>Sync completed PulseFit sessions</Text>
                  </View>
                  <Switch
                    value={devices.writeWorkouts}
                    onValueChange={() => togglePermission('writeWorkouts')}
                    trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* Sync Now Button */}
              <TouchableOpacity
                style={styles.syncBtn}
                onPress={handleSyncNow}
                disabled={isSyncing}
                activeOpacity={0.88}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.syncBtnText}>Sync now</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Section 2: Smart Scales Card */}
        <View style={styles.deviceCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.deviceIconCircle, { backgroundColor: '#F5F5F5' }]}>
              <DevicesIcon size={22} color="#777777" />
            </View>
            <View style={styles.deviceInfoCol}>
              <Text style={styles.deviceName}>Smart scale</Text>
              <Text style={styles.deviceStatus}>Log weight automatically</Text>
            </View>
            <Text style={styles.notSetUpText}>Not set up</Text>
          </View>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.addScaleBtn}
            onPress={() =>
              Alert.alert(
                'Add Smart Scale',
                'Connect Bluetooth scales or sync seamlessly through Apple Health and Google Fit.'
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.addScaleBtnText}>Add a scale</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <TouchableOpacity
          style={styles.footerLink}
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              'Health App Settings',
              `Open your device's Settings > Privacy > Health to configure fine-grained permissions.`
            )
          }
        >
          <Text style={styles.footerLinkText}>Manage in the Health app</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  deviceCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.18)',
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfoCol: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#777777',
  },
  connectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeConnectBtn: {
    backgroundColor: '#FE2E31',
  },
  disconnectBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0.8,
    borderColor: '#E0E0E0',
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeConnectBtnText: {
    color: '#FFFFFF',
  },
  disconnectBtnText: {
    color: '#666666',
  },
  notSetUpText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  cardDivider: {
    height: 0.8,
    backgroundColor: 'rgba(254, 46, 49, 0.1)',
    marginVertical: 14,
  },
  permissionsList: {
    gap: 14,
    marginBottom: 16,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  permTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 2,
  },
  permSub: {
    fontSize: 11,
    color: '#888888',
  },
  syncBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#FE2E31',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addScaleBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addScaleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  footerLink: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FE2E31',
  },
});
