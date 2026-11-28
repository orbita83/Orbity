import { PRIVACY_POLICY_URL } from "@/model/entities/privacyPolicy";
import type { IExternalLinkService } from "@/model/services/iExternalLinkService";
import type { IPrivacyUseCases } from "@/usecase/iPrivacyUseCases";

export class PrivacyUseCases implements IPrivacyUseCases {
  constructor(private readonly externalLinks: IExternalLinkService) {}

  async openPolicy(): Promise<void> {
    await this.externalLinks.open(PRIVACY_POLICY_URL);
  }
}
