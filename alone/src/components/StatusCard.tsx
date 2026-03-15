import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { StatusWithProfile } from '../types/database';

type Props = {
  status: StatusWithProfile;
  onWorkTogether?: () => void;
  isOwnStatus?: boolean;
};

function getElapsedMinutes(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
}

function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export default function StatusCard({ status, onWorkTogether, isOwnStatus }: Props) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(status.started_at));

  useEffect(() => {
    if (!status.is_active) return;
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes(status.started_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [status.started_at, status.is_active]);

  const displayName = status.profiles.display_name ?? status.profiles.username;

  return (
    <View style={[styles.card, !status.is_active && styles.cardInactive]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            {status.is_active && <View style={styles.activeDot} />}
          </View>
          <Text style={styles.content}>{status.content}</Text>
        </View>
        <Text style={styles.elapsed}>
          {status.is_active ? formatElapsed(elapsed) : '終了'}
        </Text>
      </View>

      {!isOwnStatus && status.is_active && onWorkTogether && (
        <TouchableOpacity style={styles.workTogetherBtn} onPress={onWorkTogether}>
          <Text style={styles.workTogetherText}>一緒にやろう</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInactive: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusActive,
  },
  content: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  elapsed: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  workTogetherBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-end',
  },
  workTogetherText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
