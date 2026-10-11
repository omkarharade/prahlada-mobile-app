import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageRequireSource,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type CountModalProps = {
  visible: boolean;
  title: string;
  date: Date;
  icon: ImageRequireSource;
  value: number;
  unit: string;
  goal: number;
  onClose: () => void;
  onSave: (count: number) => void;
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export default function CountModal({
  visible,
  title,
  date,
  icon,
  value,
  unit,
  goal,
  onClose,
  onSave,
}: CountModalProps) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    if (visible) {
      setCount(value);
    }
  }, [value, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.date}>{formatDate(date)}</Text>
            </View>
            <View style={styles.iconBackground}>
              <Image source={icon} style={styles.icon} />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.counter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Decrease ${unit}`}
                disabled={count === 0}
                onPress={() => setCount(current => Math.max(0, current - 1))}
                style={styles.counterButton}>
                <Text style={styles.counterButtonText}>−</Text>
              </Pressable>
              <View style={styles.counterValueContainer}>
                <Text style={styles.counterValue}>{count}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Increase ${unit}`}
                onPress={() => setCount(current => current + 1)}
                style={styles.counterButton}>
                <Text style={styles.counterButtonText}>+</Text>
              </Pressable>
            </View>
            <View style={styles.progress}>
              <Text style={styles.progressLabel}>Today</Text>
              <Text style={styles.progressValue}>{count} / {goal} {unit}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.action}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(count)}
              style={[styles.action, styles.confirmAction]}>
              <Text style={styles.confirmText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modal: {
    backgroundColor: '#F8F6F8',
    borderRadius: 28,
    maxWidth: 480,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#EEE9ED',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 102,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heading: {gap: 8},
  title: {color: '#493E47', fontSize: 20, fontWeight: '700'},
  date: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2D8ED',
    borderRadius: 4,
    color: '#A84A9C',
    fontSize: 15,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  iconBackground: {
    alignItems: 'center',
    backgroundColor: '#C72DA9',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  icon: {height: 30, tintColor: '#FFFFFF', width: 30},
  content: {
    borderBottomColor: '#EEE9ED',
    borderBottomWidth: 1,
    gap: 14,
    paddingHorizontal: 26,
    paddingVertical: 25,
  },
  counter: {
    alignItems: 'center',
    backgroundColor: '#F4EEF2',
    borderColor: '#EAE2E8',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    height: 100,
    overflow: 'hidden',
  },
  counterButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: '20%',
  },
  counterButtonText: {color: '#6B5765', fontSize: 34, fontWeight: '300'},
  counterValueContainer: {
    alignItems: 'center',
    borderLeftColor: '#E8E0E6',
    borderLeftWidth: 1,
    borderRightColor: '#E8E0E6',
    borderRightWidth: 1,
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  counterValue: {
    backgroundColor: '#E6A8D9',
    color: '#45343F',
    fontSize: 35,
    fontWeight: '700',
    minWidth: 31,
    textAlign: 'center',
  },
  progress: {
    alignItems: 'center',
    backgroundColor: '#F4EEF2',
    borderColor: '#EAE2E8',
    borderRadius: 17,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
  },
  progressLabel: {color: '#938791', fontSize: 14},
  progressValue: {color: '#817580', fontSize: 20, marginTop: 2},
  actions: {flexDirection: 'row', height: 76},
  action: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  confirmAction: {borderLeftColor: '#EEE9ED', borderLeftWidth: 1},
  cancelText: {color: '#493E47', fontSize: 16, fontWeight: '600'},
  confirmText: {color: '#C72DA9', fontSize: 16, fontWeight: '700'},
});
