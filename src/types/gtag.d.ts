interface Window {
  gtag: (
    command: 'event',
    action: string,
    params: {
      method?: string;
      content_type?: string;
      content_ids?: string[];
      [key: string]: any;
    }
  ) => void;
}
