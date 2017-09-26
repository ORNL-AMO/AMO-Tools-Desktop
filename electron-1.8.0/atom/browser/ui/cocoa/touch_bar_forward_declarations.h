// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_UI_COCOA_TOUCH_BAR_FORWARD_DECLARATIONS_H_
#define ATOM_BROWSER_UI_COCOA_TOUCH_BAR_FORWARD_DECLARATIONS_H_

// Once Chrome no longer supports OSX 10.12.0, this file can be deleted.

#import <Foundation/Foundation.h>

#if !defined(MAC_OS_X_VERSION_10_12_1)

#pragma clang assume_nonnull begin

@class NSTouchBar, NSTouchBarItem;
@class NSScrubber, NSScrubberItemView, NSScrubberArrangedView, NSScrubberTextItemView, NSScrubberImageItemView, NSScrubberSelectionStyle;
@protocol NSTouchBarDelegate, NSScrubberDelegate, NSScrubberDataSource;

typedef float NSTouchBarItemPriority;
static const NSTouchBarItemPriority NSTouchBarItemPriorityHigh = 1000;
static const NSTouchBarItemPriority NSTouchBarItemPriorityNormal = 0;
static const NSTouchBarItemPriority NSTouchBarItemPriorityLow = -1000;

enum NSScrubberMode {
  NSScrubberModeFixed = 0,
  NSScrubberModeFree
};

typedef NSString* NSTouchBarItemIdentifier;
typedef NSString* NSTouchBarCustomizationIdentifier;

static const NSTouchBarItemIdentifier NSTouchBarItemIdentifierFixedSpaceSmall =
    @"NSTouchBarItemIdentifierFixedSpaceSmall";

static const NSTouchBarItemIdentifier NSTouchBarItemIdentifierFixedSpaceLarge =
    @"NSTouchBarItemIdentifierFixedSpaceLarge";

static const NSTouchBarItemIdentifier NSTouchBarItemIdentifierFlexibleSpace =
    @"NSTouchBarItemIdentifierFlexibleSpace";

static const NSTouchBarItemIdentifier NSTouchBarItemIdentifierOtherItemsProxy =
    @"NSTouchBarItemIdentifierOtherItemsProxy";

@interface NSTouchBar : NSObject<NSCoding>

- (instancetype)init NS_DESIGNATED_INITIALIZER;
- (nullable instancetype)initWithCoder:(NSCoder*)aDecoder
    NS_DESIGNATED_INITIALIZER;

@property(copy, nullable)
    NSTouchBarCustomizationIdentifier customizationIdentifier;
@property(copy) NSArray* customizationAllowedItemIdentifiers;
@property(copy) NSArray* customizationRequiredItemIdentifiers;
@property(copy) NSArray* defaultItemIdentifiers;
@property(copy, readonly) NSArray* itemIdentifiers;
@property(copy, nullable) NSTouchBarItemIdentifier principalItemIdentifier;
@property(copy, nullable) NSTouchBarItemIdentifier escapeKeyReplacementItemIdentifier;
@property(copy) NSSet* templateItems;
@property(nullable, weak) id<NSTouchBarDelegate> delegate;

- (nullable __kindof NSTouchBarItem*)itemForIdentifier:
    (NSTouchBarItemIdentifier)identifier;

@property(readonly, getter=isVisible) BOOL visible;

@end

@interface NSTouchBarItem : NSObject<NSCoding>

- (instancetype)initWithIdentifier:(NSTouchBarItemIdentifier)identifier
    NS_DESIGNATED_INITIALIZER;
- (nullable instancetype)initWithCoder:(NSCoder*)coder
    NS_DESIGNATED_INITIALIZER;
- (instancetype)init NS_UNAVAILABLE;

@property(readonly, copy) NSTouchBarItemIdentifier identifier;
@property NSTouchBarItemPriority visibilityPriority;
@property(readonly, nullable) NSView* view;
@property(readonly, nullable) NSViewController* viewController;
@property(readwrite, copy) NSString* customizationLabel;
@property(readonly, getter=isVisible) BOOL visible;

@end

@interface NSGroupTouchBarItem : NSTouchBarItem

+ (NSGroupTouchBarItem*)groupItemWithIdentifier:
                            (NSTouchBarItemIdentifier)identifier
                                          items:(NSArray*)items;

@property(strong) NSTouchBar* groupTouchBar;
@property(readwrite, copy, null_resettable) NSString* customizationLabel;

@end

@interface NSCustomTouchBarItem : NSTouchBarItem

@property(readwrite, strong) __kindof NSView* view;
@property(readwrite, strong, nullable)
    __kindof NSViewController* viewController;
@property(readwrite, copy, null_resettable) NSString* customizationLabel;

@end

@interface NSColorPickerTouchBarItem : NSTouchBarItem

@property SEL action;
@property(weak) id target;
@property(copy) NSColor* color;
@property(strong) NSColorList* colorList;

@end

@interface NSPopoverTouchBarItem : NSTouchBarItem

@property BOOL showsCloseButton;
@property(strong) NSImage* collapsedRepresentationImage;
@property(strong) NSString* collapsedRepresentationLabel;
@property(strong) NSTouchBar* popoverTouchBar;

@end

@interface NSSliderTouchBarItem : NSTouchBarItem

@property SEL action;
@property(weak) id target;
@property(copy) NSString* label;
@property(strong) NSSlider* slider;

@end

@interface NSScrubber : NSView

@property(weak) id<NSScrubberDelegate> delegate;
@property(weak) id<NSScrubberDataSource> dataSource;
@property NSScrubberMode mode;
@property BOOL showsArrowButtons;
@property(getter=isContinuous) BOOL continuous;
@property(strong, nullable) NSScrubberSelectionStyle* selectionBackgroundStyle;
@property(strong, nullable) NSScrubberSelectionStyle* selectionOverlayStyle;

- (void)registerClass:(Class)itemViewClass
    forItemIdentifier:(NSString*)itemIdentifier;

- (__kindof NSScrubberItemView*)makeItemWithIdentifier:(NSString*)itemIdentifier
                                                 owner:(id)owner;
- (void)reloadData;

@end

@interface NSScrubberSelectionStyle : NSObject<NSCoding>

@property(class, strong, readonly) NSScrubberSelectionStyle* outlineOverlayStyle;
@property(class, strong, readonly) NSScrubberSelectionStyle* roundedBackgroundStyle;

@end

@interface NSScrubberArrangedView : NSView

@end

@interface NSScrubberItemView : NSScrubberArrangedView

@end

@interface NSScrubberTextItemView : NSScrubberItemView

@property(copy) NSString* title;

@end

@interface NSScrubberImageItemView : NSScrubberItemView

@property(copy) NSImage* image;

@end

@interface NSWindow (TouchBarSDK)

@property(strong, readwrite, nullable) NSTouchBar* touchBar;

@end

@interface NSButton (TouchBarSDK)

@property(copy) NSColor* bezelColor;
+ (instancetype)buttonWithTitle:(NSString*)title
                         target:(id)target
                         action:(SEL)action;

@end

@interface NSTextField (TouchBarSDK)

+ (instancetype)labelWithString:(NSString*)stringValue;

@end

@interface NSSegmentedControl (TouchBarSDK)

+ (instancetype)segmentedControlWithLabels:(NSArray*)labels
                              trackingMode:(NSSegmentSwitchTracking)trackingMode
                                    target:(id)target
                                    action:(SEL)action;

@end

@protocol NSTouchBarDelegate<NSObject>

@optional
- (nullable NSTouchBarItem*)touchBar:(NSTouchBar*)touchBar
               makeItemForIdentifier:(NSTouchBarItemIdentifier)identifier;

@end

@protocol NSScrubberDelegate<NSObject>

- (void)scrubber:(NSScrubber*)scrubber didHighlightItemAtIndex:(NSInteger)highlightedIndex;
- (void)scrubber:(NSScrubber*)scrubber didSelectItemAtIndex:(NSInteger)selectedIndex;

@end

@protocol NSScrubberDataSource<NSObject>

- (NSInteger)numberOfItemsForScrubber:(NSScrubber*)scrubber;
- (__kindof NSScrubberItemView*)scrubber:(NSScrubber*)scrubber
                       viewForItemAtIndex:(NSInteger)index;

@end

#pragma clang assume_nonnull end

#elif MAC_OS_X_VERSION_MIN_REQUIRED < MAC_OS_X_VERSION_10_12_1

// When compiling against the 10.12.1 SDK or later, just provide forward
// declarations to suppress the partial availability warnings.

@class NSCustomTouchBarItem;
@class NSGroupTouchBarItem;
@class NSTouchBar;
@protocol NSTouchBarDelegate;
@class NSTouchBarItem;

@interface NSWindow (TouchBarSDK)
@property(strong, readonly) NSTouchBar* touchBar;
@end

#endif  // MAC_OS_X_VERSION_10_12_1

#endif  // ATOM_BROWSER_UI_COCOA_TOUCH_BAR_FORWARD_DECLARATIONS_H_
