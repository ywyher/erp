'use client';

import { Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor placeholder="Type..." />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}
