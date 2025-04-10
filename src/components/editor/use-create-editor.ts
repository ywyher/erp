'use client';

import { FixedToolbarPlugin } from '@/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/components/editor/plugins/floating-toolbar-plugin';
import { withProps } from '@udecode/cn';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import {
  ParagraphPlugin,
  PlateLeaf,
  RenderNodeWrapper,
  usePlateEditor,
} from '@udecode/plate/react';
import { autoformatPlugin } from '@/components/editor/plugins/auto-format-plugin';
import { basicNodesPlugins } from '@/components/editor/plugins/basic-nodes-plugin';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { AudioPlugin, FilePlugin, ImagePlugin, MediaEmbedPlugin, PlaceholderPlugin, VideoPlugin } from '@udecode/plate-media/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { LinkElement } from '@/components/plate-ui/link-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { MediaVideoElement } from '@/components/plate-ui/media-video-element';
import { TocElement } from '@/components/plate-ui/toc-element';
import { MentionInputPlugin, MentionPlugin } from '@udecode/plate-mention/react';
import { MentionElement } from '@/components/plate-ui/mention-element';
import { EmojiInputPlugin, EmojiPlugin } from '@udecode/plate-emoji/react';
import { EmojiInputElement } from '@/components/plate-ui/emoji-input-element';
import { MentionInputElement } from '@/components/plate-ui/mention-input-element';
import { SlashPlugin, SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { SlashInputElement } from '@/components/plate-ui/slash-input-element';
import { DatePlugin } from '@udecode/plate-date/react';
import { DateElement } from '@/components/plate-ui/date-element';
import { linkPlugin } from '@/components/editor/plugins/link-plugin';
import { tablePlugin } from '@/components/editor/plugins/table-plugin';
import emojiMartData, { EmojiMartData } from '@emoji-mart/data';
import { tocPlugin } from '@/components/editor/plugins/toc-plugin';
import { suggestionPlugin } from '@/components/editor/plugins/suggestion-plugin';
import { SuggestionBelowNodes } from '@/components/plate-ui/suggestion-line-break';
import { EquationPlugin, InlineEquationPlugin } from '@udecode/plate-math/react';
import { EquationElement } from '@/components/plate-ui/equation-element';
import { InlineEquationElement } from '@/components/plate-ui/inline-equation-element';
import { lineHeightPlugin } from '@/components/editor/plugins/line-height-plugin';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { ToggleElement } from '@/components/plate-ui/toggle-element';
import { mediaPlugins } from '@/components/editor/plugins/media-plugins';
import { MediaPlaceholderElement } from '@/components/plate-ui/media-placeholder-element';
import { MediaAudioElement } from '@/components/plate-ui/media-audio-element';
import { MediaFileElement } from '@/components/plate-ui/media-file-element';
import { MediaEmbedElement } from '@/components/plate-ui/media-embed-element';
import { FontBackgroundColorPlugin, FontColorPlugin, FontSizePlugin } from '@udecode/plate-font/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { cursorOverlayPlugin } from '@/components/editor/plugins/cursor-overlay-plugin';
import { dndPlugins } from '@/components/editor/plugins/dnd-plugins';
import { indentListPlugins } from '@/components/editor/plugins/indent-list-plugins';
import { AnyPluginConfig, PluginConfig, Value, WithAnyKey } from '@udecode/plate';
import { JuicePlugin } from '@udecode/plate-juice';
import { DocxPlugin } from '@udecode/plate-docx';
import { CsvPlugin } from '@udecode/plate-csv';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { deletePlugins } from '@/components/editor/plugins/delete-plugins';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

const components = {
  [BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
  [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
  [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
  [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
  [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
  [HorizontalRulePlugin.key]: HrElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
  [LinkPlugin.key]: LinkElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
  [TocPlugin.key]: TocElement, // /toc
  [EmojiInputPlugin.key]: EmojiInputElement,
  [MentionPlugin.key]: MentionElement,
  [MentionInputPlugin.key]: MentionInputElement,
  [DatePlugin.key]: DateElement,
  [SlashInputPlugin.key]: SlashInputElement,
  [EquationPlugin.key]: EquationElement,
  [InlineEquationPlugin.key]: InlineEquationElement,
  [HighlightPlugin.key]: HighlightLeaf, // add custom color later
  [TogglePlugin.key]: ToggleElement,

  [ImagePlugin.key]: ImageElement,
  [PlaceholderPlugin.key]: MediaPlaceholderElement,
  [VideoPlugin.key]: MediaVideoElement,
  [AudioPlugin.key]: MediaAudioElement,
  [FilePlugin.key]: MediaFileElement,
  [MediaEmbedPlugin.key]: MediaEmbedElement,

  // [TableCellHeaderPlugin.key]: TableCellHeaderElement,
  // [TableCellPlugin.key]: TableCellElement,
  // [TablePlugin.key]: TableElement,
  // [TableRowPlugin.key]: TableRowElement,
  // [VideoPlugin.key]: MediaVideoElement,
}

export const plugins = [
  ...basicNodesPlugins,
  HorizontalRulePlugin,
  linkPlugin,
  // tablePlugin,
  EmojiPlugin.configure({ options: { data: emojiMartData as EmojiMartData } }),
  MentionPlugin,
  DatePlugin,
  tocPlugin,
  SlashPlugin,
  // Need for the slash plugin to work
  suggestionPlugin.configure({
    render: { belowNodes: SuggestionBelowNodes as RenderNodeWrapper<WithAnyKey<PluginConfig<"suggestion">>> },
  }),
  EquationPlugin,
  InlineEquationPlugin,
  tablePlugin,
  HighlightPlugin,
  BlockSelectionPlugin,

  ...indentListPlugins,

  NodeIdPlugin,
  TogglePlugin,
  ...mediaPlugins,
  ColumnPlugin,
  cursorOverlayPlugin,

  lineHeightPlugin,
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
  HighlightPlugin,

  DocxPlugin,
  JuicePlugin,
  CsvPlugin,
  MarkdownPlugin,
  ...deletePlugins,

  // Needed to prevent some issues
  TrailingBlockPlugin,

  FloatingToolbarPlugin,
  ParagraphPlugin,
  AlignPlugin.configure({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        HeadingPlugin.key,
      ],
    }
   }),
   autoformatPlugin,
] as const;

export const useCreateEditor = (
  { value, readOnly = false }: { value?: Value, readOnly?: boolean },
  deps: unknown[] = []
) => {
  return usePlateEditor(
    {
      value: value ? value : undefined,
      override: {
        components: {
          ...components,
        }
      },
      plugins: [
        ...plugins,
        !readOnly ? FixedToolbarPlugin : undefined,
        ...(!readOnly ? dndPlugins : []),
      ].filter(Boolean) as AnyPluginConfig[],
    },
    deps // Pass the deps array to usePlateEditor
  );
};