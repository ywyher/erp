'use client';

import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';

export const deletePlugins = [
  // Instead of deleting right away it will select it first
  SelectOnBackspacePlugin.configure({
    options: {
      query: {
        allow: [
          ImagePlugin.key,
          VideoPlugin.key,
          AudioPlugin.key,
          FilePlugin.key,
          MediaEmbedPlugin.key,
          HorizontalRulePlugin.key,
        ],
      },
    },
  }),
  DeletePlugin,
] as const;
