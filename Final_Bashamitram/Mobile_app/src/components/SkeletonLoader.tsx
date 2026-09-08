/**
 * @file SkeletonLoader.tsx
 * @description Skeleton card loading animation placeholder for dictionary query results.
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

/**
 * SkeletonLoader component rendering repeated cards with pulsing transparency.
 * 
 * @returns {React.JSX.Element}
 */
export default function SkeletonLoader() {
  const [opacity] = React.useState(() => new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  /**
 * Renders an individual animated card structure with empty layout placeholders.
 * 
 * @param {number} key - React item key identifier.
 * @returns {React.JSX.Element}
 */
  const renderSkeletonCard = (key: number) => (
    <Animated.View key={key} style={[styles.card, { opacity }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <View style={styles.lineLong} />
          <View style={styles.lineSub} />
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={styles.playButton} />
        </View>
      </View>
      <View style={styles.definitionBox}>
        <View style={styles.lineHeader} />
        <View style={styles.lineMedium} />
        <View style={styles.lineShort} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((num) => renderSkeletonCard(num))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  lineLong: {
    width: "55%",
    height: 18,
    backgroundColor: "#EBEBEB",
    borderRadius: 9,
    marginBottom: 8,
  },
  lineSub: {
    width: "40%",
    height: 14,
    backgroundColor: "#ECECEC",
    borderRadius: 7,
  },
  badge: {
    width: 45,
    height: 24,
    backgroundColor: "#EAEAEA",
    borderRadius: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    marginLeft: 10,
  },
  definitionBox: {
    backgroundColor: "#F5F5F7",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  lineHeader: {
    width: "25%",
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 10,
  },
  lineMedium: {
    width: "85%",
    height: 12,
    backgroundColor: "#EAEAEA",
    borderRadius: 6,
    marginBottom: 8,
  },
  lineShort: {
    width: "60%",
    height: 12,
    backgroundColor: "#EAEAEA",
    borderRadius: 6,
  },
});
