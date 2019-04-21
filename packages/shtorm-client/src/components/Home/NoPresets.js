import React from 'react'
import { Typography } from '@material-ui/core'

export default function NoPresets () {
  return (
    <div className='preset-selector-presets-empty spotlight'>
      <Typography variant='h6'>Haven{'\''}t you started already?</Typography>
      <Typography variant='subtitle1'>Simplify your workflow by creating presets.</Typography>
    </div>
  )
}
