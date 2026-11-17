import { ProfilePlaceholderScreen } from "./components/ProfilePlaceholderScreen";
import { useSettingsViewModel } from "../viewmodel/useSettingsViewModel";

const SettingsScreen = () => {
  const { handleReturnToProfile } = useSettingsViewModel();

  return <ProfilePlaceholderScreen title="Configurações" onReturn={handleReturnToProfile} />;
};

export default SettingsScreen;
