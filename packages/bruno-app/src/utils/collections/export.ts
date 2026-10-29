import * as FileSaver from 'file-saver';
import { filterTransientItems } from 'utils/collections';
import type { BrunoItem, BrunoEnvironment, BrunoCollection } from './types';

export const deleteUidsInItems = (items?: BrunoItem[]): void => {
  if (!items || !items.length) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    delete (item as any).uid;

    if (['http-request', 'graphql-request', 'grpc-request'].includes(item.type)) {
      const req = item.request;
      if (req) {
        req.headers?.forEach((h: any) => delete h.uid);
        req.params?.forEach((p: any) => delete p.uid);
        req.vars?.req?.forEach((v: any) => delete v.uid);
        req.vars?.res?.forEach((v: any) => delete v.uid);
        req.vars?.assertions?.forEach((a: any) => delete a.uid);
        req.body?.multipartForm?.forEach((p: any) => delete p.uid);
        req.body?.formUrlEncoded?.forEach((p: any) => delete p.uid);
        req.body?.file?.forEach((p: any) => delete p.uid);
      }

      if (Array.isArray(item.examples)) {
        for (let j = 0; j < item.examples.length; j++) {
          const ex = item.examples[j];
          delete ex.uid;
          delete ex.itemUid;
          ex.request?.headers?.forEach((h: any) => delete h.uid);
          ex.request?.params?.forEach((p: any) => delete p.uid);
          ex.request?.body?.multipartForm?.forEach((p: any) => delete p.uid);
          ex.request?.body?.formUrlEncoded?.forEach((p: any) => delete p.uid);
          ex.request?.body?.file?.forEach((p: any) => delete p.uid);
          ex.response?.headers?.forEach((h: any) => delete h.uid);
        }
      }
    }

    if (item.items && item.items.length) {
      deleteUidsInItems(item.items);
    }
  }
};

/**
 * Some of the models in the app are not consistent with the Collection Json format.
 * This function is used to transform the models to the Collection Json format.
 */
export const transformItem = (items?: BrunoItem[]): void => {
  if (!items || !items.length) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (['http-request', 'graphql-request', 'grpc-request', 'ws-request'].includes(item.type)) {
      if (item.type === 'graphql-request') {
        item.type = 'graphql';
      } else if (item.type === 'http-request') {
        item.type = 'http';
      } else if (item.type === 'grpc-request') {
        item.type = 'grpc';
      } else if (item.type === 'ws-request') {
        item.type = 'ws';
      }
    }

    if (Array.isArray(item.examples)) {
      for (let j = 0; j < item.examples.length; j++) {
        const example = item.examples[j];
        if (example.type === 'graphql-request') {
          example.type = 'graphql';
        } else if (example.type === 'http-request') {
          example.type = 'http';
        } else if (example.type === 'grpc-request') {
          example.type = 'grpc';
        } else if (example.type === 'ws-request') {
          example.type = 'ws';
        }
      }
    }

    if (item.items && item.items.length) {
      transformItem(item.items);
    }
  }
};

export const deleteUidsInEnvs = (envs?: BrunoEnvironment[]): void => {
  if (!envs || !envs.length) return;
  for (let i = 0; i < envs.length; i++) {
    const env = envs[i];
    delete (env as any).uid;
    if (env.variables && env.variables.length) {
      for (let j = 0; j < env.variables.length; j++) {
        delete (env.variables[j] as any).uid;
      }
    }
  }
};

export const deleteSecretsInEnvs = (envs?: BrunoEnvironment[]): void => {
  if (!envs || !envs.length) return;
  for (let i = 0; i < envs.length; i++) {
    const env = envs[i];
    if (env.variables && env.variables.length) {
      for (let j = 0; j < env.variables.length; j++) {
        if (env.variables[j].secret) {
          env.variables[j].value = '';
        }
      }
    }
  }
};

export const prepareCollectionForExport = (collection: BrunoCollection, version?: string): BrunoCollection => {
  delete (collection as any).uid;
  delete (collection as any).processEnvVariables;
  delete (collection as any).workspaceProcessEnvVariables;

  collection.items = filterTransientItems(collection.items);

  deleteUidsInItems(collection.items);
  deleteUidsInEnvs(collection.environments);
  deleteSecretsInEnvs(collection.environments);
  transformItem(collection.items);

  (collection as any).exportedAt = new Date().toISOString();
  (collection as any).exportedUsing = version ? `Bruno/${version}` : 'Bruno';

  return collection;
};

export const exportCollection = (collection: BrunoCollection, version?: string): void => {
  prepareCollectionForExport(collection, version);

  const fileName = `${collection.name}.json`;
  const fileBlob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });

  FileSaver.saveAs(fileBlob, fileName);
};

export default exportCollection;
