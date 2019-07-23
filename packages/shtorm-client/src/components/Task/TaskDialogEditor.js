import React from 'react'
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor'
import PropTypes from 'prop-types'

const baseOptions = {
  minimap: { enabled: false },
  wordWrap: 'on'
}

const EditorDiff = ({ language, code, diffCode, onChange }) => {
  const options = {
    renderSideBySide: true,
    ...baseOptions
  }

  return (
    <MonacoDiffEditor
      language={language}
      theme='vs-dark'
      original={code}
      value={diffCode}
      onChange={onChange}
      options={options}
    />
  )
}

EditorDiff.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  diffCode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

const Editor = ({ language, code, onChange }) => {
  return (
    <MonacoEditor
      language={language}
      theme='vs-dark'
      value={code}
      onChange={onChange}
      options={baseOptions}
    />
  )
}

Editor.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export { Editor, EditorDiff }
