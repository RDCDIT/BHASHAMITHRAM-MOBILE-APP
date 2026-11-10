/**
 * @file responsive.ts
 * @description Dynamic responsive utilities and layout scaling system for Phone, Tablet, Laptop, and Desktop.
 */

import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  SMALL_PHONE_MAX: 360,
  PHONE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
  LARGE_DESKTOP: 1280,
} as const;

export const MAX_CONTENT_WIDTHS = {
  FORM: 800,
  FEED: 900,
  DETAIL: 850,
  HOME: 640,
  MODAL: 520,
} as const;

// Base guideline dimensions (iPhone X / Standard Android viewport)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Calculates adaptive responsive metrics based on live screen width and height.
 */
export function getResponsiveMetrics(width: number, height: number) {
  const isSmallPhone = width <= 360 || height <= 700;
  const isTablet = width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX;
  const isDesktop = width >= BREAKPOINTS.DESKTOP_MIN;
  const isPhone = !isTablet && !isDesktop;
  const isTallPhone = isPhone && height > 800;

  // Horizontal scaling
  const scale = (size: number) => (width / BASE_WIDTH) * size;
  // Vertical scaling
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;
  // Moderate scaling
  const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

  // Adaptive Home Metrics tailored to form factor
  const containerMaxWidth = isDesktop ? 680 : isTablet ? 620 : "100%";
  const containerPadding = isSmallPhone ? 12 : isTablet ? 24 : isDesktop ? 32 : 16;

  const homeEmblemSize = isSmallPhone ? 68 : isTablet ? 96 : isDesktop ? 90 : (isTallPhone ? 84 : 76);
  const homeTitleFontSize = isSmallPhone ? 20 : isTablet ? 28 : isDesktop ? 26 : (isTallPhone ? 25 : 23);
  const homeSubtitleFontSize = isSmallPhone ? 8.5 : isTablet ? 12 : isDesktop ? 11.5 : (isTallPhone ? 10.5 : 9.5);
  const homeTaglineFontSize = isSmallPhone ? 11 : isTablet ? 14.5 : isDesktop ? 14 : (isTallPhone ? 13 : 12);

  // Dynamic Card Sizing:
  // Shell overhead: topNav (~50) + bottomTab (~65) + safeAreas (~50) = ~165
  // Content headers: Hero (~105) + Footer (~45) + paddings (~15) = ~165
  // Total non-card overhead = ~330
  const estimatedAvailable = Math.max(300, height - (isSmallPhone ? 280 : 330));
  const rawTargetMargin = isSmallPhone ? 8 : isTablet ? 14 : isDesktop ? 12 : (isTallPhone ? 13 : 10);
  const rawTargetHeight = Math.floor((estimatedAvailable - (4 * rawTargetMargin)) / 5);

  const minCardH = isSmallPhone ? 58 : isTablet ? 82 : isDesktop ? 76 : (isTallPhone ? 76 : 68);
  const maxCardH = isSmallPhone ? 66 : isTablet ? 92 : isDesktop ? 86 : (isTallPhone ? 84 : 78);
  const homeCardHeight = Math.min(maxCardH, Math.max(minCardH, rawTargetHeight));
  const homeCardMargin = rawTargetMargin;

  const homeCardPaddingH = isSmallPhone ? 14 : isTablet ? 20 : isDesktop ? 20 : 16;
  const homeItemTitleFontSize = isSmallPhone ? 14.5 : isTablet ? 19 : isDesktop ? 18 : (isTallPhone ? 17 : 15.5);
  const homeBadgeSize = isSmallPhone ? 42 : isTablet ? 56 : isDesktop ? 52 : (isTallPhone ? 50 : 46);
  const homeIconSize = isSmallPhone ? 20 : isTablet ? 26 : isDesktop ? 24 : (isTallPhone ? 24 : 22);
  const homeChevronSize = isSmallPhone ? 32 : isTablet ? 40 : isDesktop ? 36 : 34;

  // General Top Bar / Header Height
  const headerHeight = isSmallPhone ? 66 : isTablet ? 84 : isDesktop ? 80 : 72;
  const searchBarHeight = isSmallPhone ? 46 : isTablet ? 56 : 50;

  // Card Content Padding & Spacing
  const cardPadding = isSmallPhone ? 12 : isTablet ? 20 : 16;
  const cardMarginBottom = isSmallPhone ? 8 : isTablet ? 14 : 10;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : isSmallPhone ? 12 : 16;

  // Dictionary Entry Cards & Content
  const dictCardPadding = isSmallPhone ? 12 : isTablet ? 20 : 16;
  const dictCardMargin = isSmallPhone ? 8 : isTablet ? 14 : 10;
  const dictCardRadius = isSmallPhone ? 14 : 18;
  const dictWordFontSize = isSmallPhone ? 17 : isTablet ? 22 : 19;
  const dictMeaningFontSize = isSmallPhone ? 12.5 : isTablet ? 15.5 : 13.5;

  // Alphabet Strip
  const alphabetTabSize = isSmallPhone ? 34 : isTablet ? 46 : 38;
  const alphabetFontSize = isSmallPhone ? 12.5 : isTablet ? 16 : 14;
  const alphabetPadding = isSmallPhone ? 6 : 10;

  // Detail View Cards
  const detailWordCardPadding = isSmallPhone ? 16 : isTablet ? 26 : 20;
  const detailSectionPadding = isSmallPhone ? 14 : isTablet ? 22 : 18;
  const detailWordFontSize = isSmallPhone ? 22 : isTablet ? 30 : 26;

  // Header Typography
  const headerTitleFontSize = isSmallPhone ? 15 : isTablet ? 19 : 17;
  const headerSubtitleFontSize = isSmallPhone ? 11 : isTablet ? 14 : 12;

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTallPhone,
    isTablet,
    isDesktop,
    scale,
    verticalScale,
    moderateScale,
    // Home layout metrics
    containerMaxWidth,
    containerPadding,
    homeEmblemSize,
    homeTitleFontSize,
    homeSubtitleFontSize,
    homeTaglineFontSize,
    homeCardHeight,
    homeCardMargin,
    homeCardPaddingH,
    homeItemTitleFontSize,
    homeBadgeSize,
    homeIconSize,
    homeChevronSize,
    // General screens metrics
    headerHeight,
    searchBarHeight,
    cardPadding,
    cardMarginBottom,
    horizontalPadding,
    // Dictionary entry metrics
    dictCardPadding,
    dictCardMargin,
    dictCardRadius,
    dictWordFontSize,
    dictMeaningFontSize,
    alphabetTabSize,
    alphabetFontSize,
    alphabetPadding,
    // Detail screen metrics
    detailWordCardPadding,
    detailSectionPadding,
    detailWordFontSize,
    // Header typography
    headerTitleFontSize,
    headerSubtitleFontSize,
    contentMaxWidth: isDesktop ? 680 : isTablet ? 600 : "100%",
    formMaxWidth: isDesktop ? 680 : isTablet ? 600 : "100%",
  };
}

/**
 * Hook providing dynamic responsive measurements that update live on screen changes.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return getResponsiveMetrics(width, height);
}
