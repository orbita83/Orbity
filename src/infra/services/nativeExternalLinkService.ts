import { Linking } from "react-native";
import { ExternalLinkServiceError } from "@/model/errors";
import type { IExternalLinkService } from "@/model/services/iExternalLinkService";

export class NativeExternalLinkService implements IExternalLinkService {
  async open(url: string): Promise<void> {
    try {
      await Linking.openURL(url);
    } catch {
      throw new ExternalLinkServiceError();
    }
  }
}
