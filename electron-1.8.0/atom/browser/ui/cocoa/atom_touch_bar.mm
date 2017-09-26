// Copyright (c) 2017 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#import "atom/browser/ui/cocoa/atom_touch_bar.h"

#include "atom/common/color_util.h"
#include "atom/common/native_mate_converters/image_converter.h"
#include "base/strings/sys_string_conversions.h"
#include "skia/ext/skia_utils_mac.h"
#include "ui/gfx/image/image.h"

@implementation AtomTouchBar

static NSTouchBarItemIdentifier ButtonIdentifier = @"com.electron.touchbar.button.";
static NSTouchBarItemIdentifier ColorPickerIdentifier = @"com.electron.touchbar.colorpicker.";
static NSTouchBarItemIdentifier GroupIdentifier = @"com.electron.touchbar.group.";
static NSTouchBarItemIdentifier LabelIdentifier = @"com.electron.touchbar.label.";
static NSTouchBarItemIdentifier PopoverIdentifier = @"com.electron.touchbar.popover.";
static NSTouchBarItemIdentifier SliderIdentifier = @"com.electron.touchbar.slider.";
static NSTouchBarItemIdentifier SegmentedControlIdentifier = @"com.electron.touchbar.segmentedcontrol.";
static NSTouchBarItemIdentifier ScrubberIdentifier = @"com.electron.touchbar.scrubber.";

static NSString* const TextScrubberItemIdentifier = @"scrubber.text.item";
static NSString* const ImageScrubberItemIdentifier = @"scrubber.image.item";

- (id)initWithDelegate:(id<NSTouchBarDelegate>)delegate
                window:(atom::NativeWindow*)window
              settings:(const std::vector<mate::PersistentDictionary>&)settings {
  if ((self = [super init])) {
    delegate_ = delegate;
    window_ = window;
    ordered_settings_ = settings;
  }
  return self;
}

- (NSTouchBar*)makeTouchBar {
  NSMutableArray* identifiers = [self identifiersFromSettings:ordered_settings_];
  return [self touchBarFromItemIdentifiers:identifiers];
}

- (NSTouchBar*)touchBarFromItemIdentifiers:(NSMutableArray*)items {
  base::scoped_nsobject<NSTouchBar> bar(
      [[NSClassFromString(@"NSTouchBar") alloc] init]);
  [bar setDelegate:delegate_];
  [bar setDefaultItemIdentifiers:items];
  return bar.autorelease();
}

- (NSMutableArray*)identifiersFromSettings:(const std::vector<mate::PersistentDictionary>&)dicts {
  NSMutableArray* identifiers = [NSMutableArray array];

  for (const auto& item : dicts) {
    std::string type;
    std::string item_id;
    if (item.Get("type", &type) && item.Get("id", &item_id)) {
      NSTouchBarItemIdentifier identifier = nil;
      if (type == "spacer") {
        std::string size;
        item.Get("size", &size);
        if (size == "large") {
          identifier = NSTouchBarItemIdentifierFixedSpaceLarge;
        } else if (size == "flexible") {
          identifier = NSTouchBarItemIdentifierFlexibleSpace;
        } else {
          identifier = NSTouchBarItemIdentifierFixedSpaceSmall;
        }
      } else {
        identifier = [self identifierFromID:item_id type:type];
      }

      if (identifier) {
        settings_[item_id] = item;
        [identifiers addObject:identifier];
      }
    }
  }
  [identifiers addObject:NSTouchBarItemIdentifierOtherItemsProxy];

  return identifiers;
}

- (NSTouchBarItem*)makeItemForIdentifier:(NSTouchBarItemIdentifier)identifier {
  NSString* item_id = nil;

  if ([identifier hasPrefix:ButtonIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:ButtonIdentifier];
    return [self makeButtonForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:LabelIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:LabelIdentifier];
    return [self makeLabelForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:ColorPickerIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:ColorPickerIdentifier];
    return [self makeColorPickerForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:SliderIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:SliderIdentifier];
    return [self makeSliderForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:PopoverIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:PopoverIdentifier];
    return [self makePopoverForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:GroupIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:GroupIdentifier];
    return [self makeGroupForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:SegmentedControlIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:SegmentedControlIdentifier];
    return [self makeSegmentedControlForID:item_id withIdentifier:identifier];
  } else if ([identifier hasPrefix:ScrubberIdentifier]) {
    item_id = [self idFromIdentifier:identifier withPrefix:ScrubberIdentifier];
    return [self makeScrubberForID:item_id withIdentifier:identifier];
  }

  return nil;
}

- (void)refreshTouchBarItem:(NSTouchBar*)touchBar
                         id:(NSTouchBarItemIdentifier)identifier
                   withType:(const std::string&)item_type
               withSettings:(const mate::PersistentDictionary&)settings {
  NSTouchBarItem* item = [touchBar itemForIdentifier:identifier];
  if (!item) return;

  if (item_type == "button") {
    [self updateButton:(NSCustomTouchBarItem*)item withSettings:settings];
  } else if (item_type == "label") {
    [self updateLabel:(NSCustomTouchBarItem*)item withSettings:settings];
  } else if (item_type == "colorpicker") {
    [self updateColorPicker:(NSColorPickerTouchBarItem*)item
               withSettings:settings];
  } else if (item_type == "slider") {
    [self updateSlider:(NSSliderTouchBarItem*)item withSettings:settings];
  } else if (item_type == "popover") {
    [self updatePopover:(NSPopoverTouchBarItem*)item withSettings:settings];
  } else if (item_type == "segmented_control") {
    [self updateSegmentedControl:(NSCustomTouchBarItem*)item withSettings:settings];
  } else if (item_type == "scrubber") {
    [self updateScrubber:(NSCustomTouchBarItem*)item withSettings:settings];
  }
}

- (void)addNonDefaultTouchBarItems:(const std::vector<mate::PersistentDictionary>&)items {
  [self identifiersFromSettings:items];
}

- (void)setEscapeTouchBarItem:(const mate::PersistentDictionary&)item forTouchBar:(NSTouchBar*)touchBar {
  std::string type;
  std::string item_id;
  NSTouchBarItemIdentifier identifier = nil;
  if (item.Get("type", &type) && item.Get("id", &item_id)) {
    identifier = [self identifierFromID:item_id type:type];
  }
  if (identifier) {
    [self addNonDefaultTouchBarItems:{ item }];
    touchBar.escapeKeyReplacementItemIdentifier = identifier;
  } else {
    touchBar.escapeKeyReplacementItemIdentifier = nil;
  }
}

- (void)refreshTouchBarItem:(NSTouchBar*)touchBar
                         id:(const std::string&)item_id {
  if (![self hasItemWithID:item_id]) return;

  mate::PersistentDictionary settings = settings_[item_id];
  std::string item_type;
  settings.Get("type", &item_type);

  auto identifier = [self identifierFromID:item_id type:item_type];
  if (!identifier) return;

  std::vector<std::string> popover_ids;
  settings.Get("_popover", &popover_ids);
  for (auto& popover_id : popover_ids) {
    auto popoverIdentifier = [self identifierFromID:popover_id type:"popover"];
    if (!popoverIdentifier) continue;

    NSPopoverTouchBarItem* popoverItem =
        [touchBar itemForIdentifier:popoverIdentifier];
    [self refreshTouchBarItem:popoverItem.popoverTouchBar
                           id:identifier
                     withType:item_type
                 withSettings:settings];
  }

  [self refreshTouchBarItem:touchBar
                         id:identifier
                   withType:item_type
               withSettings:settings];
}

- (void)buttonAction:(id)sender {
  NSString* item_id = [NSString stringWithFormat:@"%ld", ((NSButton*)sender).tag];
  window_->NotifyTouchBarItemInteraction([item_id UTF8String],
                                         base::DictionaryValue());
}

- (void)colorPickerAction:(id)sender {
  NSString* identifier = ((NSColorPickerTouchBarItem*)sender).identifier;
  NSString* item_id = [self idFromIdentifier:identifier
                                  withPrefix:ColorPickerIdentifier];
  NSColor* color = ((NSColorPickerTouchBarItem*)sender).color;
  std::string hex_color = atom::ToRGBHex(skia::NSDeviceColorToSkColor(color));
  base::DictionaryValue details;
  details.SetString("color", hex_color);
  window_->NotifyTouchBarItemInteraction([item_id UTF8String], details);
}

- (void)sliderAction:(id)sender {
  NSString* identifier = ((NSSliderTouchBarItem*)sender).identifier;
  NSString* item_id = [self idFromIdentifier:identifier
                                  withPrefix:SliderIdentifier];
  base::DictionaryValue details;
  details.SetInteger("value",
                     [((NSSliderTouchBarItem*)sender).slider intValue]);
  window_->NotifyTouchBarItemInteraction([item_id UTF8String], details);
}

- (NSString*)idFromIdentifier:(NSString*)identifier
                  withPrefix:(NSString*)prefix {
  return [identifier substringFromIndex:[prefix length]];
}

- (void)segmentedControlAction:(id)sender {
  NSString* item_id = [NSString stringWithFormat:@"%ld", ((NSSegmentedControl*)sender).tag];
  base::DictionaryValue details;
  details.SetInteger("selectedIndex", ((NSSegmentedControl*)sender).selectedSegment);
  details.SetBoolean("isSelected", [((NSSegmentedControl*)sender) isSelectedForSegment:((NSSegmentedControl*)sender).selectedSegment]);
  window_->NotifyTouchBarItemInteraction([item_id UTF8String],
                                         details);
}

- (void)scrubber:(NSScrubber*)scrubber didSelectItemAtIndex:(NSInteger)selectedIndex {
  base::DictionaryValue details;
  details.SetInteger("selectedIndex", selectedIndex);
  details.SetString("type", "select");
  window_->NotifyTouchBarItemInteraction([scrubber.identifier UTF8String], details);
}

- (void)scrubber:(NSScrubber*)scrubber didHighlightItemAtIndex:(NSInteger)highlightedIndex {
  base::DictionaryValue details;
  details.SetInteger("highlightedIndex", highlightedIndex);
  details.SetString("type", "highlight");
  window_->NotifyTouchBarItemInteraction([scrubber.identifier UTF8String], details);
}

- (NSTouchBarItemIdentifier)identifierFromID:(const std::string&)item_id
                                        type:(const std::string&)type {
  NSTouchBarItemIdentifier base_identifier = nil;
  if (type == "button")
    base_identifier = ButtonIdentifier;
  else if (type == "label")
    base_identifier = LabelIdentifier;
  else if (type == "colorpicker")
    base_identifier = ColorPickerIdentifier;
  else if (type == "slider")
    base_identifier = SliderIdentifier;
  else if (type == "popover")
    base_identifier = PopoverIdentifier;
  else if (type == "group")
    base_identifier = GroupIdentifier;
  else if (type == "segmented_control")
    base_identifier = SegmentedControlIdentifier;
  else if (type == "scrubber")
    base_identifier = ScrubberIdentifier;

  if (base_identifier)
    return [NSString stringWithFormat:@"%@%s", base_identifier, item_id.data()];
  else
    return nil;
}

- (bool)hasItemWithID:(const std::string&)item_id {
  return settings_.find(item_id) != settings_.end();
}

- (NSColor*)colorFromHexColorString:(const std::string&)colorString {
  SkColor color = atom::ParseHexColor(colorString);
  return skia::SkColorToDeviceNSColor(color);
}

- (NSTouchBarItem*)makeButtonForID:(NSString*)id
                    withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSCustomTouchBarItem> item([[NSClassFromString(
      @"NSCustomTouchBarItem") alloc] initWithIdentifier:identifier]);
  NSButton* button = [NSButton buttonWithTitle:@""
                                        target:self
                                        action:@selector(buttonAction:)];
  button.tag = [id floatValue];
  [item setView:button];
  [self updateButton:item withSettings:settings];
  return item.autorelease();
}

- (void)updateButton:(NSCustomTouchBarItem*)item
        withSettings:(const mate::PersistentDictionary&)settings {
  NSButton* button = (NSButton*)item.view;

  std::string backgroundColor;
  if (settings.Get("backgroundColor", &backgroundColor)) {
    button.bezelColor = [self colorFromHexColorString:backgroundColor];
  }

  std::string label;
  settings.Get("label", &label);
  button.title = base::SysUTF8ToNSString(label);

  gfx::Image image;
  if (settings.Get("icon", &image)) {
    button.image = image.AsNSImage();

    std::string iconPosition;
    settings.Get("iconPosition", &iconPosition);
    if (iconPosition == "left") {
      button.imagePosition = NSImageLeft;
    } else if (iconPosition == "right") {
      button.imagePosition = NSImageRight;
    } else {
      button.imagePosition = NSImageOverlaps;
    }
  }
}

- (NSTouchBarItem*)makeLabelForID:(NSString*)id
                   withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSCustomTouchBarItem> item([[NSClassFromString(
      @"NSCustomTouchBarItem") alloc] initWithIdentifier:identifier]);
  [item setView:[NSTextField labelWithString:@""]];
  [self updateLabel:item withSettings:settings];
  return item.autorelease();
}

- (void)updateLabel:(NSCustomTouchBarItem*)item
       withSettings:(const mate::PersistentDictionary&)settings {
  NSTextField* text_field = (NSTextField*)item.view;

  std::string label;
  settings.Get("label", &label);
  text_field.stringValue = base::SysUTF8ToNSString(label);

  std::string textColor;
  if (settings.Get("textColor", &textColor) && !textColor.empty()) {
    text_field.textColor = [self colorFromHexColorString:textColor];
  } else {
    text_field.textColor = nil;
  }
}

- (NSTouchBarItem*)makeColorPickerForID:(NSString*)id
                         withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSColorPickerTouchBarItem> item([[NSClassFromString(
    @"NSColorPickerTouchBarItem") alloc] initWithIdentifier:identifier]);
  [item setTarget:self];
  [item setAction:@selector(colorPickerAction:)];
  [self updateColorPicker:item withSettings:settings];
  return item.autorelease();
}

- (void)updateColorPicker:(NSColorPickerTouchBarItem*)item
             withSettings:(const mate::PersistentDictionary&)settings {
  std::vector<std::string> colors;
  if (settings.Get("availableColors", &colors) && !colors.empty()) {
    NSColorList* color_list  = [[[NSColorList alloc] initWithName:@""] autorelease];
    for (size_t i = 0; i < colors.size(); ++i) {
      [color_list insertColor:[self colorFromHexColorString:colors[i]]
                          key:base::SysUTF8ToNSString(colors[i])
                      atIndex:i];
    }
     item.colorList = color_list;
  }

  std::string selectedColor;
  if (settings.Get("selectedColor", &selectedColor)) {
    item.color = [self colorFromHexColorString:selectedColor];
  }
}

- (NSTouchBarItem*)makeSliderForID:(NSString*)id
                    withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSSliderTouchBarItem> item([[NSClassFromString(
      @"NSSliderTouchBarItem") alloc] initWithIdentifier:identifier]);
  [item setTarget:self];
  [item setAction:@selector(sliderAction:)];
  [self updateSlider:item withSettings:settings];
  return item.autorelease();
}

- (void)updateSlider:(NSSliderTouchBarItem*)item
        withSettings:(const mate::PersistentDictionary&)settings {
  std::string label;
  settings.Get("label", &label);
  item.label = base::SysUTF8ToNSString(label);

  int maxValue = 100;
  int minValue = 0;
  int value = 50;
  settings.Get("minValue", &minValue);
  settings.Get("maxValue", &maxValue);
  settings.Get("value", &value);

  item.slider.minValue = minValue;
  item.slider.maxValue = maxValue;
  item.slider.doubleValue = value;
}

- (NSTouchBarItem*)makePopoverForID:(NSString*)id
                     withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSPopoverTouchBarItem> item([[NSClassFromString(
      @"NSPopoverTouchBarItem") alloc] initWithIdentifier:identifier]);
  [self updatePopover:item withSettings:settings];
  return item.autorelease();
}

- (void)updatePopover:(NSPopoverTouchBarItem*)item
         withSettings:(const mate::PersistentDictionary&)settings {
  std::string label;
  settings.Get("label", &label);
  item.collapsedRepresentationLabel = base::SysUTF8ToNSString(label);

  gfx::Image image;
  if (settings.Get("icon", &image)) {
    item.collapsedRepresentationImage = image.AsNSImage();
  }

  bool showCloseButton = true;
  settings.Get("showCloseButton", &showCloseButton);
  item.showsCloseButton = showCloseButton;

  mate::PersistentDictionary child;
  std::vector<mate::PersistentDictionary> items;
  if (settings.Get("child", &child) && child.Get("ordereredItems", &items)) {
    item.popoverTouchBar = [self touchBarFromItemIdentifiers:[self identifiersFromSettings:items]];
  }
}

- (NSTouchBarItem*)makeGroupForID:(NSString*)id
                   withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;
  mate::PersistentDictionary settings = settings_[s_id];

  mate::PersistentDictionary child;
  if (!settings.Get("child", &child)) return nil;
  std::vector<mate::PersistentDictionary> items;
  if (!child.Get("ordereredItems", &items)) return nil;

  NSMutableArray* generatedItems = [NSMutableArray array];
  NSMutableArray* identifiers = [self identifiersFromSettings:items];
  for (NSUInteger i = 0; i < [identifiers count]; ++i) {
    if ([identifiers objectAtIndex:i] != NSTouchBarItemIdentifierOtherItemsProxy) {
      NSTouchBarItem* generatedItem = [self makeItemForIdentifier:[identifiers objectAtIndex:i]];
      if (generatedItem) {
        [generatedItems addObject:generatedItem];
      }
    }
  }
  return [NSClassFromString(@"NSGroupTouchBarItem") groupItemWithIdentifier:identifier
                                                                      items:generatedItems];
}

- (NSTouchBarItem*)makeSegmentedControlForID:(NSString*)id
                              withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSCustomTouchBarItem> item([[NSClassFromString(
      @"NSCustomTouchBarItem") alloc] initWithIdentifier:identifier]);

  NSSegmentedControl* control = [NSSegmentedControl segmentedControlWithLabels:[NSMutableArray array]
                                        trackingMode:NSSegmentSwitchTrackingSelectOne
                                        target:self
                                        action:@selector(segmentedControlAction:)];
  control.tag = [id floatValue];
  [item setView:control];

  [self updateSegmentedControl:item withSettings:settings];
  return item.autorelease();
}

- (void)updateSegmentedControl:(NSCustomTouchBarItem*)item
                  withSettings:(const mate::PersistentDictionary&)settings {

  NSSegmentedControl* control = item.view;

  std::string segmentStyle;
  settings.Get("segmentStyle", &segmentStyle);
  if (segmentStyle == "rounded")
    control.segmentStyle = NSSegmentStyleRounded;
  else if (segmentStyle == "textured-rounded")
    control.segmentStyle = NSSegmentStyleTexturedRounded;
  else if (segmentStyle == "round-rect")
    control.segmentStyle = NSSegmentStyleRoundRect;
  else if (segmentStyle == "textured-square")
    control.segmentStyle = NSSegmentStyleTexturedSquare;
  else if (segmentStyle == "capsule")
    control.segmentStyle = NSSegmentStyleCapsule;
  else if (segmentStyle == "small-square")
    control.segmentStyle = NSSegmentStyleSmallSquare;
  else if (segmentStyle == "separated")
    control.segmentStyle = NSSegmentStyleSeparated;
  else
    control.segmentStyle = NSSegmentStyleAutomatic;

  std::string segmentMode;
  settings.Get("mode", &segmentMode);
  if (segmentMode == "multiple")
    control.trackingMode = NSSegmentSwitchTrackingSelectAny;
  else if (segmentMode == "buttons")
    control.trackingMode = NSSegmentSwitchTrackingMomentary;
  else
    control.trackingMode = NSSegmentSwitchTrackingSelectOne;

  std::vector<mate::Dictionary> segments;
  settings.Get("segments", &segments);

  control.segmentCount = segments.size();
  for (size_t i = 0; i < segments.size(); ++i) {
    std::string label;
    gfx::Image image;
    bool enabled = true;
    segments[i].Get("enabled", &enabled);
    if (segments[i].Get("label", &label)) {
      [control setLabel:base::SysUTF8ToNSString(label) forSegment:i];
    } else if (segments[i].Get("icon", &image)) {
      [control setImage:image.AsNSImage() forSegment:i];
      [control setImageScaling:NSImageScaleProportionallyUpOrDown forSegment:i];
    }
    [control setEnabled:enabled forSegment:i];
  }

  int selectedIndex = 0;
  settings.Get("selectedIndex", &selectedIndex);
  if (selectedIndex >= 0 && selectedIndex < control.segmentCount)
    control.selectedSegment = selectedIndex;
}

- (NSTouchBarItem*)makeScrubberForID:(NSString*)id
                     withIdentifier:(NSString*)identifier {
  std::string s_id([id UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  base::scoped_nsobject<NSCustomTouchBarItem> item([[NSClassFromString(
      @"NSCustomTouchBarItem") alloc] initWithIdentifier:identifier]);

  NSScrubber* scrubber = [[[NSClassFromString(@"NSScrubber") alloc] initWithFrame:NSZeroRect] autorelease];

  [scrubber registerClass:NSClassFromString(@"NSScrubberTextItemView") forItemIdentifier:TextScrubberItemIdentifier];
  [scrubber registerClass:NSClassFromString(@"NSScrubberImageItemView") forItemIdentifier:ImageScrubberItemIdentifier];

  scrubber.delegate = self;
  scrubber.dataSource = self;
  scrubber.identifier = id;

  [item setView:scrubber];
  [self updateScrubber:item withSettings:settings];

  return item.autorelease();
}

- (void)updateScrubber:(NSCustomTouchBarItem*)item
          withSettings:(const mate::PersistentDictionary&)settings {
  NSScrubber* scrubber = item.view;

  bool showsArrowButtons = false;
  settings.Get("showArrowButtons", &showsArrowButtons);
  scrubber.showsArrowButtons = showsArrowButtons;

  std::string selectedStyle;
  std::string overlayStyle;
  settings.Get("selectedStyle", &selectedStyle);
  settings.Get("overlayStyle", &overlayStyle);

  if (selectedStyle == "outline") {
    scrubber.selectionBackgroundStyle = [NSClassFromString(@"NSScrubberSelectionStyle") outlineOverlayStyle];
  } else if (selectedStyle == "background") {
    scrubber.selectionBackgroundStyle = [NSClassFromString(@"NSScrubberSelectionStyle") roundedBackgroundStyle];
  } else {
    scrubber.selectionBackgroundStyle = nil;
  }

  if (overlayStyle == "outline") {
    scrubber.selectionOverlayStyle = [NSClassFromString(@"NSScrubberSelectionStyle") outlineOverlayStyle];
  } else if (overlayStyle == "background") {
    scrubber.selectionOverlayStyle = [NSClassFromString(@"NSScrubberSelectionStyle") roundedBackgroundStyle];
  } else {
    scrubber.selectionOverlayStyle = nil;
  }

  std::string mode;
  settings.Get("mode", &mode);
  if (mode == "fixed") {
    scrubber.mode = NSScrubberModeFixed;
  } else {
    scrubber.mode = NSScrubberModeFree;
  }

  bool continuous = true;
  settings.Get("continuous", &continuous);
  scrubber.continuous = continuous;

  [scrubber reloadData];
}

- (NSInteger)numberOfItemsForScrubber:(NSScrubber*)scrubber {
  std::string s_id([[scrubber identifier] UTF8String]);
  if (![self hasItemWithID:s_id]) return 0;

  mate::PersistentDictionary settings = settings_[s_id];
  std::vector<mate::PersistentDictionary> items;
  settings.Get("items", &items);
  return items.size();
}

- (NSScrubberItemView*)scrubber:(NSScrubber*)scrubber
             viewForItemAtIndex:(NSInteger)index {
  std::string s_id([[scrubber identifier] UTF8String]);
  if (![self hasItemWithID:s_id]) return nil;

  mate::PersistentDictionary settings = settings_[s_id];
  std::vector<mate::PersistentDictionary> items;
  if (!settings.Get("items", &items)) return nil;

  if (index >= static_cast<NSInteger>(items.size())) return nil;

  mate::PersistentDictionary item = items[index];

  NSScrubberItemView* itemView;
  std::string title;

  if (item.Get("label", &title)) {
    NSScrubberTextItemView* view = [scrubber makeItemWithIdentifier:TextScrubberItemIdentifier
                                                              owner:self];
    view.title = base::SysUTF8ToNSString(title);
    itemView = view;
  } else {
    NSScrubberImageItemView* view = [scrubber makeItemWithIdentifier:ImageScrubberItemIdentifier
                                                               owner:self];
    gfx::Image image;
    if (item.Get("icon", &image)) {
      view.image = image.AsNSImage();
    }
    itemView = view;
  }

  return itemView;
}

@end
