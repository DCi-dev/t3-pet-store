import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'pet-store',

  projectId: 'ynkjutes',
  dataset: 'production',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
