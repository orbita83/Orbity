export interface IExternalLinkService {
  open(url: string): Promise<void>;
}
