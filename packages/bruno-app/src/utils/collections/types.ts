export type BrunoItemType =
  | 'http-request'
  | 'graphql-request'
  | 'grpc-request'
  | 'ws-request'
  | 'folder'
  | 'app'
  | string;

export interface BrunoItem {
  uid: string;
  name: string;
  type: BrunoItemType;
  pathname?: string;
  items?: BrunoItem[];
  collapsed?: boolean;
  loading?: boolean;
  partial?: boolean;
  isTransient?: boolean;
  seq?: number;
  request?: Record<string, any>;
  draft?: Record<string, any>;
  [key: string]: any;
}

export interface BrunoFolderItem extends BrunoItem {
  type: 'folder';
  items: BrunoItem[];
}

export interface BrunoRequestItem extends BrunoItem {
  type: 'http-request' | 'graphql-request' | 'grpc-request' | 'ws-request';
}

export interface BrunoEnvironment {
  uid: string;
  name: string;
  variables?: Array<{
    uid: string;
    name: string;
    value: string;
    type: string;
    enabled: boolean;
    secret?: boolean;
  }>;
  color?: string | null;
}

export interface BrunoCollection {
  uid: string;
  name: string;
  pathname?: string;
  items: BrunoItem[];
  environments?: BrunoEnvironment[];
  collapsed?: boolean;
  mountStatus?: 'mounting' | 'mounted' | 'unmounted' | string;
  isLoading?: boolean;
  root?: Record<string, any>;
  brunoConfig?: Record<string, any>;
  globalEnvironmentVariables?: Record<string, any>;
  globalEnvSecrets?: Record<string, any>;
  globalEnvironments?: any[];
  activeGlobalEnvironmentUid?: string | null;
  [key: string]: any;
}

export type SidebarRowKind = 'header' | 'folder' | 'request' | 'app' | 'example' | 'empty-cta' | 'ghost';

export interface SidebarRow {
  id: string;
  kind: SidebarRowKind;
  depth: number;
  collectionUid: string;
  collectionPathname?: string;
  collectionId?: string;
  parentName?: string | null;
  itemUid?: string;
  exampleUid?: string;
  sortName?: string | null;
  [key: string]: any;
}
