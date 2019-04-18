import React from 'react'
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor'
import PropTypes from 'prop-types'

const EditorDiff = ({ language, code, diffCode, onChange }) => {
  const options = {
    renderSideBySide: true,
    minimap: { enabled: false }
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
  const options = {
    minimap: { enabled: false }
  }
  return (
    <MonacoEditor
      language={language}
      theme='vs-dark'
      value={code}
      onChange={onChange}
      options={options}
    />
  )
}

Editor.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export { Editor, EditorDiff }
