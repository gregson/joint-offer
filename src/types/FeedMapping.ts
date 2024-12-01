export interface FeedMapping {
  format: string;
  rootPath?: string;
  idMapping: {
    fields: string[];
    separator: string;
    normalize?: boolean;
    transformers?: {
      [key: string]: string;
    };
  };
  fieldMappings: {
    [key: string]: any;
  };
}
