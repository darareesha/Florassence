
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image,
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { getProfile, saveProfile } from '../services/storage';
import useNetworkStatus from '../hooks/useNetworkStatus';
import useAppState from '../hooks/useAppState';
import BottomSheet, { SheetAction } from '../components/BottomSheet';
import Toast, { useToast } from '../components/Toast';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { promptOpenSettings } from '../utils/permissions';
import { colors, spacing, radius, fontSizes, shadows } from '../constants/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIO_MAX = 150;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { isConnected } = useNetworkStatus();
  const { toast, showToast, hideToast } = useToast();

  const [loading,  setLoading]  = useState(true);
  const [loadErr,  setLoadErr]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  const [avatarUri, setAvatarUri]           = useState(null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [removeSheetOpen, setRemoveSheetOpen] = useState(false);

  const [locationOn, setLocationOn]     = useState(false);
  const [coords, setCoords]             = useState(null);      
  const [placeLabel, setPlaceLabel]     = useState(null);       
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false); 

  const emailRef = useRef(null);
  const bioRef   = useRef(null);

  const {
    control, handleSubmit, reset, trigger, watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: { name: '', email: '', bio: '' },
  });
  const bioValue = watch('bio') || '';

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const p = await getProfile();
      reset({ name: p?.name || '', email: p?.email || '', bio: p?.bio || '' });
      setAvatarUri(p?.avatarUri || null);
      if (p?.location) {
        setCoords(p.location);
        setLocationOn(true);
      }
    } catch (e) {
      setLoadErr('Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (!loading) trigger();
  }, [loading, trigger]);

  const recheckLocationPermission = useCallback(async () => {
    if (!locationBlocked) return;
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) {
      setLocationBlocked(false);
      showToast('success', 'Location permission is enabled — toggle it on below.');
    }
  }, [locationBlocked, showToast]);

  useAppState({ onForeground: recheckLocationPermission });

  async function ensureCameraPermission() {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) {
      promptOpenSettings('Camera access is turned off for Florassence. Enable it in Settings to take a new photo.');
      return false;
    }
    const requested = await ImagePicker.requestCameraPermissionsAsync();
    if (!requested.granted && !requested.canAskAgain) {
      promptOpenSettings('Camera access is turned off for Florassence. Enable it in Settings to take a new photo.');
    }
    return requested.granted;
  }

  async function ensureLibraryPermission() {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) {
      promptOpenSettings('Photo library access is turned off for Florassence. Enable it in Settings to choose a photo.');
      return false;
    }
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!requested.granted && !requested.canAskAgain) {
      promptOpenSettings('Photo library access is turned off for Florassence. Enable it in Settings to choose a photo.');
    }
    return requested.granted;
  }

  const handleTakePhoto = useCallback(async () => {
    setPhotoSheetOpen(false);
    const ok = await ensureCameraPermission();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!result.canceled && result.assets?.[0]?.uri) setAvatarUri(result.assets[0].uri);
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    setPhotoSheetOpen(false);
    const ok = await ensureLibraryPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setAvatarUri(result.assets[0].uri);
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setPhotoSheetOpen(false);
    setRemoveSheetOpen(true);
  }, []);

  const confirmRemovePhoto = useCallback(() => {
    setAvatarUri(null);
    setRemoveSheetOpen(false);
  }, []);

  async function tryReverseGeocode(point) {
    if (!isConnected) return null;
    try {
      const [place] = await Location.reverseGeocodeAsync(point);
      if (!place) return null;
      return [place.city, place.region].filter(Boolean).join(', ');
    } catch {
      return null;
    }
  }

  async function handleToggleLocation(next) {
    if (!next) {
      setLocationOn(false);
      setCoords(null);
      setPlaceLabel(null);
      return;
    }

    setLocationBusy(true);
    try {
      const current = await Location.getForegroundPermissionsAsync();
      let granted = current.granted;

      if (!granted) {
        if (!current.canAskAgain) {
          setLocationBlocked(true);
          promptOpenSettings('Location access is turned off for Florassence. Enable it in Settings to show your coordinates.');
          return;
        }
        const requested = await Location.requestForegroundPermissionsAsync();
        granted = requested.granted;
        if (!granted && !requested.canAskAgain) {
          setLocationBlocked(true);
          promptOpenSettings('Location access is turned off for Florassence. Enable it in Settings to show your coordinates.');
          return;
        }
      }

      if (!granted) {
        showToast('warning', 'Location permission was declined — you can try again anytime.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(point);
      setLocationOn(true);
      setLocationBlocked(false);
      setPlaceLabel(await tryReverseGeocode(point));
    } catch (e) {
      showToast('error', 'Could not get your location right now.');
    } finally {
      setLocationBusy(false);
    }
  }

  const onSave = handleSubmit(async (values) => {
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      bio: values.bio.trim(),
      avatarUri: avatarUri || null,
      location: locationOn && coords ? coords : null,
    };
    const ok = await saveProfile(payload);
    setSaving(false);

    if (ok) {
      showToast('success', 'Profile saved 🌿');
      reset(values);
    } else {
      showToast('error', "Couldn't save your changes. Please try again.");
    }
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoadingState message="Loading your profile…" />
      </SafeAreaView>
    );
  }
  if (loadErr) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ErrorState message={loadErr} onRetry={loadProfile} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.pageTitle}>🧑 Edit Profile</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Offline banner — informational only; everything here still saves
            locally, so we never block the form, just set expectations. */}
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={15} color={colors.warning} />
            <Text style={styles.offlineText}>You're offline — changes are saved on this device.</Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.avatarSection}>
            <Pressable onPress={() => setPhotoSheetOpen(true)} style={styles.avatarPressable}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={34} color={colors.primary} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={colors.textInverse} />
              </View>
            </Pressable>
            <Pressable onPress={() => setPhotoSheetOpen(true)}>
              <Text style={styles.avatarHint}>{avatarUri ? 'Change photo' : 'Add a photo'}</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Name *</Text>
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Please tell us your name',
              minLength: { value: 2, message: 'That name looks a little short' },
              maxLength: { value: 40, message: 'Keep it under 40 characters' },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={[styles.inputWrap, errors.name && styles.inputWrapError]}>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  maxLength={40}
                />
              </View>
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Text style={styles.fieldLabel}>Email</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              validate: (value) => !value || EMAIL_RE.test(value.trim()) || "That doesn't look like a valid email",
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => bioRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <Text style={styles.charCount}>{bioValue.length}/{BIO_MAX}</Text>
          </View>
          <Controller
            control={control}
            name="bio"
            rules={{ maxLength: { value: BIO_MAX, message: `Keep it under ${BIO_MAX} characters` } }}
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={[styles.inputWrap, styles.textareaWrap, errors.bio && styles.inputWrapError]}>
                <TextInput
                  ref={bioRef}
                  style={[styles.input, styles.textarea]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="A little about you…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={BIO_MAX}
                  returnKeyType="done"
                />
              </View>
            )}
          />
          {errors.bio && <Text style={styles.errorText}>{errors.bio.message}</Text>}

          {/* ── Optional location ──────────────────────────────────────────── */}
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>📍 Add my location</Text>
                <Text style={styles.locationSub}>Optional — shown only if you allow it</Text>
              </View>
              <Switch
                value={locationOn}
                onValueChange={handleToggleLocation}
                disabled={locationBusy}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            {locationBusy && <Text style={styles.locationStatus}>Getting your location…</Text>}

            {!locationBusy && locationOn && coords && (
              <Text style={styles.locationStatus}>
                {placeLabel ? `📌 ${placeLabel}` : `📌 ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`}
              </Text>
            )}

            {!locationBusy && locationBlocked && (
              <Pressable onPress={() => promptOpenSettings('Location access is turned off for Florassence. Enable it in Settings to show your coordinates.')}>
                <Text style={styles.locationDenied}>Permission blocked — tap to open Settings</Text>
              </Pressable>
            )}
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              (!isValid || isSubmitting || saving) && styles.saveBtnDisabled,
              pressed && isValid && { opacity: 0.9 },
            ]}
            onPress={onSave}
            disabled={!isValid || isSubmitting || saving}
          >
            <Ionicons name="checkmark-circle" size={19} color={colors.textInverse} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Profile'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={photoSheetOpen} onClose={() => setPhotoSheetOpen(false)} title="Profile Photo">
        <SheetAction icon="camera-outline" label="Take Photo" onPress={handleTakePhoto} />
        <SheetAction icon="images-outline" label="Choose from Library" onPress={handlePickFromLibrary} />
        {avatarUri && (
          <SheetAction icon="trash-outline" label="Remove Photo" destructive onPress={handleRemovePhoto} />
        )}
      </BottomSheet>

      <BottomSheet visible={removeSheetOpen} onClose={() => setRemoveSheetOpen(false)} title="Remove this photo?">
        <SheetAction icon="trash-outline" label="Yes, remove it" destructive onPress={confirmRemovePhoto} />
      </BottomSheet>

      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  pageTitle: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.text },

  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.warningSoft,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  offlineText: { fontSize: fontSizes.xs, color: colors.warning, fontWeight: '600' },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatarPressable: { position: 'relative' },
  avatarImage: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 2, borderColor: colors.goldBright + '66',
  },
  avatarPlaceholder: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  avatarHint: { marginTop: spacing.sm, fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },

  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  fieldLabel: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  charCount: { fontSize: fontSizes.xxs, color: colors.textMuted, marginBottom: spacing.xs },

  inputWrap: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.xs,
  },
  inputWrapError: { borderColor: colors.danger },
  input: { fontSize: fontSizes.body, color: colors.text, paddingVertical: spacing.md },
  textareaWrap: { paddingVertical: spacing.xs },
  textarea: { minHeight: 76, textAlignVertical: 'top', paddingVertical: spacing.sm },
  errorText: { fontSize: fontSizes.xs, color: colors.danger, marginTop: 4, fontWeight: '600' },

  locationCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.xs,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  locationLabel: { fontSize: fontSizes.body, fontWeight: '700', color: colors.text },
  locationSub: { fontSize: fontSizes.xxs, color: colors.textMuted, marginTop: 2 },
  locationStatus: { marginTop: spacing.sm, fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  locationDenied: { marginTop: spacing.sm, fontSize: fontSizes.sm, color: colors.danger, fontWeight: '600' },

  bottomBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    ...shadows.md,
  },
  saveBtnDisabled: { backgroundColor: colors.textDisabled, ...shadows.xs },
  saveBtnText: { fontSize: fontSizes.sub, fontWeight: '700', color: colors.textInverse },
});
