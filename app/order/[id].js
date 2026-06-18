import { useRef } from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Text } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/theme';

// Kampala, Uganda coordinates
const RESTAURANT_LAT = 0.3163;
const RESTAURANT_LNG = 32.5811;
const CUSTOMER_LAT = 0.3350;
const CUSTOMER_LNG = 32.5729;
const DRIVER_LAT = 0.3260;
const DRIVER_LNG = 32.5770;

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .custom-pin {
      width: 32px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .pin-dot {
      width: 14px; height: 14px; border-radius: 50%;
      position: absolute; top: 6px; left: 9px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([${DRIVER_LAT}, ${DRIVER_LNG}], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Restaurant marker (red)
    var restaurantIcon = L.divIcon({
      html: '<div style="width:36px;height:36px;border-radius:50%;background:#FF6B35;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: '',
    });
    L.marker([${RESTAURANT_LAT}, ${RESTAURANT_LNG}], { icon: restaurantIcon }).addTo(map);

    // Customer marker (green)
    var customerIcon = L.divIcon({
      html: '<div style="width:36px;height:36px;border-radius:50%;background:#2ECC71;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: '',
    });
    L.marker([${CUSTOMER_LAT}, ${CUSTOMER_LNG}], { icon: customerIcon }).addTo(map);

    // Driver marker (orange, animated)
    var driverIcon = L.divIcon({
      html: '<div style="width:42px;height:42px;border-radius:50%;background:#FF6B35;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,107,53,0.5);animation:pulse 2s infinite"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      className: '',
    });
    var driverMarker = L.marker([${DRIVER_LAT}, ${DRIVER_LNG}], { icon: driverIcon }).addTo(map);

    // Route line
    var routeCoords = [
      [${RESTAURANT_LAT}, ${RESTAURANT_LNG}],
      [0.3185, 32.5790],
      [0.3210, 32.5768],
      [0.3240, 32.5755],
      [${DRIVER_LAT}, ${DRIVER_LNG}],
      [0.3290, 32.5745],
      [0.3320, 32.5735],
      [${CUSTOMER_LAT}, ${CUSTOMER_LNG}],
    ];
    L.polyline(routeCoords, { color: '#FF6B35', weight: 4, opacity: 0.8, dashArray: '10, 8' }).addTo(map);

    // Fit bounds
    map.fitBounds([
      [${RESTAURANT_LAT}, ${RESTAURANT_LNG}],
      [${CUSTOMER_LAT}, ${CUSTOMER_LNG}],
    ], { padding: [50, 50] });

    // Add pulse animation CSS
    var style = document.createElement('style');
    style.textContent = '@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,53,0.4); } 70% { box-shadow: 0 0 0 15px rgba(255,107,53,0); } 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0); } }';
    document.head.appendChild(style);
  </script>
</body>
</html>
`;

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text variant="h3">Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />
      </View>

      {/* Bottom card — order info */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + spacing.base }]}>
        <View style={styles.estimateRow}>
          <View style={styles.estimateBadge}>
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text variant="bodySmall" style={styles.estimateText}>Estimated: 20 min</Text>
          </View>
          <View style={styles.statusDot} />
          <Text variant="bodySmall" style={styles.statusText}>On the way</Text>
        </View>

        <View style={styles.divider} />

        {/* Restaurant info */}
        <View style={styles.restaurantRow}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100' }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <Text variant="body" style={styles.restaurantName}>Uttora Coffee House</Text>
            <Text variant="caption">Ordered At 06 Sept, 10:00pm</Text>
            <View style={styles.orderItems}>
              <Text variant="caption">2x Burger</Text>
              <Text variant="caption">4x Sandwich</Text>
            </View>
          </View>
        </View>

        {/* Driver info */}
        <View style={styles.driverRow}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={18} color={colors.textInverse} />
            </View>
            <View>
              <Text variant="body" style={styles.driverName}>Robert K.</Text>
              <Text variant="caption">Your delivery driver</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="call" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="chatbubble" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  bottomCard: {
    backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 8,
  },
  estimateRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  estimateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryLight, paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  estimateText: { fontWeight: '600', color: colors.primary, fontSize: 13 },
  statusDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary,
  },
  statusText: { fontWeight: '600', color: colors.secondary, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.borderLight },
  restaurantRow: {
    flexDirection: 'row', gap: spacing.md,
  },
  restaurantImage: { width: 56, height: 56, borderRadius: radius.md },
  restaurantInfo: { flex: 1, gap: 2 },
  restaurantName: { fontWeight: '700', fontSize: 15 },
  orderItems: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  driverRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg,
    padding: spacing.md,
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  driverAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  driverName: { fontWeight: '700' },
  driverActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
});
