import React from 'react'
import { Typography } from '@material-ui/core'

export const NoProjectsCreatePrompt = () => (
  <div className='projects-list-empty spotlight'>
    <Typography variant='h6'>Haven{'\''}t you started already?</Typography>
    <Typography variant='subtitle1'>You have no projects currently. Simplify your workflow by creating ones.</Typography>
  </div>
)

export const NoProjects = () => (
  <div className='projects-list-empty spotlight'>
    <Typography variant='h6'>Nothing to do here...</Typography>
    <Typography variant='subtitle1'>You have no projects assigned currently.</Typography>
  </div>
)
