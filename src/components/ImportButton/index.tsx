'use server'

import type { I18nServer } from '@payloadcms/translations'
import type { Collection, Payload } from 'payload'

import React from 'react'

import { extractCollectionFields } from '../../utils/collection-fields.js'
import ImportButton from './ImportButton.js'

const ImportButtonServer = async (req: {
  collectionConfig: Collection['config']
  i18n: I18nServer
  payload: Payload
}) => {
  const collectionSlug = req.collectionConfig.slug
  const collectionName =
    (req.collectionConfig.labels.plural as any)[req.i18n.language] ||
    (req.collectionConfig.labels.plural as any).en

  // Извлекаем только сериализуемые данные о полях
  const collectionFields = extractCollectionFields(req.collectionConfig)

  return (
    <ImportButton
      collection={collectionSlug}
      collectionFields={collectionFields}
      collectionName={collectionName}
    />
  )
}

export default ImportButtonServer
