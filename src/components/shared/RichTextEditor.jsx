import Editor, { EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList, BtnNumberedList } from 'react-simple-wysiwyg'

export function RichTextEditor({ value, onChange, className = 'rich-text-editor', placeholder }) {
  return (
    <EditorProvider>
      <Editor
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        containerProps={{ className }}
      >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList />
          <BtnNumberedList />
        </Toolbar>
      </Editor>
    </EditorProvider>
  )
}
