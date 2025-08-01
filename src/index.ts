import type { CollectionSlug, Config } from 'payload'

import { importEndpoint } from './endpoints/import.js'

// import { importEndpoint } from './endpoints/import.js'

export type PayloadExtendedImportExportPluginConfig = {
  collections: CollectionSlug[]
  enabled?: boolean
}

export const payloadExtendedImportExportPlugin =
  (pluginOptions: PayloadExtendedImportExportPluginConfig) =>
  (incomingConfig: Config): Config => {
    // create copy of incoming config
    const config = { ...incomingConfig }
    if (!config.collections) {
      config.collections = []
    }

    // Добавляем endpoint для импорта
    config.endpoints = [...(config.endpoints || []), importEndpoint]

    // Добавляем кнопку импорта к коллекциям
    if (config.collections && pluginOptions.collections) {
      config.collections = config.collections.map((collection) => {
        if (
          pluginOptions.collections.includes(collection.slug) ||
          pluginOptions.collections.length === 0
        ) {
          return {
            ...collection,
            admin: {
              ...collection.admin,
              components: {
                ...collection.admin?.components,
                listMenuItems: [
                  ...(collection.admin?.components?.listMenuItems || []),
                  {
                    exportName: 'ImportButton',
                    path: 'payload-extended-import-export-plugin/rsc',
                  },
                ],
              },
            },
          }
        }
        return collection
      })
    }

    // If you wanted to add to the onInit:
    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }
    }

    // Finally, return the modified config
    return config
  }
