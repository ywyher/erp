'use client';

import React, { useState } from 'react';

import { withRef } from '@udecode/cn';
import { getMentionOnSelectItem } from '@udecode/plate-mention';
import { PlateElement } from '@udecode/plate/react';
import { useQuery } from '@tanstack/react-query';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';
import { listPeopleToMention } from '@/components/editor/actions';

const onSelectItem = getMentionOnSelectItem();

export const MentionInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;
    const [search, setSearch] = useState('');

    // Fetch doctors data using React Query
    const { data: mentionables = [], isLoading } = useQuery({
      queryKey: ['mention-doctors-plugin'],
      queryFn: async () => {
        return await listPeopleToMention();
      }
    });

    return (
      <PlateElement
        ref={ref}
        as="span"
        className={className}
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          value={search}
          element={element}
          setValue={setSearch}
          showTrigger={false}
          trigger="@"
        >
          <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring focus-within:ring-2">
            <InlineComboboxInput />
          </span>

          <InlineComboboxContent className="my-1.5">
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <InlineComboboxEmpty>No results</InlineComboboxEmpty>

                <InlineComboboxGroup>
                  {mentionables.map((item) => (
                    <InlineComboboxItem
                      key={item.key}
                      value={item.text}
                      onClick={() => onSelectItem(editor, item, search)}
                    >
                      {item.text}
                    </InlineComboboxItem>
                  ))}
                </InlineComboboxGroup>
              </>
            )}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);